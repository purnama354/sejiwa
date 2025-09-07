package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"
)

type ModeratorNoteHandler struct {
	noteService *services.ModeratorNoteService
}

func NewModeratorNoteHandler(noteService *services.ModeratorNoteService) *ModeratorNoteHandler {
	return &ModeratorNoteHandler{noteService: noteService}
}

func (h *ModeratorNoteHandler) CreateNote(c *gin.Context) {
	// Get user ID from URL parameter
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid user ID format", "INVALID_USER_ID", nil))
		return
	}

	// Get moderator ID from JWT token
	moderatorID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Unauthorized access", "UNAUTHORIZED", nil))
		return
	}

	moderatorUUID, ok := moderatorID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Invalid moderator ID", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	// Parse and validate request
	var req dto.CreateModeratorNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", "VALIDATION_ERROR", utils.ParseValidationErrors(err)))
		return
	}

	// Create the note
	noteResponse, errResp := h.noteService.CreateNote(userID, moderatorUUID, &req)
	if errResp != nil {
		statusCode := http.StatusBadRequest
		if errResp.Code == utils.ErrCodeUserNotFound {
			statusCode = http.StatusNotFound
		} else if errResp.Code == utils.ErrCodeForbidden {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, dto.NewErrorResponse(errResp.Message, errResp.Code, nil))
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Moderator note created successfully", "data": noteResponse})
}

func (h *ModeratorNoteHandler) GetNotesByUserID(c *gin.Context) {
	// Get user ID from URL parameter
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid user ID format", "INVALID_USER_ID", nil))
		return
	}

	// Parse pagination parameters
	page, limit := utils.GetPaginationParams(c)

	// Get notes
	notesResponse, errResp := h.noteService.GetNotesByUserID(userID, page, limit)
	if errResp != nil {
		statusCode := http.StatusInternalServerError
		if errResp.Code == utils.ErrCodeUserNotFound {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, dto.NewErrorResponse(errResp.Message, errResp.Code, nil))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Moderator notes retrieved successfully", "data": notesResponse})
}

func (h *ModeratorNoteHandler) DeleteNote(c *gin.Context) {
	// Get note ID from URL parameter
	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid note ID format", "INVALID_NOTE_ID", nil))
		return
	}

	// Get moderator ID from JWT token
	moderatorID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("Unauthorized access", "UNAUTHORIZED", nil))
		return
	}

	moderatorUUID, ok := moderatorID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Invalid moderator ID", "INTERNAL_SERVER_ERROR", nil))
		return
	}

	// Delete the note
	errResp := h.noteService.DeleteNote(noteID, moderatorUUID)
	if errResp != nil {
		statusCode := http.StatusInternalServerError
		if errResp.Code == utils.ErrCodeNotFound {
			statusCode = http.StatusNotFound
		} else if errResp.Code == utils.ErrCodeForbidden {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, dto.NewErrorResponse(errResp.Message, errResp.Code, nil))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Moderator note deleted successfully"})
}
