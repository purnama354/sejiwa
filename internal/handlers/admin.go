package handlers

import (
	"errors"
	"net/http"
	"sejiwa-api/internal/dto"
	"sejiwa-api/internal/middleware"
	"sejiwa-api/internal/services"
	"sejiwa-api/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	adminService services.AdminService
}

func NewAdminHandler(adminService services.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

func (h *AdminHandler) CreateAdmin(c *gin.Context) {
	var req dto.CreateAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := utils.ParseValidationErrors(err)
		errorResponse := dto.NewErrorResponse(
			"Validation failed",
			"VALIDATION_ERROR",
			validationErrors,
		)
		c.JSON(http.StatusUnprocessableEntity, errorResponse)
		return
	}

	// Get current user ID from context
	userID, _ := c.Get(middleware.ContextUserIDKey)
	creatorID := userID.(uuid.UUID)

	admin, err := h.adminService.CreateAdmin(req, creatorID)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) {
			errorResponse := dto.NewErrorResponse(
				"Username already exists",
				"USERNAME_ALREADY_EXISTS",
				nil,
			)
			c.JSON(http.StatusConflict, errorResponse)
			return
		}
		if errors.Is(err, services.ErrEmailExists) {
			errorResponse := dto.NewErrorResponse(
				"Email already exists",
				"EMAIL_ALREADY_EXISTS",
				nil,
			)
			c.JSON(http.StatusConflict, errorResponse)
			return
		}
		errorResponse := dto.NewErrorResponse(
			"Failed to create admin",
			"INTERNAL_SERVER_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// Convert to response format
	adminProfile := dto.ModeratorProfile{
		ID:           admin.ID.String(),
		Username:     admin.Username,
		Email:        admin.Email,
		FullName:     admin.FullName,
		CreatedAt:    admin.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    admin.UpdatedAt.Format(time.RFC3339),
		Status:       string(admin.Status),
		Role:         string(admin.Role),
		Permissions:  []string{"manage_moderators", "manage_reports", "ban_users", "delete_content", "manage_categories"},
		ThreadCount:  admin.ThreadCount,
		ReplyCount:   admin.ReplyCount,
		LastActiveAt: admin.LastActiveAt.Format(time.RFC3339),
	}
	if admin.CreatedBy != nil {
		adminProfile.CreatedBy = admin.CreatedBy.String()
	}

	c.JSON(http.StatusCreated, adminProfile)
}

func (h *AdminHandler) CreateModerator(c *gin.Context) {
	var req dto.CreateModeratorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := utils.ParseValidationErrors(err)
		errorResponse := dto.NewErrorResponse(
			"Validation failed",
			"VALIDATION_ERROR",
			validationErrors,
		)
		c.JSON(http.StatusUnprocessableEntity, errorResponse)
		return
	}

	// Get current user ID from context
	userID, _ := c.Get(middleware.ContextUserIDKey)
	creatorID := userID.(uuid.UUID)

	moderator, err := h.adminService.CreateModerator(req, creatorID)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) {
			errorResponse := dto.NewErrorResponse(
				"Username already exists",
				"USERNAME_ALREADY_EXISTS",
				nil,
			)
			c.JSON(http.StatusConflict, errorResponse)
			return
		}
		if errors.Is(err, services.ErrEmailExists) {
			errorResponse := dto.NewErrorResponse(
				"Email already exists",
				"EMAIL_ALREADY_EXISTS",
				nil,
			)
			c.JSON(http.StatusConflict, errorResponse)
			return
		}
		errorResponse := dto.NewErrorResponse(
			"Failed to create moderator",
			"INTERNAL_SERVER_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// Convert to response format
	moderatorProfile := dto.ModeratorProfile{
		ID:           moderator.ID.String(),
		Username:     moderator.Username,
		Email:        moderator.Email,
		FullName:     moderator.FullName,
		CreatedAt:    moderator.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    moderator.UpdatedAt.Format(time.RFC3339),
		Status:       string(moderator.Status),
		Role:         string(moderator.Role),
		Permissions:  []string(moderator.Permissions),
		ThreadCount:  moderator.ThreadCount,
		ReplyCount:   moderator.ReplyCount,
		LastActiveAt: moderator.LastActiveAt.Format(time.RFC3339),
	}
	if moderator.CreatedBy != nil {
		moderatorProfile.CreatedBy = moderator.CreatedBy.String()
	}

	c.JSON(http.StatusCreated, moderatorProfile)
}
