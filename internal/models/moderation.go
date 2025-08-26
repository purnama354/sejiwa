package models

import (
	"time"

	"github.com/google/uuid"
)

type ModerationActionType string

const (
	ModerationActionDismiss       ModerationActionType = "dismiss"
	ModerationActionWarnUser      ModerationActionType = "warn_user"
	ModerationActionHideContent   ModerationActionType = "hide_content"
	ModerationActionDeleteContent ModerationActionType = "delete_content"
	ModerationActionBanUserTemp   ModerationActionType = "ban_user_temp"
	ModerationActionBanUserPerm   ModerationActionType = "ban_user_permanent"
	ModerationActionUnban         ModerationActionType = "unban"
)

// swagger:model
// ModerationAction represents an action taken by a moderator on content or users
type ModerationAction struct {
	BaseModel
	ReportID       uuid.UUID            `gorm:"type:uuid;index"`
	ContentType    ContentType          `gorm:"type:varchar(20);not null"`
	ContentID      uuid.UUID            `gorm:"type:uuid;not null;index"`
	ReportedUserID uuid.UUID            `gorm:"type:uuid;not null;index"`
	ModeratorID    uuid.UUID            `gorm:"type:uuid;not null;index"`
	Action         ModerationActionType `gorm:"type:varchar(30);not null"`
	Reason         string               `gorm:"type:text;not null"`
	InternalNotes  string               `gorm:"type:text"`
	BanExpiresAt   *time.Time           `gorm:"index"`

	// Relationships
	Report       Report `gorm:"foreignKey:ReportID"`
	ReportedUser User   `gorm:"foreignKey:ReportedUserID"`
	Moderator    User   `gorm:"foreignKey:ModeratorID"`
}

// TableName returns the table name for ModerationAction model
func (ModerationAction) TableName() string {
	return "moderation_actions"
}
