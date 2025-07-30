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
