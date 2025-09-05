package repository

import (
    "github.com/google/uuid"
    "github.com/purnama354/sejiwa-api/internal/models"
    "gorm.io/gorm"
)

type SavedThreadRepository interface {
    Save(userID, threadID uuid.UUID) error
    Unsave(userID, threadID uuid.UUID) error
    ListByUser(userID uuid.UUID, offset, limit int) ([]models.SavedThread, int64, error)
    IsSaved(userID, threadID uuid.UUID) (bool, error)
}

type savedThreadRepository struct { db *gorm.DB }

func NewSavedThreadRepository(db *gorm.DB) SavedThreadRepository { return &savedThreadRepository{db: db} }

func (r *savedThreadRepository) Save(userID, threadID uuid.UUID) error {
    st := &models.SavedThread{UserID: userID, ThreadID: threadID}
    return r.db.FirstOrCreate(st, "user_id = ? AND thread_id = ?", userID, threadID).Error
}

func (r *savedThreadRepository) Unsave(userID, threadID uuid.UUID) error {
    return r.db.Where("user_id = ? AND thread_id = ?", userID, threadID).Delete(&models.SavedThread{}).Error
}

func (r *savedThreadRepository) ListByUser(userID uuid.UUID, offset, limit int) ([]models.SavedThread, int64, error) {
    var saved []models.SavedThread
    var total int64
    q := r.db.Model(&models.SavedThread{}).Where("user_id = ?", userID)
    if err := q.Count(&total).Error; err != nil { return nil, 0, err }
    err := r.db.Preload("Thread").Preload("Thread.Category").
        Where("user_id = ?", userID).Order("created_at DESC").Offset(offset).Limit(limit).Find(&saved).Error
    return saved, total, err
}

func (r *savedThreadRepository) IsSaved(userID, threadID uuid.UUID) (bool, error) {
    var count int64
    err := r.db.Model(&models.SavedThread{}).Where("user_id = ? AND thread_id = ?", userID, threadID).Count(&count).Error
    return count > 0, err
}
