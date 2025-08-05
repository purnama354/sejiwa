package models

import (
	"github.com/google/uuid"
)

// Reply represents a response to a thread in the discussion platform
type Reply struct {
	BaseModel
	Content          string           `gorm:"type:text;not null"`
	AuthorID         uuid.UUID        `gorm:"type:uuid;not null;index"`
	ThreadID         uuid.UUID        `gorm:"type:uuid;not null;index"`
	ParentReplyID    *uuid.UUID       `gorm:"type:uuid;index"` // For nested replies (optional)
	ModerationStatus ModerationStatus `gorm:"type:varchar(20);default:'approved';not null"`
	IsEdited         bool             `gorm:"default:false"`

	// Relationships
	Author       User    `gorm:"foreignKey:AuthorID"`
	Thread       Thread  `gorm:"foreignKey:ThreadID"`
	ParentReply  *Reply  `gorm:"foreignKey:ParentReplyID"`
	ChildReplies []Reply `gorm:"foreignKey:ParentReplyID"`
}

// TableName returns the table name for Reply model
func (Reply) TableName() string {
	return "replies"
}
