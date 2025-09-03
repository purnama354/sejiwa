package repository

import (
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	Create(user *models.User) error
	FindByUsername(username string) (*models.User, error)
	FindByID(id uuid.UUID) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	Update(user *models.User) error
	List(role *models.UserRole, status *models.UserStatus, query *string, offset, limit int) ([]models.User, int64, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create inserts a new user record into the database.
func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByUsername retrieves a user by their username.
func (r *userRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID retrieves a user by their UUID.
func (r *userRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail retrieves a user by their email address.
func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update modifies an existing user record in the database.
func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// List retrieves users with optional filters and pagination
func (r *userRepository) List(role *models.UserRole, status *models.UserStatus, query *string, offset, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	dbq := r.db.Model(&models.User{})
	if role != nil {
		dbq = dbq.Where("role = ?", *role)
	}
	if status != nil {
		dbq = dbq.Where("status = ?", *status)
	}
	if query != nil && *query != "" {
		like := "%" + *query + "%"
		dbq = dbq.Where("username ILIKE ?", like)
	}

	if err := dbq.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := dbq.Order("created_at DESC").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
