package services

import (
	"errors"
	"sejiwa-api/internal/dto"
	"sejiwa-api/internal/models"
	"sejiwa-api/internal/repository"
	"sejiwa-api/internal/utils"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrEmailExists = errors.New("EMAIL_ALREADY_EXISTS")
)

// AdminService defines the interface for admin operations
type AdminService interface {
	CreateAdmin(req dto.CreateAdminRequest, creatorID uuid.UUID) (*models.User, error)
	CreateModerator(req dto.CreateModeratorRequest, creatorID uuid.UUID) (*models.User, error)
}

type adminService struct {
	userRepo repository.UserRepository
}

// NewAdminService creates a new instance of AdminService
func NewAdminService(userRepo repository.UserRepository) AdminService {
	return &adminService{
		userRepo: userRepo,
	}
}

// CreateAdmin handles the business logic for creating new admin accounts
func (s *adminService) CreateAdmin(req dto.CreateAdminRequest, creatorID uuid.UUID) (*models.User, error) {
	// Check if username already exists
	_, err := s.userRepo.FindByUsername(req.Username)
	if err == nil {
		return nil, ErrUserExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Check if email already exists (for admin/moderator accounts)
	if req.Email != "" {
		_, err := s.userRepo.FindByEmail(req.Email)
		if err == nil {
			return nil, ErrEmailExists
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create new admin
	now := time.Now()
	newAdmin := &models.User{
		Username:     req.Username,
		Password:     hashedPassword,
		Role:         models.RoleAdmin,
		Status:       models.StatusActive,
		Email:        req.Email,
		FullName:     req.FullName,
		LastActiveAt: &now,
		CreatedBy:    &creatorID,
	}

	// Save admin to the database
	if err := s.userRepo.Create(newAdmin); err != nil {
		return nil, err
	}

	return newAdmin, nil
}

// CreateModerator handles the business logic for creating new moderator accounts
func (s *adminService) CreateModerator(req dto.CreateModeratorRequest, creatorID uuid.UUID) (*models.User, error) {
	// Check if username already exists
	_, err := s.userRepo.FindByUsername(req.Username)
	if err == nil {
		return nil, ErrUserExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Check if email already exists
	if req.Email != "" {
		_, err := s.userRepo.FindByEmail(req.Email)
		if err == nil {
			return nil, ErrEmailExists
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Set default permissions if none provided
	permissions := req.Permissions
	if len(permissions) == 0 {
		permissions = []string{"manage_reports", "ban_users", "delete_content"}
	}

	// Create new moderator
	now := time.Now()
	newModerator := &models.User{
		Username:     req.Username,
		Password:     hashedPassword,
		Role:         models.RoleModerator,
		Status:       models.StatusActive,
		Email:        req.Email,
		FullName:     req.FullName,
		Permissions:  models.Permissions(permissions),
		LastActiveAt: &now,
		CreatedBy:    &creatorID,
	}

	// Save moderator to the database
	if err := s.userRepo.Create(newModerator); err != nil {
		return nil, err
	}

	return newModerator, nil
}
