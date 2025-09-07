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

// ThreadHandler handles HTTP requests for threads
type ThreadHandler struct {
	threadService services.ThreadService
}

// NewThreadHandler creates a new instance of ThreadHandler
func NewThreadHandler(threadService services.ThreadService) *ThreadHandler {
	return &ThreadHandler{threadService: threadService}
}

func (h *ThreadHandler) Create(c *gin.Context) {
	var req dto.CreateThreadRequest
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

	// Get user ID from context
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

	roleVal, _ := c.Get(middleware.ContextUserRoleKey)
	userRole := models.RoleUser
	if roleVal != nil {
		userRole = roleVal.(models.UserRole)
	}
	thread, err := h.threadService.Create(req, userID.(uuid.UUID), userRole)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrCategoryNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Category not found", "CATEGORY_NOT_FOUND", nil))
		case errors.Is(err, services.ErrCategoryLocked):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Category is locked for new threads", "CATEGORY_LOCKED", nil))
		case errors.Is(err, services.ErrCategoryPrivate):
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Category is private. Join to create threads.", "CATEGORY_PRIVATE", nil))
		case err.Error() == "INVALID_CATEGORY_ID":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid category ID format", "INVALID_CATEGORY_ID", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to create thread", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	// Get thread with details for response
	uid := userID.(uuid.UUID)
	threadWithDetails, err := h.threadService.GetByID(thread.ID, &uid, &userRole, nil)
	if err != nil {
		// Thread was created but we couldn't fetch details, return basic success
		c.JSON(http.StatusCreated, gin.H{
			"message": "Thread created successfully",
			"id":      thread.ID.String(),
		})
		return
	}

	c.JSON(http.StatusCreated, h.toThreadResponse(threadWithDetails))
}

func (h *ThreadHandler) GetAll(c *gin.Context) {
	page, pageSize := h.getPaginationParams(c)

	threads, err := h.threadService.GetAll(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve threads", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, threads)
}

func (h *ThreadHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid thread ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	// Get user context if available (for access control)
	var userID *uuid.UUID
	var userRole *models.UserRole

	if uid, exists := c.Get(middleware.ContextUserIDKey); exists {
		parsedUID := uid.(uuid.UUID)
		userID = &parsedUID
	}

	if role, exists := c.Get(middleware.ContextUserRoleKey); exists {
		parsedRole := role.(models.UserRole)
		userRole = &parsedRole
	}

	// Optional password for private thread access
	var pwd *string
	if p := c.Query("password"); p != "" {
		pwd = &p
	}
	thread, err := h.threadService.GetByID(id, userID, userRole, pwd)
	if err != nil {
		if errors.Is(err, services.ErrThreadNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Thread not found", "THREAD_NOT_FOUND", nil))
			return
		}
		if errors.Is(err, services.ErrThreadPrivate) {
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Thread is private. Provide valid password or permission.", "THREAD_PRIVATE", nil))
			return
		}
		if errors.Is(err, services.ErrCategoryPrivate) {
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Category is private. Join to view this thread.", "CATEGORY_PRIVATE", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve thread", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, h.toThreadResponse(thread))
}

func (h *ThreadHandler) GetByCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid category ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	page, pageSize := h.getPaginationParams(c)

	var userID *uuid.UUID
	if uid, exists := c.Get(middleware.ContextUserIDKey); exists {
		parsed := uid.(uuid.UUID)
		userID = &parsed
	}

	threads, err := h.threadService.GetByCategory(categoryID, page, pageSize, userID)
	if err != nil {
		if errors.Is(err, services.ErrCategoryNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Category not found", "CATEGORY_NOT_FOUND", nil))
			return
		}
		if errors.Is(err, services.ErrCategoryPrivate) {
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Category is private. Join to view threads.", "CATEGORY_PRIVATE", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve threads", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, threads)
}

func (h *ThreadHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Search query is required", "MISSING_QUERY", nil))
		return
	}

	page, pageSize := h.getPaginationParams(c)

	threads, err := h.threadService.Search(query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to search threads", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, threads)
}

func (h *ThreadHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid thread ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.UpdateThreadRequest
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

	// Get user context
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}

	userRole, exists := c.Get(middleware.ContextUserRoleKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User role not found in context", "CONTEXT_ERROR", nil))
		return
	}

	thread, err := h.threadService.Update(id, req, userID.(uuid.UUID), userRole.(models.UserRole))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrThreadNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Thread not found", "THREAD_NOT_FOUND", nil))
		case errors.Is(err, services.ErrUnauthorizedAccess):
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Unauthorized access", "UNAUTHORIZED_ACCESS", nil))
		case errors.Is(err, services.ErrThreadLocked):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Thread is locked", "THREAD_LOCKED", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update thread", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	// Get updated thread with details
	uid := userID.(uuid.UUID)
	role := userRole.(models.UserRole)
	updatedThread, err := h.threadService.GetByID(thread.ID, &uid, &role, nil)
	if err != nil {
		// Return basic response if we can't fetch details
		c.JSON(http.StatusOK, gin.H{
			"message": "Thread updated successfully",
			"id":      thread.ID.String(),
		})
		return
	}

	c.JSON(http.StatusOK, h.toThreadResponse(updatedThread))
}

func (h *ThreadHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid thread ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	// Get user context
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User ID not found in context", "CONTEXT_ERROR", nil))
		return
	}

	userRole, exists := c.Get(middleware.ContextUserRoleKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("User role not found in context", "CONTEXT_ERROR", nil))
		return
	}

	err = h.threadService.Delete(id, userID.(uuid.UUID), userRole.(models.UserRole))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrThreadNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Thread not found", "THREAD_NOT_FOUND", nil))
		case errors.Is(err, services.ErrUnauthorizedAccess):
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Unauthorized access", "UNAUTHORIZED_ACCESS", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to delete thread", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("Thread deleted successfully"))
}

func (h *ThreadHandler) ModerateThread(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid thread ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.ThreadModerationRequest
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

	err = h.threadService.ModerateThread(id, req, moderatorID.(uuid.UUID))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrThreadNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Thread not found", "THREAD_NOT_FOUND", nil))
		case err.Error() == "INVALID_MODERATION_ACTION":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid moderation action", "INVALID_MODERATION_ACTION", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to moderate thread", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("Thread moderated successfully"))
}

func (h *ThreadHandler) GetPinned(c *gin.Context) {
	page, pageSize := h.getPaginationParams(c)

	threads, err := h.threadService.GetPinned(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve pinned threads", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, threads)
}

// Helper methods

// getPaginationParams extracts and validates pagination parameters from query string
func (h *ThreadHandler) getPaginationParams(c *gin.Context) (int, int) {
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

// toThreadResponse converts a Thread model to ThreadResponse DTO
func (h *ThreadHandler) toThreadResponse(thread *models.Thread) dto.ThreadResponse {
	return dto.ThreadResponse{
		ID:             thread.ID.String(),
		Title:          thread.Title,
		Content:        thread.Content,
		AuthorUsername: thread.Author.Username,
		CategoryID:     thread.CategoryID.String(),
		CategoryName:   thread.Category.Name,
		CategorySlug:   thread.Category.Slug,
		ReplyCount:     thread.ReplyCount,
		ViewCount:      thread.ViewCount,
		IsPinned:       thread.IsPinned,
		IsLocked:       thread.IsLocked,
		IsPrivate:      thread.IsPrivate,
		AssignedModeratorID: func() *string {
			if thread.AssignedModeratorID != nil {
				s := thread.AssignedModeratorID.String()
				return &s
			}
			return nil
		}(),
		AssignedModeratorUsername: func() *string {
			if thread.AssignedModerator != nil {
				s := thread.AssignedModerator.Username
				return &s
			}
			return nil
		}(),
		ModerationStatus: string(thread.ModerationStatus),
		IsEdited:         thread.IsEdited,
		CreatedAt:        thread.CreatedAt,
		UpdatedAt:        thread.UpdatedAt,
		LastReplyAt:      thread.LastReplyAt,
	}
}
