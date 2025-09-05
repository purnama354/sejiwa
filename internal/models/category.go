package models

// swagger:model
type Category struct {
	BaseModel
	Name        string `gorm:"size:50;uniqueIndex;not null"`
	Slug        string `gorm:"size:60;uniqueIndex;not null"` // URL-friendly identifier
	Description string `gorm:"size:255"`
	ThreadCount int    `gorm:"default:0"`
	IsLocked    bool   `gorm:"default:false"` // If true, no new threads can be created in this category
	// If true, category content is only accessible to members (subscribers)
	IsPrivate bool `gorm:"default:false"`
	// Optional password hash for joining private categories; nil/empty means no password required
	Password *string `gorm:"size:255"`
}
