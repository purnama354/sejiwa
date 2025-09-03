package services

import (
	"errors"
	"time"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound = errors.New("USER_NOT_FOUND")
)

// UserService defines the interface for user operations
type UserService interface {
	GetUserProfile(userID uuid.UUID) (*dto.UserProfile, error)
	UpdateUserProfile(userID uuid.UUID, req dto.UpdateUserRequest) (*dto.UserProfile, error)
	ListUsers(role *models.UserRole, status *models.UserStatus, query *string, offset, limit int) ([]models.User, int64, error)
}

type userService struct {
	userRepo repository.UserRepository
}

// NewUserService creates a new instance of UserService
func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

// GetUserProfile retrieves user profile information
func (s *userService) GetUserProfile(userID uuid.UUID) (*dto.UserProfile, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	profile := &dto.UserProfile{
		ID:          user.ID.String(),
		Username:    user.Username,
		CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   user.UpdatedAt.Format(time.RFC3339),
		Status:      string(user.Status),
		Role:        string(user.Role),
		ThreadCount: user.ThreadCount,
		ReplyCount:  user.ReplyCount,
	}

	if user.LastActiveAt != nil {
		profile.LastActiveAt = user.LastActiveAt.Format(time.RFC3339)
	} else {
		profile.LastActiveAt = time.Now().Format(time.RFC3339)
	}

	return profile, nil
}

// UpdateUserProfile updates user profile information
func (s *userService) UpdateUserProfile(userID uuid.UUID, req dto.UpdateUserRequest) (*dto.UserProfile, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// Check if username is being updated
	if req.Username != nil {
		// Check if new username already exists (but not for the current user)
		existingUser, err := s.userRepo.FindByUsername(*req.Username)
		if err == nil && existingUser.ID != user.ID {
			return nil, ErrUserExists
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		// Update username
		user.Username = *req.Username
	}

	// Update last active time
	now := time.Now()
	user.LastActiveAt = &now

	// Save updated user
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	// Return updated profile
	return s.GetUserProfile(userID)
}

// ListUsers returns users with optional filters and pagination
func (s *userService) ListUsers(role *models.UserRole, status *models.UserStatus, query *string, offset, limit int) ([]models.User, int64, error) {
	return s.userRepo.List(role, status, query, offset, limit)
}
