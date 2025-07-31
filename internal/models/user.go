package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleUser      UserRole = "user"
	RoleModerator UserRole = "moderator"
	RoleAdmin     UserRole = "admin"
)

type UserStatus string

const (
	StatusActive    UserStatus = "active"
	StatusInactive  UserStatus = "inactive"
	StatusSuspended UserStatus = "suspended"
)

// Permissions for moderators (stored as JSON in database)
type Permissions []string

func (p Permissions) Value() (driver.Value, error) {
	return json.Marshal(p)
}

func (p *Permissions) Scan(value interface{}) error {
	if value == nil {
		*p = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("cannot scan non-bytes into Permissions")
	}

	return json.Unmarshal(bytes, p)
}

type User struct {
	BaseModel
	Username     string      `gorm:"size:30;uniqueIndex;not null"`
	Password     string      `gorm:"not null"`
	Role         UserRole    `gorm:"type:varchar(20);default:'user';not null"`
	Status       UserStatus  `gorm:"type:varchar(20);default:'active';not null"`
	Email        string      `gorm:"size:255;index"` // For admin/moderator accounts
	FullName     string      `gorm:"size:100"`       // For admin/moderator accounts
	Permissions  Permissions `gorm:"type:jsonb"`     // For moderator permissions
	ThreadCount  int         `gorm:"default:0"`
	ReplyCount   int         `gorm:"default:0"`
	LastActiveAt *time.Time  `gorm:"index"`
	CreatedBy    *uuid.UUID  `gorm:"type:uuid"` // Which admin created this user
}
