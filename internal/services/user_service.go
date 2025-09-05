package services

import (
	"errors"
	"time"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound = errors.New("USER_NOT_FOUND")
)

// UserService defines the interface for user operations
type UserService interface {
	GetUserProfile(userID uuid.UUID) (*dto.UserProfile, error)
	UpdateUserProfile(userID uuid.UUID, req dto.UpdateUserRequest) (*dto.UserProfile, error)
	ListUsers(role *models.UserRole, status *models.UserStatus, query *string, offset, limit int) ([]models.User, int64, error)
	GetPreferences(userID uuid.UUID) (*models.UserPreferences, error)
	UpdateNotificationPreferences(userID uuid.UUID, req dto.UpdateNotificationPreferencesRequest) (*models.UserPreferences, error)
	UpdatePrivacySettings(userID uuid.UUID, req dto.UpdatePrivacySettingsRequest) (*models.UserPreferences, error)
	GetMyStats(userID uuid.UUID) (*dto.UserStatsResponse, error)
	GetMyActivity(userID uuid.UUID) (*dto.UserActivityResponse, error)
	GetMyCategories(userID uuid.UUID) ([]dto.CategorySubscription, error)
	SubscribeCategory(userID, categoryID uuid.UUID) error
	UnsubscribeCategory(userID, categoryID uuid.UUID) error
	ListSavedThreads(userID uuid.UUID, offset, limit int) ([]dto.ThreadPreview, int64, error)
	SaveThread(userID, threadID uuid.UUID) error
	UnsaveThread(userID, threadID uuid.UUID) error
}

type userService struct {
	userRepo repository.UserRepository
	prefRepo repository.PreferencesRepository
	threadRepo repository.ThreadRepository
	replyRepo  repository.ReplyRepository
	reportRepo repository.ReportRepository
	subRepo    repository.SubscriptionRepository
	savedRepo  repository.SavedThreadRepository
}

// NewUserService creates a new instance of UserService
func NewUserService(userRepo repository.UserRepository, prefRepo repository.PreferencesRepository, threadRepo repository.ThreadRepository, replyRepo repository.ReplyRepository, reportRepo repository.ReportRepository, subRepo repository.SubscriptionRepository, savedRepo repository.SavedThreadRepository) UserService {
	return &userService{
	userRepo: userRepo,
	prefRepo: prefRepo,
		threadRepo: threadRepo,
		replyRepo: replyRepo,
		reportRepo: reportRepo,
	subRepo: subRepo,
	savedRepo: savedRepo,
	}
}

// GetUserProfile retrieves user profile information
func (s *userService) GetUserProfile(userID uuid.UUID) (*dto.UserProfile, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	profile := &dto.UserProfile{
		ID:          user.ID.String(),
		Username:    user.Username,
		CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   user.UpdatedAt.Format(time.RFC3339),
		Status:      string(user.Status),
		Role:        string(user.Role),
		ThreadCount: user.ThreadCount,
		ReplyCount:  user.ReplyCount,
	}

	if user.LastActiveAt != nil {
		profile.LastActiveAt = user.LastActiveAt.Format(time.RFC3339)
	} else {
		profile.LastActiveAt = time.Now().Format(time.RFC3339)
	}

	return profile, nil
}

// UpdateUserProfile updates user profile information
func (s *userService) UpdateUserProfile(userID uuid.UUID, req dto.UpdateUserRequest) (*dto.UserProfile, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// Check if username is being updated
	if req.Username != nil {
		// Check if new username already exists (but not for the current user)
		existingUser, err := s.userRepo.FindByUsername(*req.Username)
		if err == nil && existingUser.ID != user.ID {
			return nil, ErrUserExists
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		// Update username
		user.Username = *req.Username
	}

	// Update last active time
	now := time.Now()
	user.LastActiveAt = &now

	// Save updated user
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	// Return updated profile
	return s.GetUserProfile(userID)
}

// ListUsers returns users with optional filters and pagination
func (s *userService) ListUsers(role *models.UserRole, status *models.UserStatus, query *string, offset, limit int) ([]models.User, int64, error) {
	return s.userRepo.List(role, status, query, offset, limit)
}

// GetPreferences fetches or creates default preferences for a user
func (s *userService) GetPreferences(userID uuid.UUID) (*models.UserPreferences, error) {
	if s.prefRepo == nil {
		return nil, errors.New("preferences repository not initialized")
	}
	pref, err := s.prefRepo.GetByUserID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// create defaults
			p := &models.UserPreferences{
				UserID:              userID,
				NotifyThreadReplies: true,
				NotifyMentions:      true,
				NotifyAnnouncements: true,
				ContentVisibility:   models.ContentVisibilityAll,
				ShowActiveStatus:    true,
				AllowDirectMessages: true,
			}
			if err := s.prefRepo.Upsert(p); err != nil {
				return nil, err
			}
			return p, nil
		}
		return nil, err
	}
	return pref, nil
}

func (s *userService) UpdateNotificationPreferences(userID uuid.UUID, req dto.UpdateNotificationPreferencesRequest) (*models.UserPreferences, error) {
	pref, err := s.GetPreferences(userID)
	if err != nil {
		return nil, err
	}
	if req.ThreadReplies != nil {
		pref.NotifyThreadReplies = *req.ThreadReplies
	}
	if req.Mentions != nil {
		pref.NotifyMentions = *req.Mentions
	}
	if req.CategoryUpdates != nil {
		pref.NotifyCategoryUpdates = *req.CategoryUpdates
	}
	if req.CommunityAnnouncements != nil {
		pref.NotifyAnnouncements = *req.CommunityAnnouncements
	}
	if err := s.prefRepo.Upsert(pref); err != nil {
		return nil, err
	}
	return pref, nil
}

func (s *userService) UpdatePrivacySettings(userID uuid.UUID, req dto.UpdatePrivacySettingsRequest) (*models.UserPreferences, error) {
	pref, err := s.GetPreferences(userID)
	if err != nil {
		return nil, err
	}
	if req.ShowActiveStatus != nil {
		pref.ShowActiveStatus = *req.ShowActiveStatus
	}
	if req.AllowDirectMessages != nil {
		pref.AllowDirectMessages = *req.AllowDirectMessages
	}
	if req.ContentVisibility != nil {
		// basic validation
		cv := models.ContentVisibility(*req.ContentVisibility)
		switch cv {
		case models.ContentVisibilityAll, models.ContentVisibilityCategories, models.ContentVisibilityNone:
			pref.ContentVisibility = cv
		}
	}
	if err := s.prefRepo.Upsert(pref); err != nil {
		return nil, err
	}
	return pref, nil
}

// GetMyStats aggregates basic user metrics
func (s *userService) GetMyStats(userID uuid.UUID) (*dto.UserStatsResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	// threads
	_, threadTotal, err := s.threadRepo.FindByAuthor(userID, 0, 1)
	if err != nil {
		return nil, err
	}
	// replies
	_, replyTotal, err := s.replyRepo.FindByAuthor(userID, 0, 1)
	if err != nil {
		return nil, err
	}
	// reports submitted by user
	_, reportTotal, err := s.reportRepo.FindByReporter(userID, 0, 1)
	if err != nil {
		return nil, err
	}
	activeDays := int(time.Since(user.CreatedAt).Hours() / 24)
	streak := 0
	if user.LastActiveAt != nil {
		if time.Since(*user.LastActiveAt) < 48*time.Hour { // simple heuristic
			streak = 1
		}
	}
	karma := int(threadTotal*2 + replyTotal)
	resp := &dto.UserStatsResponse{
		ThreadsCreated:   int(threadTotal),
		RepliesPosted:    int(replyTotal),
		ThreadsLiked:     0,
		ThreadsSaved:     0,
		ActiveDays:       activeDays,
		StreakDays:       streak,
		CategoriesJoined: 0,
		ReportCount:      int(reportTotal),
		KarmaPoints:      karma,
	}
	return resp, nil
}

// GetMyActivity returns recent threads and replies by the user
func (s *userService) GetMyActivity(userID uuid.UUID) (*dto.UserActivityResponse, error) {
	threads, _, err := s.threadRepo.FindByAuthor(userID, 0, 5)
	if err != nil {
		return nil, err
	}
	replies, _, err := s.replyRepo.FindByAuthor(userID, 0, 5)
	if err != nil {
		return nil, err
	}
	tpreviews := make([]dto.ThreadPreview, 0, len(threads))
	for _, t := range threads {
		preview := t.Content
		if len(preview) > 140 {
			preview = preview[:140]
		}
		tpreviews = append(tpreviews, dto.ThreadPreview{
			ID:           t.ID.String(),
			Title:        t.Title,
			Category:     t.Category.Name,
			CategorySlug: t.Category.Slug,
			Replies:      t.ReplyCount,
			CreatedAt:    t.CreatedAt.Format(time.RFC3339),
			Preview:      preview,
			HasNew:       false,
			IsLocked:     t.IsLocked,
		})
	}
	rpreviews := make([]dto.ReplyPreview, 0, len(replies))
	for _, r := range replies {
		preview := r.Content
		if len(preview) > 120 {
			preview = preview[:120]
		}
		rpreviews = append(rpreviews, dto.ReplyPreview{
			ThreadID:     r.ThreadID.String(),
			ThreadTitle:  r.Thread.Title,
			Category:     r.Thread.Category.Name,
			CategorySlug: r.Thread.Category.Slug,
			RepliedAt:    r.CreatedAt.Format(time.RFC3339),
			Preview:      preview,
		})
	}
	return &dto.UserActivityResponse{Threads: tpreviews, RecentReplies: rpreviews, SavedThreads: []dto.ThreadPreview{}}, nil
}

// GetMyCategories returns unique categories from user's threads (approximation of subscriptions)
func (s *userService) GetMyCategories(userID uuid.UUID) ([]dto.CategorySubscription, error) {
	subs, err := s.subRepo.ListByUser(userID)
	if err != nil { return nil, err }
	out := make([]dto.CategorySubscription, 0, len(subs))
	for _, ssub := range subs {
		out = append(out, dto.CategorySubscription{
			ID: ssub.Category.ID.String(),
			Name: ssub.Category.Name,
			Slug: ssub.Category.Slug,
			ThreadCount: ssub.Category.ThreadCount,
			Description: ssub.Category.Description,
		})
	}
	return out, nil
}

func (s *userService) SubscribeCategory(userID, categoryID uuid.UUID) error {
	return s.subRepo.Subscribe(userID, categoryID)
}

func (s *userService) UnsubscribeCategory(userID, categoryID uuid.UUID) error {
	return s.subRepo.Unsubscribe(userID, categoryID)
}

func (s *userService) ListSavedThreads(userID uuid.UUID, offset, limit int) ([]dto.ThreadPreview, int64, error) {
	saved, total, err := s.savedRepo.ListByUser(userID, offset, limit)
	if err != nil { return nil, 0, err }
	previews := make([]dto.ThreadPreview, 0, len(saved))
	for _, st := range saved {
		t := st.Thread
		preview := t.Content
		if len(preview) > 140 { preview = preview[:140] }
		previews = append(previews, dto.ThreadPreview{
			ID: t.ID.String(),
			Title: t.Title,
			Category: t.Category.Name,
			CategorySlug: t.Category.Slug,
			Replies: t.ReplyCount,
			CreatedAt: t.CreatedAt.Format(time.RFC3339),
			Preview: preview,
			HasNew: false,
			IsLocked: t.IsLocked,
		})
	}
	return previews, total, nil
}

func (s *userService) SaveThread(userID, threadID uuid.UUID) error {
	return s.savedRepo.Save(userID, threadID)
}

func (s *userService) UnsaveThread(userID, threadID uuid.UUID) error {
	return s.savedRepo.Unsave(userID, threadID)
}
