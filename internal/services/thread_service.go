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
	ErrThreadNotFound     = errors.New("THREAD_NOT_FOUND")
	ErrThreadLocked       = errors.New("THREAD_LOCKED")
	ErrUnauthorizedAccess = errors.New("UNAUTHORIZED_ACCESS")
	ErrCategoryLocked     = errors.New("CATEGORY_LOCKED")
	ErrInvalidPage        = errors.New("INVALID_PAGE_PARAMETER")
)

// ThreadService defines the interface for thread-related business logic
type ThreadService interface {
	Create(req dto.CreateThreadRequest, authorID uuid.UUID) (*models.Thread, error)
	GetByID(id uuid.UUID, userID *uuid.UUID, userRole *models.UserRole) (*models.Thread, error)
	GetAll(page, pageSize int) (*dto.ThreadListResponse, error)
	GetByCategory(categoryID uuid.UUID, page, pageSize int) (*dto.ThreadListResponse, error)
	GetByAuthor(authorID uuid.UUID, page, pageSize int) (*dto.ThreadListResponse, error)
	Search(query string, page, pageSize int) (*dto.ThreadListResponse, error)
	Update(id uuid.UUID, req dto.UpdateThreadRequest, userID uuid.UUID, userRole models.UserRole) (*models.Thread, error)
	Delete(id uuid.UUID, userID uuid.UUID, userRole models.UserRole) error
	ModerateThread(id uuid.UUID, req dto.ThreadModerationRequest, moderatorID uuid.UUID) error
	GetPinned(page, pageSize int) (*dto.ThreadListResponse, error)
}

type threadService struct {
	threadRepo   repository.ThreadRepository
	categoryRepo repository.CategoryRepository
	userRepo     repository.UserRepository
}

// NewThreadService creates a new instance of ThreadService
func NewThreadService(
	threadRepo repository.ThreadRepository,
	categoryRepo repository.CategoryRepository,
	userRepo repository.UserRepository,
) ThreadService {
	return &threadService{
		threadRepo:   threadRepo,
		categoryRepo: categoryRepo,
		userRepo:     userRepo,
	}
}

// Create handles the business logic for creating a new thread
func (s *threadService) Create(req dto.CreateThreadRequest, authorID uuid.UUID) (*models.Thread, error) {
	// Parse and validate category ID
	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return nil, errors.New("INVALID_CATEGORY_ID")
	}

	// Check if category exists and is not locked
	category, err := s.categoryRepo.FindByID(categoryID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	if category.IsLocked {
		return nil, ErrCategoryLocked
	}

	// Create new thread
	thread := &models.Thread{
		Title:            req.Title,
		Content:          req.Content,
		AuthorID:         authorID,
		CategoryID:       categoryID,
		ModerationStatus: models.ModerationStatusApproved,
	}

	// Save thread to database
	if err := s.threadRepo.Create(thread); err != nil {
		return nil, err
	}

	// Update category thread count
	if err := s.categoryRepo.UpdateThreadCount(categoryID, 1); err != nil {
		// Log error but don't fail the operation
		// In a production system, you might want to implement eventual consistency
	}

	// Update user thread count
	if err := s.updateUserThreadCount(authorID, 1); err != nil {
		// Log error but don't fail the operation
	}

	return thread, nil
}

// GetByID retrieves a thread by ID and increments view count
func (s *threadService) GetByID(id uuid.UUID, userID *uuid.UUID, userRole *models.UserRole) (*models.Thread, error) {
	thread, err := s.threadRepo.FindByIDWithDetails(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrThreadNotFound
		}
		return nil, err
	}

	// Check if thread is accessible (not hidden/deleted unless user is author or moderator)
	if thread.ModerationStatus == models.ModerationStatusHidden ||
		thread.ModerationStatus == models.ModerationStatusDeleted {
		canAccess := false
		if userID != nil && *userID == thread.AuthorID {
			canAccess = true // Author can see their own hidden/deleted content
		}
		if userRole != nil && (*userRole == models.RoleAdmin || *userRole == models.RoleModerator) {
			canAccess = true // Moderators and admins can see hidden/deleted content
		}

		if !canAccess {
			return nil, ErrThreadNotFound
		}
	}

	// Increment view count (fire and forget)
	go s.threadRepo.IncrementViewCount(id)

	return thread, nil
}

// GetAll retrieves all threads with pagination
func (s *threadService) GetAll(page, pageSize int) (*dto.ThreadListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20 // Default page size
	}

	offset := (page - 1) * pageSize
	threads, total, err := s.threadRepo.FindAll(offset, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildThreadListResponse(threads, total, page, pageSize), nil
}

// GetByCategory retrieves threads by category with pagination
func (s *threadService) GetByCategory(categoryID uuid.UUID, page, pageSize int) (*dto.ThreadListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// Verify category exists
	_, err := s.categoryRepo.FindByID(categoryID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	offset := (page - 1) * pageSize
	threads, total, err := s.threadRepo.FindByCategory(categoryID, offset, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildThreadListResponse(threads, total, page, pageSize), nil
}

// GetByAuthor retrieves threads by author with pagination
func (s *threadService) GetByAuthor(authorID uuid.UUID, page, pageSize int) (*dto.ThreadListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	threads, total, err := s.threadRepo.FindByAuthor(authorID, offset, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildThreadListResponse(threads, total, page, pageSize), nil
}

// Search performs full-text search on threads
func (s *threadService) Search(query string, page, pageSize int) (*dto.ThreadListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	threads, total, err := s.threadRepo.Search(query, offset, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildThreadListResponse(threads, total, page, pageSize), nil
}

// Update handles thread update logic
func (s *threadService) Update(id uuid.UUID, req dto.UpdateThreadRequest, userID uuid.UUID, userRole models.UserRole) (*models.Thread, error) {
	thread, err := s.threadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrThreadNotFound
		}
		return nil, err
	}

	// Check permissions: only author or admin/moderator can update
	if thread.AuthorID != userID && userRole != models.RoleAdmin && userRole != models.RoleModerator {
		return nil, ErrUnauthorizedAccess
	}

	// Check if thread is locked
	if thread.IsLocked && userRole != models.RoleAdmin && userRole != models.RoleModerator {
		return nil, ErrThreadLocked
	}

	// Apply updates
	if req.Title != nil {
		thread.Title = *req.Title
		thread.IsEdited = true
	}
	if req.Content != nil {
		thread.Content = *req.Content
		thread.IsEdited = true
	}

	if err := s.threadRepo.Update(thread); err != nil {
		return nil, err
	}

	return thread, nil
}

// Delete handles thread deletion logic
func (s *threadService) Delete(id uuid.UUID, userID uuid.UUID, userRole models.UserRole) error {
	thread, err := s.threadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrThreadNotFound
		}
		return err
	}

	// Check permissions: only author or admin/moderator can delete
	if thread.AuthorID != userID && userRole != models.RoleAdmin && userRole != models.RoleModerator {
		return ErrUnauthorizedAccess
	}

	// Soft delete the thread
	if err := s.threadRepo.Delete(id); err != nil {
		return err
	}

	// Update category thread count
	go func() {
		s.categoryRepo.UpdateThreadCount(thread.CategoryID, -1)
		s.updateUserThreadCount(thread.AuthorID, -1)
	}()

	return nil
}

// ModerateThread handles moderation actions on threads
func (s *threadService) ModerateThread(id uuid.UUID, req dto.ThreadModerationRequest, moderatorID uuid.UUID) error {
	thread, err := s.threadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrThreadNotFound
		}
		return err
	}

	// Apply moderation action
	switch req.Action {
	case "pin":
		thread.IsPinned = true
	case "unpin":
		thread.IsPinned = false
	case "lock":
		thread.IsLocked = true
	case "unlock":
		thread.IsLocked = false
	case "hide":
		thread.ModerationStatus = models.ModerationStatusHidden
	case "unhide":
		thread.ModerationStatus = models.ModerationStatusApproved
	case "delete":
		thread.ModerationStatus = models.ModerationStatusDeleted
	default:
		return errors.New("INVALID_MODERATION_ACTION")
	}

	if err := s.threadRepo.Update(thread); err != nil {
		return err
	}

	// TODO: Create moderation action record for audit trail
	// This would be implemented when we add the moderation_actions table

	return nil
}

// GetPinned retrieves pinned threads
func (s *threadService) GetPinned(page, pageSize int) (*dto.ThreadListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	threads, total, err := s.threadRepo.FindPinned(offset, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildThreadListResponse(threads, total, page, pageSize), nil
}

// Helper methods

// buildThreadListResponse converts thread models to response DTOs
func (s *threadService) buildThreadListResponse(threads []models.Thread, total int64, page, pageSize int) *dto.ThreadListResponse {
	threadResponses := make([]dto.ThreadResponse, len(threads))
	for i, thread := range threads {
		threadResponses[i] = dto.ThreadResponse{
			ID:               thread.ID.String(),
			Title:            thread.Title,
			Content:          thread.Content,
			AuthorUsername:   thread.Author.Username,
			CategoryID:       thread.CategoryID.String(),
			CategoryName:     thread.Category.Name,
			CategorySlug:     thread.Category.Slug,
			ReplyCount:       thread.ReplyCount,
			ViewCount:        thread.ViewCount,
			IsPinned:         thread.IsPinned,
			IsLocked:         thread.IsLocked,
			ModerationStatus: string(thread.ModerationStatus),
			IsEdited:         thread.IsEdited,
			CreatedAt:        thread.CreatedAt,
			UpdatedAt:        thread.UpdatedAt,
			LastReplyAt:      thread.LastReplyAt,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.ThreadListResponse{
		Threads:    threadResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// updateUserThreadCount updates the user's thread count
func (s *threadService) updateUserThreadCount(userID uuid.UUID, delta int) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	user.ThreadCount += delta
	if user.ThreadCount < 0 {
		user.ThreadCount = 0
	}

	// Update user in database (you'll need to add an Update method to UserRepository)
	// For now, we'll skip this as the UserRepository doesn't have an Update method yet
	return nil
}
