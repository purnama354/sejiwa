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

func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *authService) Register(req dto.RegisterRequest) (*models.User, error) {
	// Check if username already exists
	_, err := s.userRepo.FindByUsername(req.Username)
	if err == nil {
		return nil, ErrUserExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err // Handle other potential database errors
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create a new user model
	newUser := &models.User{
		Username: req.Username,
		Password: hashedPassword,
		Role:     models.RoleUser,
	}

	// Save user to the database
	if err := s.userRepo.Create(newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}

// Login handles the business logic for user authentication.
func (s *authService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	// Find user by username
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, ErrInvalidCredentials
	}

	// Generate JWT token
	token, err := s.generateJWT(user)
	if err != nil {
		return nil, ErrTokenGeneration
	}

	return &dto.AuthResponse{Token: token}, nil
}

// generateJWT creates a new JWT token for a given user.
func (s *authService) generateJWT(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 72).Unix(), // Token expires in 3 days
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
