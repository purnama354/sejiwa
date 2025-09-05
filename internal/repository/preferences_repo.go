package repository

import (
    "errors"
    "github.com/google/uuid"
    "github.com/purnama354/sejiwa-api/internal/models"
    "gorm.io/gorm"
)

// PreferencesRepository manages user preferences
type PreferencesRepository interface {
    GetByUserID(userID uuid.UUID) (*models.UserPreferences, error)
    Upsert(p *models.UserPreferences) error
}

type preferencesRepository struct {
    db *gorm.DB
}

func NewPreferencesRepository(db *gorm.DB) PreferencesRepository {
    return &preferencesRepository{db: db}
}

func (r *preferencesRepository) GetByUserID(userID uuid.UUID) (*models.UserPreferences, error) {
    var pref models.UserPreferences
    err := r.db.Where("user_id = ?", userID).First(&pref).Error
    if err != nil {
        return nil, err
    }
    return &pref, nil
}

func (r *preferencesRepository) Upsert(p *models.UserPreferences) error {
    if p.ID != uuid.Nil {
        return r.db.Save(p).Error
    }
    // try find existing
    var existing models.UserPreferences
    err := r.db.Where("user_id = ?", p.UserID).First(&existing).Error
    if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
        return err
    }
    if existing.ID != uuid.Nil {
        p.ID = existing.ID
        p.CreatedAt = existing.CreatedAt
        return r.db.Save(p).Error
    }
    return r.db.Create(p).Error
}
