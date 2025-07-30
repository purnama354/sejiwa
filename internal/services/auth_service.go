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

const (
	AccessTokenDuration  = time.Hour * 24      // 24 hours
	RefreshTokenDuration = time.Hour * 24 * 30 // 30 days
)

// AuthService defines the interface for authentication operations.
type AuthService interface {
	Register(req dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(req dto.LoginRequest) (*dto.AuthResponse, error)
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

// NewAuthService creates a new instance of AuthService.
func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// Register handles the business logic for user registration.
func (s *authService) Register(req dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Check if username already exists
	_, err := s.userRepo.FindByUsername(req.Username)
	if err == nil {
		return nil, ErrUserExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create new user model
	newUser := &models.User{
		Username: req.Username,
		Password: hashedPassword,
		Role:     models.RoleUser,
	}

	// Save user to the database
	if err := s.userRepo.Create(newUser); err != nil {
		return nil, err
	}

	// Generate tokens and return complete auth response
	return s.generateAuthResponse(newUser)
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

	// Generate tokens and return complete auth response
	return s.generateAuthResponse(user)
}

// generateAuthResponse creates a complete AuthResponse with tokens and user profile
func (s *authService) generateAuthResponse(user *models.User) (*dto.AuthResponse, error) {
	// Generate access token
	accessToken, err := s.generateJWT(user, AccessTokenDuration)
	if err != nil {
		return nil, ErrTokenGeneration
	}

	// Generate refresh token
	refreshToken, err := s.generateJWT(user, RefreshTokenDuration)
	if err != nil {
		return nil, ErrTokenGeneration
	}

	// Create user profile
	userProfile := dto.UserProfile{
		ID:           user.ID.String(),
		Username:     user.Username,
		CreatedAt:    user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    user.UpdatedAt.Format(time.RFC3339),
		Status:       "active", // Default status
		Role:         string(user.Role),
		ThreadCount:  0, // Will be populated when we implement threads
		ReplyCount:   0, // Will be populated when we implement replies
		LastActiveAt: time.Now().Format(time.RFC3339),
	}

	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int(AccessTokenDuration.Seconds()),
		User:         userProfile,
	}, nil
}

// generateJWT creates a new JWT token for a given user with specified duration
func (s *authService) generateJWT(user *models.User, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID.String(),
		"role": user.Role,
		"exp":  time.Now().Add(duration).Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
