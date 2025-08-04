package dto

// RegisterRequest defines the structure for a user registration request.
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=30,alphanum_underscore_hyphen"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

// LoginRequest defines the structure for a user login request.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RefreshTokenRequest defines the structure for refresh token requests.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// CreateAdminRequest defines the structure for creating new admin accounts
type CreateAdminRequest struct {
	Username string `json:"username" binding:"required,min=3,max=30,alphanum_underscore_hyphen"`
	Password string `json:"password" binding:"required,min=8,max=128"`
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"full_name,omitempty" binding:"max=100"`
}

// CreateCategoryRequest defines the structure for creating new categories
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=50"`
	Description string `json:"description,omitempty" binding:"max=255"`
}

// CreateThreadRequest defines the structure for creating a new thread
type CreateThreadRequest struct {
	Title      string `json:"title" binding:"required,min=5,max=255"`
	Content    string `json:"content" binding:"required,min=10,max=10000"`
	CategoryID string `json:"category_id" binding:"required,uuid"`
}

// CreateModeratorRequest defines the structure for creating new moderator accounts
type CreateModeratorRequest struct {
	Username    string   `json:"username" binding:"required,min=3,max=30,alphanum_underscore_hyphen"`
	Password    string   `json:"password" binding:"required,min=8,max=128"`
	Email       string   `json:"email" binding:"required,email"`
	FullName    string   `json:"full_name,omitempty" binding:"max=100"`
	Permissions []string `json:"permissions,omitempty"`
}
