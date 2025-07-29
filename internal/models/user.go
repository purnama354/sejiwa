package models

type UserRole string

const (
	RoleUser      UserRole = "user"
	RoleModerator UserRole = "moderator"
	RoleAdmin     UserRole = "admin"
)

type User struct {
	BaseModel
	Username string   `gorm:"size:30;uniqueIndex;not null"`
	Password string   `gorm:"not null"`
	Role     UserRole `gorm:"type:varchar(20);default:'user';not null"`
}
