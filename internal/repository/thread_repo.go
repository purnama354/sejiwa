package repository

import (
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ThreadRepository defines the interface for thread data operations
type ThreadRepository interface {
	Create(thread *models.Thread) error
	FindByID(id uuid.UUID) (*models.Thread, error)
	FindByIDWithDetails(id uuid.UUID) (*models.Thread, error)
	Update(thread *models.Thread) error
	Delete(id uuid.UUID) error
	FindAll(offset, limit int) ([]models.Thread, int64, error)
	FindByCategory(categoryID uuid.UUID, offset, limit int) ([]models.Thread, int64, error)
	FindByAuthor(authorID uuid.UUID, offset, limit int) ([]models.Thread, int64, error)
	Search(query string, offset, limit int) ([]models.Thread, int64, error)
	IncrementViewCount(id uuid.UUID) error
	IncrementReplyCount(id uuid.UUID) error
	DecrementReplyCount(id uuid.UUID) error
	UpdateLastReplyAt(id uuid.UUID) error
	FindPinned(offset, limit int) ([]models.Thread, int64, error)
}

type threadRepository struct {
	db *gorm.DB
}

// NewThreadRepository creates a new instance of ThreadRepository
func NewThreadRepository(db *gorm.DB) ThreadRepository {
	return &threadRepository{db: db}
}

// Create inserts a new thread record into the database
func (r *threadRepository) Create(thread *models.Thread) error {
	return r.db.Create(thread).Error
}

// FindByID retrieves a thread by its UUID
func (r *threadRepository) FindByID(id uuid.UUID) (*models.Thread, error) {
	var thread models.Thread
	err := r.db.Where("id = ?", id).First(&thread).Error
	if err != nil {
		return nil, err
	}
	return &thread, nil
}

// FindByIDWithDetails retrieves a thread with author and category details
func (r *threadRepository) FindByIDWithDetails(id uuid.UUID) (*models.Thread, error) {
	var thread models.Thread
	err := r.db.Preload("Author").Preload("Category").Where("id = ?", id).First(&thread).Error
	if err != nil {
		return nil, err
	}
	return &thread, nil
}

// Update modifies an existing thread
func (r *threadRepository) Update(thread *models.Thread) error {
	return r.db.Save(thread).Error
}

// Delete soft-deletes a thread by ID
func (r *threadRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Thread{}, id).Error
}

// FindAll retrieves threads with pagination, ordered by creation date (newest first)
func (r *threadRepository) FindAll(offset, limit int) ([]models.Thread, int64, error) {
	var threads []models.Thread
	var total int64

	// Get total count
	if err := r.db.Model(&models.Thread{}).Where("moderation_status != ?", models.ModerationStatusDeleted).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get threads with preloaded relationships
	err := r.db.Preload("Author").Preload("Category").
		Where("moderation_status != ?", models.ModerationStatusDeleted).
		Order("is_pinned DESC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&threads).Error

	return threads, total, err
}

// FindByCategory retrieves threads by category with pagination
func (r *threadRepository) FindByCategory(categoryID uuid.UUID, offset, limit int) ([]models.Thread, int64, error) {
	var threads []models.Thread
	var total int64

	// Get total count
	if err := r.db.Model(&models.Thread{}).
		Where("category_id = ? AND moderation_status != ?", categoryID, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get threads
	err := r.db.Preload("Author").Preload("Category").
		Where("category_id = ? AND moderation_status != ?", categoryID, models.ModerationStatusDeleted).
		Order("is_pinned DESC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&threads).Error

	return threads, total, err
}

// FindByAuthor retrieves threads by author with pagination
func (r *threadRepository) FindByAuthor(authorID uuid.UUID, offset, limit int) ([]models.Thread, int64, error) {
	var threads []models.Thread
	var total int64

	// Get total count
	if err := r.db.Model(&models.Thread{}).
		Where("author_id = ? AND moderation_status != ?", authorID, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get threads
	err := r.db.Preload("Author").Preload("Category").
		Where("author_id = ? AND moderation_status != ?", authorID, models.ModerationStatusDeleted).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&threads).Error

	return threads, total, err
}

// Search performs full-text search on thread titles and content
func (r *threadRepository) Search(query string, offset, limit int) ([]models.Thread, int64, error) {
	var threads []models.Thread
	var total int64

	searchQuery := "%" + query + "%"

	// Get total count
	if err := r.db.Model(&models.Thread{}).
		Where("(title ILIKE ? OR content ILIKE ?) AND moderation_status != ?",
			searchQuery, searchQuery, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get threads
	err := r.db.Preload("Author").Preload("Category").
		Where("(title ILIKE ? OR content ILIKE ?) AND moderation_status != ?",
			searchQuery, searchQuery, models.ModerationStatusDeleted).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&threads).Error

	return threads, total, err
}

// IncrementViewCount increments the view count for a thread
func (r *threadRepository) IncrementViewCount(id uuid.UUID) error {
	return r.db.Model(&models.Thread{}).
		Where("id = ?", id).
		Update("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrementReplyCount increments the reply count for a thread
func (r *threadRepository) IncrementReplyCount(id uuid.UUID) error {
	return r.db.Model(&models.Thread{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"reply_count":   gorm.Expr("reply_count + 1"),
			"last_reply_at": gorm.Expr("NOW()"),
		}).Error
}

// DecrementReplyCount decrements the reply count for a thread
func (r *threadRepository) DecrementReplyCount(id uuid.UUID) error {
	return r.db.Model(&models.Thread{}).
		Where("id = ?", id).
		Update("reply_count", gorm.Expr("reply_count - 1")).Error
}

// UpdateLastReplyAt updates the last reply timestamp for a thread
func (r *threadRepository) UpdateLastReplyAt(id uuid.UUID) error {
	return r.db.Model(&models.Thread{}).
		Where("id = ?", id).
		Update("last_reply_at", gorm.Expr("NOW()")).Error
}

// FindPinned retrieves pinned threads
func (r *threadRepository) FindPinned(offset, limit int) ([]models.Thread, int64, error) {
	var threads []models.Thread
	var total int64

	// Get total count
	if err := r.db.Model(&models.Thread{}).
		Where("is_pinned = ? AND moderation_status != ?", true, models.ModerationStatusDeleted).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get threads
	err := r.db.Preload("Author").Preload("Category").
		Where("is_pinned = ? AND moderation_status != ?", true, models.ModerationStatusDeleted).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&threads).Error

	return threads, total, err
}
