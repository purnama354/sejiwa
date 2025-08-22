package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/repository"
	"github.com/purnama354/sejiwa-api/internal/utils"
)

type ModeratorNoteService struct {
	noteRepo *repository.ModeratorNoteRepository
	userRepo repository.UserRepository // FIX: use interface, not pointer to interface
}

func NewModeratorNoteService(noteRepo *repository.ModeratorNoteRepository, userRepo repository.UserRepository) *ModeratorNoteService {
	return &ModeratorNoteService{
		noteRepo: noteRepo,
		userRepo: userRepo,
	}
}

func (s *ModeratorNoteService) CreateNote(userID, moderatorID uuid.UUID, req *dto.CreateModeratorNoteRequest) (*dto.ModeratorNoteResponse, *utils.ErrorResponse) {
	// Verify that the user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			return nil, &utils.ErrorResponse{
				Code:    utils.ErrCodeUserNotFound,
				Message: "User not found",
			}
		}
		return nil, &utils.ErrorResponse{
			Code:    utils.ErrCodeInternalServer,
			Message: "Failed to verify user",
		}
	}

	// Create the moderator note
	note := &models.ModeratorNote{
		UserID:      userID,
		ModeratorID: moderatorID,
		Note:        req.Note,
	}

	if err := s.noteRepo.Create(note); err != nil {
		return nil, &utils.ErrorResponse{
			Code:    utils.ErrCodeInternalServer,
			Message: "Failed to create moderator note",
		}
	}

	// Get the created note with moderator info
	createdNote, err := s.noteRepo.GetByID(note.ID)
	if err != nil {
		return nil, &utils.ErrorResponse{
			Code:    utils.ErrCodeInternalServer,
			Message: "Failed to retrieve created note",
		}
	}

	return s.toModeratorNoteResponse(createdNote), nil
}

func (s *ModeratorNoteService) GetNotesByUserID(userID uuid.UUID, page, limit int) (*dto.ModeratorNotesListResponse, *utils.ErrorResponse) {
	// Verify that the user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFound) {
			return nil, &utils.ErrorResponse{
				Code:    utils.ErrCodeUserNotFound,
				Message: "User not found",
			}
		}
		return nil, &utils.ErrorResponse{
			Code:    utils.ErrCodeInternalServer,
			Message: "Failed to verify user",
		}
	}

	offset := (page - 1) * limit
	notes, total, err := s.noteRepo.GetByUserID(userID, limit, offset)
	if err != nil {
		return nil, &utils.ErrorResponse{
			Code:    utils.ErrCodeInternalServer,
			Message: "Failed to retrieve moderator notes",
		}
	}

	// Convert to response DTOs
	noteResponses := make([]dto.ModeratorNoteResponse, len(notes))
	for i, note := range notes {
		noteResponses[i] = *s.toModeratorNoteResponse(&note)
	}

	pagination := utils.CalculatePagination(total, int64(page), int64(limit))

	return &dto.ModeratorNotesListResponse{
		Notes:      noteResponses,
		Pagination: pagination,
	}, nil
}

func (s *ModeratorNoteService) DeleteNote(noteID, moderatorID uuid.UUID) *utils.ErrorResponse {
	// Get the note to verify it exists and check ownership
	note, err := s.noteRepo.GetByID(noteID)
	if err != nil {
		return &utils.ErrorResponse{
			Code:    utils.ErrCodeNotFound,
			Message: "Moderator note not found",
		}
	}

	// Only the creator or admin can delete the note
	// This check would be enhanced with role checking in the handler
	if note.ModeratorID != moderatorID {
		return &utils.ErrorResponse{
			Code:    utils.ErrCodeForbidden,
			Message: "You can only delete your own moderator notes",
		}
	}

	if err := s.noteRepo.Delete(noteID); err != nil {
		return &utils.ErrorResponse{
			Code:    utils.ErrCodeInternalServer,
			Message: "Failed to delete moderator note",
		}
	}

	return nil
}

func (s *ModeratorNoteService) toModeratorNoteResponse(note *models.ModeratorNote) *dto.ModeratorNoteResponse {
	response := &dto.ModeratorNoteResponse{
		ID:          note.ID,
		UserID:      note.UserID,
		ModeratorID: note.ModeratorID,
		Note:        note.Note,
		CreatedAt:   note.CreatedAt,
	}

	if note.Moderator.Username != "" {
		response.ModeratorUsername = &note.Moderator.Username
	}

	return response
}
