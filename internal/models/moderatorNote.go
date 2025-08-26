package models

import (
	"github.com/google/uuid"
)

// swagger:model
type ModeratorNote struct {
	BaseModel
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	ModeratorID uuid.UUID `gorm:"type:uuid;not null;index" json:"moderator_id"`
	Note        string    `gorm:"type:text;not null" json:"note"`

	// Relationships
	User      User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Moderator User `gorm:"foreignKey:ModeratorID;constraint:OnDelete:CASCADE" json:"moderator,omitempty"`
}

func (ModeratorNote) TableName() string {
	return "moderator_notes"
}
