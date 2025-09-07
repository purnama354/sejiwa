package models

import (
	"time"

	"github.com/google/uuid"
)

// swagger:enum ModerationStatus
type ModerationStatus string

const (
	ModerationStatusPending  ModerationStatus = "pending"
	ModerationStatusApproved ModerationStatus = "approved"
	ModerationStatusHidden   ModerationStatus = "hidden"
	ModerationStatusDeleted  ModerationStatus = "deleted"
)

// swagger:model
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
	// Per-thread privacy controls
	IsPrivate bool    `gorm:"default:false"`
	Password  *string `gorm:"size:255"` // optional bcrypt hash
	// Optional assigned moderator responsible for this thread
	AssignedModeratorID *uuid.UUID `gorm:"type:uuid;index"`

	// Relationships
	Author            User     `gorm:"foreignKey:AuthorID"`
	Category          Category `gorm:"foreignKey:CategoryID"`
	AssignedModerator *User    `gorm:"foreignKey:AssignedModeratorID"`
}

// TableName returns the table name for Thread model
func (Thread) TableName() string {
	return "threads"
}
