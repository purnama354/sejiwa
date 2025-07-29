package services

import (
	"errors"
	"sejiwa-api/internal/dto"
	"sejiwa-api/internal/models"
	"sejiwa-api/internal/repository"
	"sejiwa-api/internal/utils"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

var (
	ErrUserExists         = errors.New("USERNAME_ALREADY_EXISTS")
	ErrInvalidCredentials = errors.New("AUTH_INVALID_CREDENTIALS")
	ErrTokenGeneration    = errors.New("TOKEN_GENERATION_FAILED")
)

// AuthService defines the interface for authentication operations.
type AuthService interface {
	Register(req dto.RegisterRequest) (*models.User, error)
	Login(req dto.LoginRequest) (*dto.AuthResponse, error)
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}
