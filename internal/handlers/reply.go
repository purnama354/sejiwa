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

// ReplyHandler handles HTTP requests for replies
type ReplyHandler struct {
	replyService services.ReplyService
}

// NewReplyHandler creates a new instance of ReplyHandler
func NewReplyHandler(replyService services.ReplyService) *ReplyHandler {
	return &ReplyHandler{replyService: replyService}
}

func (h *ReplyHandler) Create(c *gin.Context) {
	threadID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid thread ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.CreateReplyRequest
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

	reply, err := h.replyService.Create(threadID, req, userID.(uuid.UUID))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrThreadNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Thread not found", "THREAD_NOT_FOUND", nil))
		case errors.Is(err, services.ErrParentReplyNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Parent reply not found", "PARENT_REPLY_NOT_FOUND", nil))
		case errors.Is(err, services.ErrThreadLocked):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Thread is locked", "THREAD_LOCKED", nil))
		case errors.Is(err, services.ErrMaxNestingLevel):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Maximum nesting level exceeded", "MAX_NESTING_LEVEL_EXCEEDED", nil))
		case err.Error() == "INVALID_PARENT_REPLY_ID":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid parent reply ID format", "INVALID_PARENT_REPLY_ID", nil))
		case err.Error() == "PARENT_REPLY_THREAD_MISMATCH":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Parent reply does not belong to this thread", "PARENT_REPLY_THREAD_MISMATCH", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to create reply", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	// Get reply with details for response
	uid := userID.(uuid.UUID)
	replyWithDetails, err := h.replyService.GetByID(reply.ID, &uid, nil)
	if err != nil {
		// Reply was created but we couldn't fetch details, return basic success
		c.JSON(http.StatusCreated, gin.H{
			"message": "Reply created successfully",
			"id":      reply.ID.String(),
		})
		return
	}

	c.JSON(http.StatusCreated, h.toReplyResponse(replyWithDetails, false))
}

func (h *ReplyHandler) GetByThread(c *gin.Context) {
	threadID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid thread ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	page, pageSize := h.getPaginationParams(c)
	nested := c.Query("nested") == "true"

	// Optional user context for access checks on private content
	var userID *uuid.UUID
	var userRole *models.UserRole
	if uid, exists := c.Get(middleware.ContextUserIDKey); exists {
		u := uid.(uuid.UUID)
		userID = &u
	}
	if role, exists := c.Get(middleware.ContextUserRoleKey); exists {
		r := role.(models.UserRole)
		userRole = &r
	}

	replies, err := h.replyService.GetByThread(threadID, page, pageSize, nested, userID, userRole)
	if err != nil {
		if errors.Is(err, services.ErrThreadNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Thread not found", "THREAD_NOT_FOUND", nil))
			return
		}
		if errors.Is(err, services.ErrCategoryPrivate) {
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Category is private. Join to view replies.", "CATEGORY_PRIVATE", nil))
			return
		}
		if errors.Is(err, services.ErrThreadPrivate) {
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Thread is private.", "THREAD_PRIVATE", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve replies", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, replies)
}

func (h *ReplyHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid reply ID format", "INVALID_ID_FORMAT", nil))
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

	reply, err := h.replyService.GetByID(id, userID, userRole)
	if err != nil {
		if errors.Is(err, services.ErrReplyNotFound) {
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Reply not found", "REPLY_NOT_FOUND", nil))
			return
		}
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to retrieve reply", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	c.JSON(http.StatusOK, h.toReplyResponse(reply, true))
}

func (h *ReplyHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid reply ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.UpdateReplyRequest
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

	reply, err := h.replyService.Update(id, req, userID.(uuid.UUID), userRole.(models.UserRole))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrReplyNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Reply not found", "REPLY_NOT_FOUND", nil))
		case errors.Is(err, services.ErrUnauthorizedAccess):
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Unauthorized access", "UNAUTHORIZED_ACCESS", nil))
		case errors.Is(err, services.ErrThreadLocked):
			c.JSON(http.StatusConflict, dto.NewErrorResponse("Thread is locked", "THREAD_LOCKED", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update reply", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	// Get updated reply with details
	uid := userID.(uuid.UUID)
	role := userRole.(models.UserRole)
	updatedReply, err := h.replyService.GetByID(reply.ID, &uid, &role)
	if err != nil {
		// Return basic response if we can't fetch details
		c.JSON(http.StatusOK, gin.H{
			"message": "Reply updated successfully",
			"id":      reply.ID.String(),
		})
		return
	}

	c.JSON(http.StatusOK, h.toReplyResponse(updatedReply, true))
}

func (h *ReplyHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid reply ID format", "INVALID_ID_FORMAT", nil))
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

	err = h.replyService.Delete(id, userID.(uuid.UUID), userRole.(models.UserRole))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrReplyNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Reply not found", "REPLY_NOT_FOUND", nil))
		case errors.Is(err, services.ErrUnauthorizedAccess):
			c.JSON(http.StatusForbidden, dto.NewErrorResponse("Unauthorized access", "UNAUTHORIZED_ACCESS", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to delete reply", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("Reply deleted successfully"))
}

func (h *ReplyHandler) ModerateReply(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid reply ID format", "INVALID_ID_FORMAT", nil))
		return
	}

	var req dto.ReplyModerationRequest
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

	err = h.replyService.ModerateReply(id, req, moderatorID.(uuid.UUID))
	if err != nil {
		switch {
		case errors.Is(err, services.ErrReplyNotFound):
			c.JSON(http.StatusNotFound, dto.NewErrorResponse("Reply not found", "REPLY_NOT_FOUND", nil))
		case err.Error() == "INVALID_MODERATION_ACTION":
			c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid moderation action", "INVALID_MODERATION_ACTION", nil))
		default:
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to moderate reply", "INTERNAL_SERVER_ERROR", nil))
		}
		return
	}

	c.JSON(http.StatusOK, dto.NewSuccessResponse("Reply moderated successfully"))
}

// Helper methods

// getPaginationParams extracts and validates pagination parameters from query string
func (h *ReplyHandler) getPaginationParams(c *gin.Context) (int, int) {
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

// toReplyResponse converts a Reply model to ReplyResponse DTO
func (h *ReplyHandler) toReplyResponse(reply *models.Reply, includeChildren bool) dto.ReplyResponse {
	response := dto.ReplyResponse{
		ID:               reply.ID.String(),
		Content:          reply.Content,
		AuthorUsername:   reply.Author.Username,
		ThreadID:         reply.ThreadID.String(),
		ModerationStatus: string(reply.ModerationStatus),
		IsEdited:         reply.IsEdited,
		CreatedAt:        reply.CreatedAt,
		UpdatedAt:        reply.UpdatedAt,
	}

	if reply.ParentReplyID != nil {
		parentID := reply.ParentReplyID.String()
		response.ParentReplyID = &parentID
	}

	// Include child replies if requested and they exist
	if includeChildren && len(reply.ChildReplies) > 0 {
		childResponses := make([]dto.ReplyResponse, len(reply.ChildReplies))
		for i, child := range reply.ChildReplies {
			childResponses[i] = h.toReplyResponse(&child, false) // Don't nest children of children
		}
		response.ChildReplies = childResponses
	}

	return response
}
