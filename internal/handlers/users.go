package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetProfile retrieves the user profile based on the user ID from the context.
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		errorResponse := dto.NewErrorResponse(
			"User ID not found in context",
			"CONTEXT_ERROR",
			nil,
		)
		c.JSON(http.StatusUnauthorized, errorResponse)
		return
	}

	profile, err := h.userService.GetUserProfile(userID.(uuid.UUID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errorResponse := dto.NewErrorResponse(
				"User not found",
				"USER_NOT_FOUND",
				nil,
			)
			c.JSON(http.StatusNotFound, errorResponse)
			return
		}
		errorResponse := dto.NewErrorResponse(
			"Failed to get user profile",
			"INTERNAL_SERVER_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *UserHandler) GetRoleInfo(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextUserIDKey)
	userRoleInterface, _ := c.Get(middleware.ContextUserRoleKey)

	// Convert the role to string for comparison
	var userRole string
	if role, ok := userRoleInterface.(models.UserRole); ok {
		userRole = string(role)
	} else if roleStr, ok := userRoleInterface.(string); ok {
		userRole = roleStr
	} else {
		errorResponse := dto.NewErrorResponse(
			"Invalid role type in context",
			"CONTEXT_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// Define permissions based on role
	var permissions []string
	switch userRole {
	case string(models.RoleAdmin):
		permissions = []string{
			"manage_users",
			"manage_moderators",
			"manage_reports",
			"ban_users",
			"delete_content",
			"manage_categories",
			"view_audit_logs",
		}
	case string(models.RoleModerator):
		permissions = []string{
			"manage_reports",
			"ban_users",
			"delete_content",
			"hide_content",
			"warn_users",
		}
	case string(models.RoleUser):
		permissions = []string{
			"create_threads",
			"reply_to_threads",
			"report_content",
		}
	default:
		permissions = []string{}
	}

	roleInfo := gin.H{
		"user_id":      userID,
		"role":         userRole,
		"permissions":  permissions,
		"is_admin":     userRole == string(models.RoleAdmin),
		"is_moderator": userRole == string(models.RoleModerator) || userRole == string(models.RoleAdmin),
		"can_moderate": userRole == string(models.RoleModerator) || userRole == string(models.RoleAdmin),
		"timestamp":    time.Now().Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, roleInfo)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		errorResponse := dto.NewErrorResponse(
			"User ID not found in context",
			"CONTEXT_ERROR",
			nil,
		)
		c.JSON(http.StatusUnauthorized, errorResponse)
		return
	}

	var req dto.UpdateUserRequest
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

	profile, err := h.userService.UpdateUserProfile(userID.(uuid.UUID), req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("User not found", "USER_NOT_FOUND", nil))
		case errors.Is(err, services.ErrUserExists):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Username already exists", "USERNAME_ALREADY_EXISTS", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update profile", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetPreferences returns user's notification and privacy preferences
func (h *UserHandler) GetPreferences(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	pref, err := h.userService.GetPreferences(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get preferences", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	// map to DTOs for frontend expectations
	resp := gin.H{
		"notifications": gin.H{
			"thread_replies":          pref.NotifyThreadReplies,
			"mentions":                pref.NotifyMentions,
			"category_updates":        pref.NotifyCategoryUpdates,
			"community_announcements": pref.NotifyAnnouncements,
		},
		"privacy": gin.H{
			"show_active_status":    pref.ShowActiveStatus,
			"allow_direct_messages": pref.AllowDirectMessages,
			"content_visibility":    string(pref.ContentVisibility),
		},
	}
	c.JSON(http.StatusOK, resp)
}

// UpdateNotificationPreferences updates notification preferences
func (h *UserHandler) UpdateNotificationPreferences(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	var req dto.UpdateNotificationPreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}
	pref, err := h.userService.UpdateNotificationPreferences(userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update notification preferences", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"thread_replies":          pref.NotifyThreadReplies,
		"mentions":                pref.NotifyMentions,
		"category_updates":        pref.NotifyCategoryUpdates,
		"community_announcements": pref.NotifyAnnouncements,
	})
}

// UpdatePrivacySettings updates privacy settings
func (h *UserHandler) UpdatePrivacySettings(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	var req dto.UpdatePrivacySettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}
	pref, err := h.userService.UpdatePrivacySettings(userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update privacy settings", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"show_active_status":    pref.ShowActiveStatus,
		"allow_direct_messages": pref.AllowDirectMessages,
		"content_visibility":    string(pref.ContentVisibility),
	})
}

// GetMyStats returns aggregated stats for the authenticated user
func (h *UserHandler) GetMyStats(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	stats, err := h.userService.GetMyStats(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get stats", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetMyActivity returns recent threads and replies by the user
func (h *UserHandler) GetMyActivity(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	activity, err := h.userService.GetMyActivity(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get activity", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, activity)
}

// GetMyCategories returns categories related to the user's activity
func (h *UserHandler) GetMyCategories(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	cats, err := h.userService.GetMyCategories(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get categories", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, cats)
}

// Subscribe to a category
func (h *UserHandler) SubscribeCategory(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	var body struct {
		CategoryID string  `json:"category_id" binding:"required,uuid"`
		Password   *string `json:"password,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}
	cid, _ := uuid.Parse(body.CategoryID)
	if err := h.userService.JoinCategory(userID.(uuid.UUID), cid, body.Password); err != nil {
		switch err.Error() {
		case "PASSWORD_REQUIRED":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Password required to join this category", "PASSWORD_REQUIRED", nil))
			return
		case "INVALID_PASSWORD":
			c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Invalid password", "INVALID_PASSWORD", nil))
			return
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to subscribe", "INTERNAL_SERVER_ERROR", nil))
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"subscribed": true})
}

// Unsubscribe from a category
func (h *UserHandler) UnsubscribeCategory(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	var body struct {
		CategoryID string `json:"category_id" binding:"required,uuid"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}
	cid, _ := uuid.Parse(body.CategoryID)
	if err := h.userService.UnsubscribeCategory(userID.(uuid.UUID), cid); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to unsubscribe", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscribed": false})
}

// List saved threads
func (h *UserHandler) ListSavedThreads(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	previews, total, err := h.userService.ListSavedThreads(userID.(uuid.UUID), 0, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get saved threads", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": previews, "total": total})
}

// Save a thread
func (h *UserHandler) SaveThread(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	var body struct {
		ThreadID string `json:"thread_id" binding:"required,uuid"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}
	tid, _ := uuid.Parse(body.ThreadID)
	if err := h.userService.SaveThread(userID.(uuid.UUID), tid); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to save thread", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, gin.H{"saved": true})
}

// Unsave a thread
func (h *UserHandler) UnsaveThread(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}
	var body struct {
		ThreadID string `json:"thread_id" binding:"required,uuid"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}
	tid, _ := uuid.Parse(body.ThreadID)
	if err := h.userService.UnsaveThread(userID.(uuid.UUID), tid); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to unsave thread", "INTERNAL_SERVER_ERROR", nil))
		return
	}
	c.JSON(http.StatusOK, gin.H{"saved": false})
}
