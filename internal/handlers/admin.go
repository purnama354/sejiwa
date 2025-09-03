package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	adminService services.AdminService
	userService  services.UserService
}

func NewAdminHandler(adminService services.AdminService, userService services.UserService) *AdminHandler {
	return &AdminHandler{adminService: adminService, userService: userService}
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

// ListUsers returns paginated users for admin panel with optional filters
func (h *AdminHandler) ListUsers(c *gin.Context) {
	// Parse query params
	role := c.Query("role")
	status := c.Query("status")
	q := c.Query("query")
	page, limit := utils.GetPaginationParams(c)
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Map to model enums
	var rolePtr *models.UserRole
	var statusPtr *models.UserStatus
	if role == string(models.RoleUser) || role == string(models.RoleModerator) || role == string(models.RoleAdmin) {
		r := models.UserRole(role)
		rolePtr = &r
	}
	if status == string(models.StatusActive) || status == string(models.StatusInactive) || status == string(models.StatusSuspended) {
		s := models.UserStatus(status)
		statusPtr = &s
	}
	var queryPtr *string
	if q != "" {
		queryPtr = &q
	}

	// Use repository through service where applicable; temporary direct list since service lacks method
	users, total, err := h.userService.ListUsers(rolePtr, statusPtr, queryPtr, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to list users", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	// Map to DTOs
	items := make([]dto.UserProfile, 0, len(users))
	for _, u := range users {
		lastActive := time.Now()
		if u.LastActiveAt != nil {
			lastActive = *u.LastActiveAt
		}
		items = append(items, dto.UserProfile{
			ID:           u.ID.String(),
			Username:     u.Username,
			CreatedAt:    u.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    u.UpdatedAt.Format(time.RFC3339),
			Status:       string(u.Status),
			Role:         string(u.Role),
			ThreadCount:  u.ThreadCount,
			ReplyCount:   u.ReplyCount,
			LastActiveAt: lastActive.Format(time.RFC3339),
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	resp := dto.UserListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   limit,
		TotalPages: totalPages,
	}
	c.JSON(http.StatusOK, resp)
}
