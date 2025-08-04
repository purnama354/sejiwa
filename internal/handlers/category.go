package handlers

import (
	"errors"
	"net/http"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CategoryHandler handles HTTP requests for categories.
type CategoryHandler struct {
	service services.CategoryService
}

// NewCategoryHandler creates a new instance of CategoryHandler.
func NewCategoryHandler(service services.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}

	category, err := h.service.Create(req)
	if err != nil {
		if errors.Is(err, services.ErrCategoryExists) {
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Category already exists", "CATEGORY_ALREADY_EXISTS", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to create category", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusCreated, toCategoryResponse(category))
}

func (h *CategoryHandler) GetAll(c *gin.Context) {
	role, _ := c.Get(middleware.ContextUserRoleKey)
	isAdmin := role == models.RoleAdmin

	categories, err := h.service.GetAll(isAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve categories", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	res := make([]dto.CategoryResponse, len(categories))
	for i, category := range categories {
		res[i] = toCategoryResponse(&category)
	}

	c.JSON(http.StatusOK, res)
}

func (h *CategoryHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		// For now, we only support getting by ID. Getting by slug can be added later.
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid category ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	category, err := h.service.GetByID(id)
	if err != nil {
		if errors.Is(err, services.ErrCategoryNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Category not found", "CATEGORY_NOT_FOUND", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve category", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, toCategoryResponse(category))
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid category ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}

	category, err := h.service.Update(id, req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrCategoryNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Category not found", "CATEGORY_NOT_FOUND", nil))
		case errors.Is(err, services.ErrCategoryExists):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Category with this name already exists", "CATEGORY_ALREADY_EXISTS", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update category", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, toCategoryResponse(category))
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid category ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	err = h.service.Delete(id)
	if err != nil {
		if errors.Is(err, services.ErrCategoryNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Category not found", "CATEGORY_NOT_FOUND", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to delete category", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("Category deleted successfully"))
}

// toCategoryResponse converts a model to a DTO.
func toCategoryResponse(c *models.Category) dto.CategoryResponse {
	return dto.CategoryResponse{
		ID:          c.ID.String(),
		Name:        c.Name,
		Slug:        c.Slug,
		Description: c.Description,
		ThreadCount: c.ThreadCount,
		IsLocked:    c.IsLocked,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}
