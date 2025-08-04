package models

import (
	"time"

	"github.com/google/uuid"
)

type ModerationStatus string

const (
	ModerationStatusPending  ModerationStatus = "pending"
	ModerationStatusApproved ModerationStatus = "approved"
	ModerationStatusHidden   ModerationStatus = "hidden"
	ModerationStatusDeleted  ModerationStatus = "deleted"
)

type Thread struct {
	BaseModel
	Title            string           `gorm:"size:255;not null"`
	Content          string           `gorm:"type:text;not null"`
	AuthorID         uuid.UUID        `gorm:"type:uuid;not null;index"`
	CategoryID       uuid.UUID        `gorm:"type:uuid;not null;index"`
	ReplyCount       int              `gorm:"default:0"`
	ViewCount        int              `gorm:"default:0"`
	IsPinned         bool             `gorm:"default:false"`
	IsLocked         bool             `gorm:"default:false"`
	ModerationStatus ModerationStatus `gorm:"type:varchar(20);default:'approved';not null"`
	IsEdited         bool             `gorm:"default:false"`
	LastReplyAt      *time.Time       `gorm:"index"`

	// Relationships
	Author   User     `gorm:"foreignKey:AuthorID"`
	Category Category `gorm:"foreignKey:CategoryID"`
}

// TableName returns the table name for Thread model
func (Thread) TableName() string {
	return "threads"
}
