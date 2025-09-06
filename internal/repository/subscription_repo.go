package repository

import (
	"github.com/google/uuid"
	"github.com/purnama354/sejiwa-api/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SubscriptionRepository interface {
	Subscribe(userID, categoryID uuid.UUID) error
	Unsubscribe(userID, categoryID uuid.UUID) error
	ListByUser(userID uuid.UUID) ([]models.CategorySubscription, error)
	IsSubscribed(userID, categoryID uuid.UUID) (bool, error)
}

type subscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) SubscriptionRepository {
	return &subscriptionRepository{db: db}
}

func (r *subscriptionRepository) Subscribe(userID, categoryID uuid.UUID) error {
	sub := &models.CategorySubscription{UserID: userID, CategoryID: categoryID}
	// Idempotent upsert: on unique conflict do nothing
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "category_id"}},
		DoNothing: true,
	}).Create(sub).Error
}

func (r *subscriptionRepository) Unsubscribe(userID, categoryID uuid.UUID) error {
	return r.db.Where("user_id = ? AND category_id = ?", userID, categoryID).Delete(&models.CategorySubscription{}).Error
}

func (r *subscriptionRepository) ListByUser(userID uuid.UUID) ([]models.CategorySubscription, error) {
	var subs []models.CategorySubscription
	err := r.db.Preload("Category").Where("user_id = ?", userID).Order("created_at DESC").Find(&subs).Error
	return subs, err
}

func (r *subscriptionRepository) IsSubscribed(userID, categoryID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&models.CategorySubscription{}).Where("user_id = ? AND category_id = ?", userID, categoryID).Count(&count).Error
	return count > 0, err
}
