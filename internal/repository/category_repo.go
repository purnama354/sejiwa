package repository

import (
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CategoryRepository defines the interface for category data operations
type CategoryRepository interface {
	Create(category *models.Category) error
	FindAll() ([]models.Category, error)
	FindByID(id uuid.UUID) (*models.Category, error)
	FindBySlug(slug string) (*models.Category, error)
	Update(category *models.Category) error
	Delete(id uuid.UUID) error
	UpdateThreadCount(categoryID uuid.UUID, delta int) error
	FindUnlocked() ([]models.Category, error)
}

type categoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new instance of CategoryRepository
func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

// Create inserts a new category record into the database
func (r *categoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

// FindAll retrieves all categories (including soft-deleted ones for admin view)
func (r *categoryRepository) FindAll() ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Find(&categories).Error
	return categories, err
}

// FindByID retrieves a category by its UUID
func (r *categoryRepository) FindByID(id uuid.UUID) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("id = ?", id).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindBySlug retrieves a category by its slug
func (r *categoryRepository) FindBySlug(slug string) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("slug = ?", slug).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Update modifies an existing category
func (r *categoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

// Delete soft-deletes a category by ID
func (r *categoryRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Category{}, id).Error
}

// UpdateThreadCount increments or decrements the thread count for a category
// delta should be +1 when a thread is created, -1 when deleted
func (r *categoryRepository) UpdateThreadCount(categoryID uuid.UUID, delta int) error {
	return r.db.Model(&models.Category{}).
		Where("id = ?", categoryID).
		Update("thread_count", gorm.Expr("thread_count + ?", delta)).Error
}

// FindUnlocked retrieves all unlocked categories (for thread creation)
func (r *categoryRepository) FindUnlocked() ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Where("is_locked = ?", false).Find(&categories).Error
	return categories, err
}
