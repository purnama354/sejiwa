package services

import (
	"errors"
	"math"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrReplyNotFound       = errors.New("REPLY_NOT_FOUND")
	ErrParentReplyNotFound = errors.New("PARENT_REPLY_NOT_FOUND")
	ErrInvalidNesting      = errors.New("INVALID_NESTING_LEVEL")
	ErrMaxNestingLevel     = errors.New("MAX_NESTING_LEVEL_EXCEEDED")
)

const MaxNestingLevel = 3 // Limit nesting to prevent deep threads

// ReplyService defines the interface for reply-related business logic
type ReplyService interface {
	Create(threadID uuid.UUID, req dto.CreateReplyRequest, authorID uuid.UUID) (*models.Reply, error)
	GetByID(id uuid.UUID, userID *uuid.UUID, userRole *models.UserRole) (*models.Reply, error)
	GetByThread(threadID uuid.UUID, page, pageSize int, nested bool) (*dto.ReplyListResponse, error)
	GetByAuthor(authorID uuid.UUID, page, pageSize int) (*dto.ReplyListResponse, error)
	Update(id uuid.UUID, req dto.UpdateReplyRequest, userID uuid.UUID, userRole models.UserRole) (*models.Reply, error)
	Delete(id uuid.UUID, userID uuid.UUID, userRole models.UserRole) error
	ModerateReply(id uuid.UUID, req dto.ReplyModerationRequest, moderatorID uuid.UUID) error
}

type replyService struct {
	replyRepo  repository.ReplyRepository
	threadRepo repository.ThreadRepository
	userRepo   repository.UserRepository
}

// NewReplyService creates a new instance of ReplyService
func NewReplyService(
	replyRepo repository.ReplyRepository,
	threadRepo repository.ThreadRepository,
	userRepo repository.UserRepository,
) ReplyService {
	return &replyService{
		replyRepo:  replyRepo,
		threadRepo: threadRepo,
		userRepo:   userRepo,
	}
}

// Create handles the business logic for creating a new reply
func (s *replyService) Create(threadID uuid.UUID, req dto.CreateReplyRequest, authorID uuid.UUID) (*models.Reply, error) {
	// Verify thread exists and is not locked
	thread, err := s.threadRepo.FindByID(threadID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrThreadNotFound
		}
		return nil, err
	}

	if thread.IsLocked {
		return nil, ErrThreadLocked
	}

	// Validate parent reply if specified
	var parentReplyID *uuid.UUID
	if req.ParentReplyID != nil && *req.ParentReplyID != "" {
		parentID, err := uuid.Parse(*req.ParentReplyID)
		if err != nil {
			return nil, errors.New("INVALID_PARENT_REPLY_ID")
		}

		parentReply, err := s.replyRepo.FindByID(parentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrParentReplyNotFound
			}
			return nil, err
		}

		// Ensure parent reply belongs to the same thread
		if parentReply.ThreadID != threadID {
			return nil, errors.New("PARENT_REPLY_THREAD_MISMATCH")
		}

		// Check nesting level (prevent too deep nesting for UX)
		nestingLevel := s.calculateNestingLevel(parentReply)
		if nestingLevel >= MaxNestingLevel {
			return nil, ErrMaxNestingLevel
		}

		parentReplyID = &parentID
	}

	// Create new reply
	reply := &models.Reply{
		Content:          req.Content,
		AuthorID:         authorID,
		ThreadID:         threadID,
		ParentReplyID:    parentReplyID,
		ModerationStatus: models.ModerationStatusApproved,
	}

	// Save reply to database
	if err := s.replyRepo.Create(reply); err != nil {
		return nil, err
	}

	// Update thread reply count and last reply time
	go func() {
		s.threadRepo.IncrementReplyCount(threadID)
		s.updateUserReplyCount(authorID, 1)
	}()

	return reply, nil
}

// GetByID retrieves a reply by ID with access control
func (s *replyService) GetByID(id uuid.UUID, userID *uuid.UUID, userRole *models.UserRole) (*models.Reply, error) {
	reply, err := s.replyRepo.FindByIDWithDetails(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReplyNotFound
		}
		return nil, err
	}

	// Check if reply is accessible (not hidden/deleted unless user is author or moderator)
	if reply.ModerationStatus == models.ModerationStatusHidden ||
		reply.ModerationStatus == models.ModerationStatusDeleted {
		canAccess := false
		if userID != nil && *userID == reply.AuthorID {
			canAccess = true // Author can see their own hidden/deleted content
		}
		if userRole != nil && (*userRole == models.RoleAdmin || *userRole == models.RoleModerator) {
			canAccess = true // Moderators and admins can see hidden/deleted content
		}

		if !canAccess {
			return nil, ErrReplyNotFound
		}
	}

	return reply, nil
}

// GetByThread retrieves replies for a specific thread with pagination
func (s *replyService) GetByThread(threadID uuid.UUID, page, pageSize int, nested bool) (*dto.ReplyListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// Verify thread exists
	_, err := s.threadRepo.FindByID(threadID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrThreadNotFound
		}
		return nil, err
	}

	offset := (page - 1) * pageSize
	var replies []models.Reply
	var total int64

	if nested {
		replies, total, err = s.replyRepo.FindByThreadWithNesting(threadID, offset, pageSize)
	} else {
		replies, total, err = s.replyRepo.FindByThread(threadID, offset, pageSize)
	}

	if err != nil {
		return nil, err
	}

	return s.buildReplyListResponse(replies, total, page, pageSize, nested), nil
}

// GetByAuthor retrieves replies by author with pagination
func (s *replyService) GetByAuthor(authorID uuid.UUID, page, pageSize int) (*dto.ReplyListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	replies, total, err := s.replyRepo.FindByAuthor(authorID, offset, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildReplyListResponse(replies, total, page, pageSize, false), nil
}

// Update handles reply update logic
func (s *replyService) Update(id uuid.UUID, req dto.UpdateReplyRequest, userID uuid.UUID, userRole models.UserRole) (*models.Reply, error) {
	reply, err := s.replyRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReplyNotFound
		}
		return nil, err
	}

	// Check permissions: only author or admin/moderator can update
	if reply.AuthorID != userID && userRole != models.RoleAdmin && userRole != models.RoleModerator {
		return nil, ErrUnauthorizedAccess
	}

	// Check if thread is locked (only admins/moderators can edit in locked threads)
	thread, err := s.threadRepo.FindByID(reply.ThreadID)
	if err != nil {
		return nil, err
	}

	if thread.IsLocked && userRole != models.RoleAdmin && userRole != models.RoleModerator {
		return nil, ErrThreadLocked
	}

	// Apply updates
	if req.Content != nil {
		reply.Content = *req.Content
		reply.IsEdited = true
	}

	if err := s.replyRepo.Update(reply); err != nil {
		return nil, err
	}

	return reply, nil
}

// Delete handles reply deletion logic
func (s *replyService) Delete(id uuid.UUID, userID uuid.UUID, userRole models.UserRole) error {
	reply, err := s.replyRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrReplyNotFound
		}
		return err
	}

	// Check permissions: only author or admin/moderator can delete
	if reply.AuthorID != userID && userRole != models.RoleAdmin && userRole != models.RoleModerator {
		return ErrUnauthorizedAccess
	}

	// Soft delete the reply
	if err := s.replyRepo.Delete(id); err != nil {
		return err
	}

	// Update thread reply count and user reply count
	go func() {
		s.threadRepo.DecrementReplyCount(reply.ThreadID)
		s.updateUserReplyCount(reply.AuthorID, -1)
	}()

	return nil
}

// ModerateReply handles moderation actions on replies
func (s *replyService) ModerateReply(id uuid.UUID, req dto.ReplyModerationRequest, moderatorID uuid.UUID) error {
	reply, err := s.replyRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrReplyNotFound
		}
		return err
	}

	// Apply moderation action
	switch req.Action {
	case "hide":
		reply.ModerationStatus = models.ModerationStatusHidden
	case "unhide":
		reply.ModerationStatus = models.ModerationStatusApproved
	case "delete":
		reply.ModerationStatus = models.ModerationStatusDeleted
	default:
		return errors.New("INVALID_MODERATION_ACTION")
	}

	if err := s.replyRepo.Update(reply); err != nil {
		return err
	}

	// TODO: Create moderation action record for audit trail
	// This would be implemented when we add the moderation_actions table

	return nil
}

// Helper methods

// calculateNestingLevel calculates how deep a reply is nested
func (s *replyService) calculateNestingLevel(reply *models.Reply) int {
	level := 1
	current := reply

	for current.ParentReplyID != nil {
		parent, err := s.replyRepo.FindByID(*current.ParentReplyID)
		if err != nil {
			break
		}
		level++
		current = parent

		// Safety check to prevent infinite loops
		if level > 10 {
			break
		}
	}

	return level
}

// buildReplyListResponse converts reply models to response DTOs
func (s *replyService) buildReplyListResponse(replies []models.Reply, total int64, page, pageSize int, nested bool) *dto.ReplyListResponse {
	replyResponses := make([]dto.ReplyResponse, len(replies))
	for i, reply := range replies {
		replyResponses[i] = s.toReplyResponse(&reply, nested)
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.ReplyListResponse{
		Replies:    replyResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// toReplyResponse converts a Reply model to ReplyResponse DTO
func (s *replyService) toReplyResponse(reply *models.Reply, includeChildren bool) dto.ReplyResponse {
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
			childResponses[i] = s.toReplyResponse(&child, false) // Don't nest children of children
		}
		response.ChildReplies = childResponses
	}

	return response
}

// updateUserReplyCount updates the user's reply count
func (s *replyService) updateUserReplyCount(userID uuid.UUID, delta int) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	user.ReplyCount += delta
	if user.ReplyCount < 0 {
		user.ReplyCount = 0
	}

	// TODO: Add Update method to UserRepository
	// For now, we'll skip this as the UserRepository doesn't have an Update method yet
	return nil
}
