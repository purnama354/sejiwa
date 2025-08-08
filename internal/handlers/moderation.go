package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ModerationHandler handles HTTP requests for moderation actions
type ModerationHandler struct {
	moderationService services.ModerationService
	reportService     services.ReportService
}

// NewModerationHandler creates a new instance of ModerationHandler
func NewModerationHandler(moderationService services.ModerationService, reportService services.ReportService) *ModerationHandler {
	return &ModerationHandler{
		moderationService: moderationService,
		reportService:     reportService,
	}
}

func (h *ModerationHandler) ProcessReport(c *gin.Context) {
	reportID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid report ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.ModerationActionRequest
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

	// Get moderator ID from context
	moderatorID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}

	action, err := h.moderationService.ProcessReport(reportID, req, moderatorID.(uuid.UUID))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrReportNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Report not found", "REPORT_NOT_FOUND", nil))
		case errors.Is(err, services.ErrReportAlreadyResolved):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Report already resolved", "REPORT_ALREADY_RESOLVED", nil))
		case errors.Is(err, services.ErrCannotModerateSelf):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Cannot moderate your own content", "CANNOT_MODERATE_SELF", nil))
		case errors.Is(err, services.ErrModerationActionInvalid):
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid moderation action", "INVALID_MODERATION_ACTION", nil))
		case err.Error() == "INVALID_BAN_DURATION":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid ban duration", "INVALID_BAN_DURATION", nil))
		case err.Error() == "USER_NOT_FOUND":
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("User not found", "USER_NOT_FOUND", nil))
		case err.Error() == "CANNOT_BAN_MODERATOR_OR_ADMIN":
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Cannot ban moderator or admin", "CANNOT_BAN_MODERATOR_OR_ADMIN", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to process moderation action", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, h.toModerationActionResponse(action))
}

func (h *ModerationHandler) GetModerationActions(c *gin.Context) {
	page, pageSize := h.getPaginationParams(c)

	// Build filters from query parameters
	filters := dto.ModerationFilters{}

	if moderatorID := c.Query("moderator_id"); moderatorID != "" {
		filters.ModeratorID = &moderatorID
	}

	if action := c.Query("action"); action != "" {
		filters.Action = &action
	}

	if fromDate := c.Query("from_date"); fromDate != "" {
		filters.FromDate = &fromDate
	}

	if toDate := c.Query("to_date"); toDate != "" {
		filters.ToDate = &toDate
	}

	actions, err := h.moderationService.GetModerationActions(page, pageSize, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve moderation actions", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, actions)
}

func (h *ModerationHandler) BanUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid user ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.UserBanRequest
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

	// Get moderator ID from context
	moderatorID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}

	err = h.moderationService.BanUser(userID, req, moderatorID.(uuid.UUID))
	if err != nil {
		switch err.Error() {
		case "USER_NOT_FOUND":
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("User not found", "USER_NOT_FOUND", nil))
		case "CANNOT_BAN_MODERATOR_OR_ADMIN":
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Cannot ban moderator or admin", "CANNOT_BAN_MODERATOR_OR_ADMIN", nil))
		default:
			if errors.Is(err, services.ErrCannotModerateSelf) {
				c.JSON(http.StatusConflict, dto.NewErrorResponse("Cannot ban yourself", "CANNOT_MODERATE_SELF", nil))
			} else {
				c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to ban user", "INTERNAL_SERVER_ERROR", nil))
			}
		}
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("User banned successfully"))
}

func (h *ModerationHandler) UnbanUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid user ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	// Get moderator ID from context
	moderatorID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}

	err = h.moderationService.UnbanUser(userID, moderatorID.(uuid.UUID))
	if err != nil {
		if err.Error() == "USER_NOT_FOUND" {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("User not found", "USER_NOT_FOUND", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to unban user", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("User unbanned successfully"))
}

func (h *ModerationHandler) GetReportsForModeration(c *gin.Context) {
	page, pageSize := h.getPaginationParams(c)

	// Build filters from query parameters
	filters := dto.ReportFilters{}

	if status := c.Query("status"); status != "" {
		filters.Status = &status
	}

	if priority := c.Query("priority"); priority != "" {
		filters.Priority = &priority
	}

	if category := c.Query("category"); category != "" {
		filters.Category = &category
	}

	status := ""
	priority := ""
	if filters.Status != nil {
		status = *filters.Status
	}
	if filters.Priority != nil {
		priority = *filters.Priority
	}
	reports, err := h.reportService.GetForModeration(page, pageSize, status, priority)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve reports", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, reports)
}

// Helper methods

// getPaginationParams extracts and validates pagination parameters from query string
func (h *ModerationHandler) getPaginationParams(c *gin.Context) (int, int) {
	page := 1
	pageSize := 20

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if ps := c.Query("pageSize"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 100 {
			pageSize = parsed
		}
	}

	return page, pageSize

}

// toModerationActionResponse converts a ModerationAction model to response DTO
func (h *ModerationHandler) toModerationActionResponse(action *models.ModerationAction) dto.ModerationActionResponse {
	response := dto.ModerationActionResponse{
		ID:             action.ID.String(),
		ReportID:       action.ReportID.String(),
		ContentType:    string(action.ContentType),
		ContentID:      action.ContentID.String(),
		ReportedUserID: action.ReportedUserID.String(),
		Action:         string(action.Action),
		Reason:         action.Reason,
		CreatedAt:      action.CreatedAt,
		Moderator: dto.AnonymousAuthor{
			ID:       action.Moderator.ID.String(),
			Username: action.Moderator.Username,
			Role:     string(action.Moderator.Role),
		},
	}

	if action.BanExpiresAt != nil {
		response.BanExpiresAt = action.BanExpiresAt
	}

	return response
}

func (h *ModerationHandler) GetModerationStats(c *gin.Context) {
	var moderatorID *uuid.UUID

	// Check if filtering by specific moderator
	if modID := c.Query("moderator_id"); modID != "" {
		parsedID, err := uuid.Parse(modID)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid moderator ID format", "INVALID_ID_FORMAT", nil))
			return
		}
		moderatorID = &parsedID
	}

	stats, err := h.moderationService.GetModerationStats(moderatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve moderation statistics", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, stats)
}
