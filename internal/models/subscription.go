package models

import "github.com/google/uuid"

// CategorySubscription tracks a user's subscription to a category
type CategorySubscription struct {
    BaseModel
    UserID     uuid.UUID `gorm:"type:uuid;index:idx_user_category,unique;not null"`
    CategoryID uuid.UUID `gorm:"type:uuid;index:idx_user_category,unique;not null"`

    // Relations
    Category Category `gorm:"foreignKey:CategoryID"`
}

func (CategorySubscription) TableName() string { return "category_subscriptions" }
