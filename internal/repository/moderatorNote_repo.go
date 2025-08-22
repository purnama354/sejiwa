package repository

import (
	"github.com/google/uuid"
	"github.com/purnama354/sejiwa-api/internal/models"
	"gorm.io/gorm"
)

type ModeratorNoteRepository struct {
	db *gorm.DB
}

func NewModeratorNoteRepository(db *gorm.DB) *ModeratorNoteRepository {
	return &ModeratorNoteRepository{db: db}
}

func (r *ModeratorNoteRepository) Create(note *models.ModeratorNote) error {
	return r.db.Create(note).Error
}

func (r *ModeratorNoteRepository) GetByUserID(userID uuid.UUID, limit, offset int) ([]models.ModeratorNote, int64, error) {
	var notes []models.ModeratorNote
	var total int64

	// Count total
	if err := r.db.Model(&models.ModeratorNote{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get notes with moderator info
	err := r.db.Preload("Moderator").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notes).Error

	return notes, total, err
}

func (r *ModeratorNoteRepository) GetByID(id uuid.UUID) (*models.ModeratorNote, error) {
	var note models.ModeratorNote
	err := r.db.Preload("Moderator").
		Where("id = ?", id).
		First(&note).Error
	return &note, err
}

func (r *ModeratorNoteRepository) Delete(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&models.ModeratorNote{}).Error
}

func (r *ModeratorNoteRepository) GetByModeratorID(moderatorID uuid.UUID, limit, offset int) ([]models.ModeratorNote, int64, error) {
	var notes []models.ModeratorNote
	var total int64

	// Count total
	if err := r.db.Model(&models.ModeratorNote{}).Where("moderator_id = ?", moderatorID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get notes with user info
	err := r.db.Preload("User").
		Where("moderator_id = ?", moderatorID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notes).Error

	return notes, total, err
}
