package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ReportHandler handles HTTP requests for reports
type ReportHandler struct {
	reportService services.ReportService
}

// NewReportHandler creates a new instance of ReportHandler
func NewReportHandler(reportService services.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

func (h *ReportHandler) Create(c *gin.Context) {
	var req dto.CreateReportRequest
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

	// Get reporter ID from context
	reporterID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		errorResponse := dto.NewErrorResponse(
			"User ID not found in context",
			"CONTEXT_ERROR",
			nil,
		)
		c.JSON(http.StatusUnauthorized, errorResponse)
		return
	}

	report, err := h.reportService.Create(req, reporterID.(uuid.UUID))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrContentNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Content not found", "CONTENT_NOT_FOUND", nil))
		case errors.Is(err, services.ErrAlreadyReported):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Content already reported by this user", "ALREADY_REPORTED", nil))
		case errors.Is(err, services.ErrCannotReportSelf):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Cannot report your own content", "CANNOT_REPORT_SELF", nil))
		case err.Error() == "INVALID_CONTENT_ID":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid content ID format", "INVALID_CONTENT_ID", nil))
		case err.Error() == "INVALID_CONTENT_TYPE":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid content type", "INVALID_CONTENT_TYPE", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to submit report", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	// Convert to response
	response := dto.ReportResponse{
		ID:             report.ID.String(),
		ContentType:    string(report.ContentType),
		ContentID:      report.ContentID.String(),
		Reason:         string(report.Reason),
		Description:    report.Description,
		Status:         string(report.Status),
		Priority:       string(report.Priority),
		ReporterID:     report.ReporterID.String(),
		ReportedUserID: report.ReportedUserID.String(),
		CreatedAt:      report.CreatedAt,
		UpdatedAt:      report.UpdatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

func (h *ReportHandler) GetForModeration(c *gin.Context) {
	// Get pagination parameters
	page, pageSize := h.getPaginationParams(c)

	// Get filter parameters
	status := c.Query("status")
	priority := c.Query("priority")

	// Validate status parameter
	if status != "" && !isValidStatus(status) {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid status parameter", "INVALID_STATUS", nil))
		return
	}

	// Validate priority parameter
	if priority != "" && !isValidPriority(priority) {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid priority parameter", "INVALID_PRIORITY", nil))
		return
	}

	reports, err := h.reportService.GetForModeration(page, pageSize, status, priority)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve reports", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, reports)
}

func (h *ReportHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid report ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	report, err := h.reportService.GetByID(id)
	if err != nil {
		if errors.Is(err, services.ErrReportNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Report not found", "REPORT_NOT_FOUND", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve report", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	// Convert to moderation response (simplified for single report)
	response := dto.ModerationReportResponse{
		ID:          report.ID.String(),
		ContentType: string(report.ContentType),
		ContentID:   report.ContentID.String(),
		Reason:      string(report.Reason),
		Description: report.Description,
		Status:      string(report.Status),
		Priority:    string(report.Priority),
		Reporter: dto.AnonymousAuthor{
			ID:       report.Reporter.ID.String(),
			Username: report.Reporter.Username,
			Role:     string(report.Reporter.Role),
		},
		ReportedUser: dto.AnonymousAuthor{
			ID:       report.ReportedUser.ID.String(),
			Username: report.ReportedUser.Username,
			Role:     string(report.ReportedUser.Role),
		},
		CreatedAt: report.CreatedAt,
		UpdatedAt: report.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

func (h *ReportHandler) GetMyReports(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}

	// Get pagination parameters
	page, pageSize := h.getPaginationParams(c)

	reports, err := h.reportService.GetByReporter(userID.(uuid.UUID), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve reports", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, reports)
}

// Helper methods

// getPaginationParams extracts and validates pagination parameters from query string
func (h *ReportHandler) getPaginationParams(c *gin.Context) (int, int) {
	page := 1
	pageSize := 20

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if ps := c.Query("limit"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 100 {
			pageSize = parsed
		}
	}

	return page, pageSize
}

// isValidStatus validates report status parameter
func isValidStatus(status string) bool {
	validStatuses := []string{"pending", "reviewed", "resolved"}
	for _, valid := range validStatuses {
		if status == valid {
			return true
		}
	}
	return false
}

// isValidPriority validates report priority parameter
func isValidPriority(priority string) bool {
	validPriorities := []string{"low", "medium", "high", "critical"}
	for _, valid := range validPriorities {
		if priority == valid {
			return true
		}
	}
	return false
}
