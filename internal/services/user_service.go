package services

import (
	"time"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/repository"

	"github.com/google/uuid"
)

// UserService defines the interface for user operations
type UserService interface {
	GetUserProfile(userID uuid.UUID) (*dto.UserProfile, error)
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
