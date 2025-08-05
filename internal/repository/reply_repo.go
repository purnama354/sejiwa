package repository

import (
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ReplyRepository defines the interface for reply data operations
type ReplyRepository interface {
	Create(reply *models.Reply) error
	FindByID(id uuid.UUID) (*models.Reply, error)
	FindByIDWithDetails(id uuid.UUID) (*models.Reply, error)
	Update(reply *models.Reply) error
	Delete(id uuid.UUID) error
	FindByThread(threadID uuid.UUID, offset, limit int) ([]models.Reply, int64, error)
	FindByAuthor(authorID uuid.UUID, offset, limit int) ([]models.Reply, int64, error)
	FindByThreadWithNesting(threadID uuid.UUID, offset, limit int) ([]models.Reply, int64, error)
	CountByThread(threadID uuid.UUID) (int64, error)
	FindChildReplies(parentID uuid.UUID) ([]models.Reply, error)
}

type replyRepository struct {
	db *gorm.DB
}

// NewReplyRepository creates a new instance of ReplyRepository
func NewReplyRepository(db *gorm.DB) ReplyRepository {
	return &replyRepository{db: db}
}

// Create inserts a new reply record into the database
func (r *replyRepository) Create(reply *models.Reply) error {
	return r.db.Create(reply).Error
}

// FindByID retrieves a reply by its UUID
func (r *replyRepository) FindByID(id uuid.UUID) (*models.Reply, error) {
	var reply models.Reply
	err := r.db.Where("id = ?", id).First(&reply).Error
	if err != nil {
		return nil, err
	}
	return &reply, nil
}

// FindByIDWithDetails retrieves a reply with author and thread details
func (r *replyRepository) FindByIDWithDetails(id uuid.UUID) (*models.Reply, error) {
	var reply models.Reply
	err := r.db.Preload("Author").Preload("Thread").Preload("ParentReply.Author").
		Where("id = ?", id).First(&reply).Error
	if err != nil {
		return nil, err
	}
	return &reply, nil
}

// Update modifies an existing reply
func (r *replyRepository) Update(reply *models.Reply) error {
	return r.db.Save(reply).Error
}

// Delete soft-deletes a reply by ID
func (r *replyRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Reply{}, id).Error
}

// FindByThread retrieves replies for a specific thread with pagination
func (r *replyRepository) FindByThread(threadID uuid.UUID, offset, limit int) ([]models.Reply, int64, error) {
	var replies []models.Reply
	var total int64

	// Get total count
	if err := r.db.Model(&models.Reply{}).
		Where("thread_id = ? AND moderation_status != ?", threadID, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get replies with preloaded relationships
	err := r.db.Preload("Author").Preload("ParentReply.Author").
		Where("thread_id = ? AND moderation_status != ?", threadID, models.ModerationStatusDeleted).
		Order("created_at ASC").
		Offset(offset).Limit(limit).
		Find(&replies).Error

	return replies, total, err
}

// FindByAuthor retrieves replies by author with pagination
func (r *replyRepository) FindByAuthor(authorID uuid.UUID, offset, limit int) ([]models.Reply, int64, error) {
	var replies []models.Reply
	var total int64

	// Get total count
	if err := r.db.Model(&models.Reply{}).
		Where("author_id = ? AND moderation_status != ?", authorID, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get replies
	err := r.db.Preload("Author").Preload("Thread").
		Where("author_id = ? AND moderation_status != ?", authorID, models.ModerationStatusDeleted).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&replies).Error

	return replies, total, err
}

// FindByThreadWithNesting retrieves replies with nested structure
func (r *replyRepository) FindByThreadWithNesting(threadID uuid.UUID, offset, limit int) ([]models.Reply, int64, error) {
	var replies []models.Reply
	var total int64

	// Get total count of top-level replies only
	if err := r.db.Model(&models.Reply{}).
		Where("thread_id = ? AND parent_reply_id IS NULL AND moderation_status != ?",
			threadID, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get top-level replies with their children
	err := r.db.Preload("Author").
		Preload("ChildReplies", func(db *gorm.DB) *gorm.DB {
			return db.Where("moderation_status != ?", models.ModerationStatusDeleted).
				Order("created_at ASC").
				Preload("Author")
		}).
		Where("thread_id = ? AND parent_reply_id IS NULL AND moderation_status != ?",
			threadID, models.ModerationStatusDeleted).
		Order("created_at ASC").
		Offset(offset).Limit(limit).
		Find(&replies).Error

	return replies, total, err
}

// CountByThread counts total replies for a thread
func (r *replyRepository) CountByThread(threadID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Reply{}).
		Where("thread_id = ? AND moderation_status != ?", threadID, models.ModerationStatusDeleted).
		Count(&count).Error
	return count, err
}

// FindChildReplies retrieves all child replies for a parent reply
func (r *replyRepository) FindChildReplies(parentID uuid.UUID) ([]models.Reply, error) {
	var replies []models.Reply
	err := r.db.Preload("Author").
		Where("parent_reply_id = ? AND moderation_status != ?", parentID, models.ModerationStatusDeleted).
		Order("created_at ASC").
		Find(&replies).Error
	return replies, err
}
