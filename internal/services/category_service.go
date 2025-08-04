package services

import (
	"errors"
	"fmt"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/repository"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrCategoryNotFound = errors.New("CATEGORY_NOT_FOUND")
	ErrCategoryExists   = errors.New("CATEGORY_ALREADY_EXISTS")
)

// CategoryService defines the interface for category-related business logic.
type CategoryService interface {
	Create(req dto.CreateCategoryRequest) (*models.Category, error)
	GetByID(id uuid.UUID) (*models.Category, error)
	GetAll(adminView bool) ([]models.Category, error)
	Update(id uuid.UUID, req dto.UpdateCategoryRequest) (*models.Category, error)
	Delete(id uuid.UUID) error
}

type categoryService struct {
	repo repository.CategoryRepository
}

// NewCategoryService creates a new instance of CategoryService.
func NewCategoryService(repo repository.CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

// Create handles the business logic for creating a new category.
func (s *categoryService) Create(req dto.CreateCategoryRequest) (*models.Category, error) {
	slug := utils.GenerateSlug(req.Name)

	// Check if a category with the same slug already exists.
	_, err := s.repo.FindBySlug(slug)
	if err == nil {
		return nil, fmt.Errorf("%w: a category with slug '%s' already exists", ErrCategoryExists, slug)
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err // A different database error occurred.
	}

	category := &models.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
	}

	if err := s.repo.Create(category); err != nil {
		return nil, err
	}

	return category, nil
}

// GetByID retrieves a single category by its ID.
func (s *categoryService) GetByID(id uuid.UUID) (*models.Category, error) {
	category, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}
	return category, nil
}

// GetAll retrieves categories. If adminView is true, it includes all categories.
// Otherwise, it only returns unlocked categories for public view.
func (s *categoryService) GetAll(adminView bool) ([]models.Category, error) {
	if adminView {
		return s.repo.FindAll()
	}
	return s.repo.FindUnlocked()
}

// Update handles the logic for modifying an existing category.
func (s *categoryService) Update(id uuid.UUID, req dto.UpdateCategoryRequest) (*models.Category, error) {
	category, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		newSlug := utils.GenerateSlug(*req.Name)
		// If the slug is changing, check if the new one is already taken.
		if newSlug != category.Slug {
			existing, err := s.repo.FindBySlug(newSlug)
			if err == nil && existing.ID != category.ID {
				return nil, fmt.Errorf("%w: a category with slug '%s' already exists", ErrCategoryExists, newSlug)
			}
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		}
		category.Name = *req.Name
		category.Slug = newSlug
	}

	if req.Description != nil {
		category.Description = *req.Description
	}

	if req.IsLocked != nil {
		category.IsLocked = *req.IsLocked
	}

	if err := s.repo.Update(category); err != nil {
		return nil, err
	}

	return category, nil
}

// Delete handles the logic for soft-deleting a category.
func (s *categoryService) Delete(id uuid.UUID) error {
	// First, ensure the category exists.
	_, err := s.GetByID(id)
	if err != nil {
		return err
	}

	return s.repo.Delete(id)
}
