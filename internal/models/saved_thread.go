package models

import "github.com/google/uuid"

// SavedThread represents a user's saved/bookmarked thread
type SavedThread struct {
    BaseModel
    UserID   uuid.UUID `gorm:"type:uuid;index:idx_user_thread,unique;not null"`
    ThreadID uuid.UUID `gorm:"type:uuid;index:idx_user_thread,unique;not null"`

    // Relations
    Thread Thread `gorm:"foreignKey:ThreadID"`
}

func (SavedThread) TableName() string { return "saved_threads" }
