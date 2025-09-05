package models

import (
    "github.com/google/uuid"
)

// ContentVisibility determines who can see a user's content
type ContentVisibility string

const (
    ContentVisibilityAll        ContentVisibility = "all"
    ContentVisibilityCategories ContentVisibility = "categories"
    ContentVisibilityNone       ContentVisibility = "none"
)

// UserPreferences stores notification and privacy preferences for a user
type UserPreferences struct {
    BaseModel
    UserID                    uuid.UUID        `gorm:"type:uuid;uniqueIndex;not null"`
    // Notifications
    NotifyThreadReplies       bool             `gorm:"default:true"`
    NotifyMentions            bool             `gorm:"default:true"`
    NotifyCategoryUpdates     bool             `gorm:"default:false"`
    NotifyAnnouncements       bool             `gorm:"default:true"`
    // Privacy
    ShowActiveStatus          bool             `gorm:"default:true"`
    AllowDirectMessages       bool             `gorm:"default:true"`
    ContentVisibility         ContentVisibility `gorm:"type:varchar(20);default:'all';not null"`
}

func (UserPreferences) TableName() string { return "user_preferences" }
