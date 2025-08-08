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
	ErrModerationActionInvalid = errors.New("INVALID_MODERATION_ACTION")
	ErrReportAlreadyResolved   = errors.New("REPORT_ALREADY_RESOLVED")
	ErrCannotModerateSelf      = errors.New("CANNOT_MODERATE_SELF")
)

// ModerationService defines the interface for moderation-related business logic
type ModerationService interface {
	ProcessReport(reportID uuid.UUID, req dto.ModerationActionRequest, moderatorID uuid.UUID) (*models.ModerationAction, error)
	GetModerationActions(page, pageSize int, filters dto.ModerationFilters) (*dto.ModerationActionListResponse, error)
	GetModerationStats(moderatorID *uuid.UUID) (*dto.ModerationStatsResponse, error)
	BanUser(userID uuid.UUID, req dto.UserBanRequest, moderatorID uuid.UUID) error
	UnbanUser(userID uuid.UUID, moderatorID uuid.UUID) error
}

type moderationService struct {
	reportRepo     repository.ReportRepository
	userRepo       repository.UserRepository
	threadRepo     repository.ThreadRepository
	replyRepo      repository.ReplyRepository
	moderationRepo repository.ModerationActionRepository
}

// NewModerationService creates a new instance of ModerationService
func NewModerationService(
	reportRepo repository.ReportRepository,
	userRepo repository.UserRepository,
	threadRepo repository.ThreadRepository,
	replyRepo repository.ReplyRepository,
	moderationRepo repository.ModerationActionRepository,
) ModerationService {
	return &moderationService{
		reportRepo:     reportRepo,
		userRepo:       userRepo,
		threadRepo:     threadRepo,
		replyRepo:      replyRepo,
		moderationRepo: moderationRepo,
	}
}

// ProcessReport handles moderation actions on reports
func (s *moderationService) ProcessReport(reportID uuid.UUID, req dto.ModerationActionRequest, moderatorID uuid.UUID) (*models.ModerationAction, error) {
	// Get the report with details
	report, err := s.reportRepo.FindByIDWithDetails(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReportNotFound
		}
		return nil, err
	}

	// Check if report is already resolved
	if report.Status == models.ReportStatusResolved {
		return nil, ErrReportAlreadyResolved
	}

	// Check if moderator is trying to moderate their own content
	if report.ReportedUserID == moderatorID {
		return nil, ErrCannotModerateSelf
	}

	// Validate action and ban duration
	if err := s.validateModerationAction(req); err != nil {
		return nil, err
	}

	// Create moderation action record
	moderationAction := &models.ModerationAction{
		ReportID:       reportID,
		ContentType:    report.ContentType,
		ContentID:      report.ContentID,
		ReportedUserID: report.ReportedUserID,
		ModeratorID:    moderatorID,
		Action:         models.ModerationActionType(req.Action),
		Reason:         req.Reason,
		InternalNotes:  req.InternalNotes,
	}

	// Set ban expiration for temporary bans
	if req.Action == "ban_user_temp" && req.BanDurationDays != nil {
		banExpiry := time.Now().AddDate(0, 0, *req.BanDurationDays)
		moderationAction.BanExpiresAt = &banExpiry
	}

	// Execute the moderation action
	if err := s.executeModerationAction(report, moderationAction, req); err != nil {
		return nil, err
	}

	// Save moderation action
	if err := s.moderationRepo.Create(moderationAction); err != nil {
		return nil, err
	}

	// Update report status
	if req.Action == "dismiss" {
		report.Status = models.ReportStatusReviewed
	} else {
		report.Status = models.ReportStatusResolved
	}

	if err := s.reportRepo.Update(report); err != nil {
		// Log error but don't fail the operation
	}

	return moderationAction, nil
}

// GetModerationActions retrieves moderation actions with filtering
func (s *moderationService) GetModerationActions(page, pageSize int, filters dto.ModerationFilters) (*dto.ModerationActionListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	actions, total, err := s.moderationRepo.FindAll(offset, pageSize, filters)
	if err != nil {
		return nil, err
	}

	actionResponses := make([]dto.ModerationActionResponse, len(actions))
	for i, action := range actions {
		actionResponses[i] = s.buildModerationActionResponse(&action)
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &dto.ModerationActionListResponse{
		Actions:    actionResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetModerationStats retrieves moderation statistics
func (s *moderationService) GetModerationStats(moderatorID *uuid.UUID) (*dto.ModerationStatsResponse, error) {
	stats, err := s.moderationRepo.GetStats(moderatorID)
	if err != nil {
		return nil, err
	}

	return &dto.ModerationStatsResponse{
		TotalReports:        stats.TotalReports,
		PendingReports:      stats.PendingReports,
		ResolvedReports:     stats.ResolvedReports,
		ContentHidden:       stats.ContentHidden,
		ContentDeleted:      stats.ContentDeleted,
		UsersWarned:         stats.UsersWarned,
		UsersBannedTemp:     stats.UsersBannedTemp,
		UsersBannedPerm:     stats.UsersBannedPerm,
		ActionsThisWeek:     stats.ActionsThisWeek,
		ActionsThisMonth:    stats.ActionsThisMonth,
		AverageResponseTime: stats.AverageResponseTime,
	}, nil
}

// BanUser handles user banning
func (s *moderationService) BanUser(userID uuid.UUID, req dto.UserBanRequest, moderatorID uuid.UUID) error {
	// Check if user exists
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("USER_NOT_FOUND")
		}
		return err
	}

	// Cannot ban moderators or admins
	if user.Role != models.RoleUser {
		return errors.New("CANNOT_BAN_MODERATOR_OR_ADMIN")
	}

	// Cannot ban self
	if userID == moderatorID {
		return ErrCannotModerateSelf
	}

	// Update user status
	if req.BanType == "permanent" {
		user.Status = models.StatusSuspended // Permanent ban
	} else {
		user.Status = models.StatusSuspended
		// Set temporary ban expiration (you might want to add this field to User model)
	}

	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// Create moderation action record
	moderationAction := &models.ModerationAction{
		ContentType:    models.ContentTypeUser,
		ContentID:      userID,
		ReportedUserID: userID,
		ModeratorID:    moderatorID,
		Action:         models.ModerationActionType("ban_user_" + req.BanType),
		Reason:         req.Reason,
		InternalNotes:  req.InternalNotes,
	}

	if req.BanType == "temporary" && req.BanDurationDays != nil {
		banExpiry := time.Now().AddDate(0, 0, *req.BanDurationDays)
		moderationAction.BanExpiresAt = &banExpiry
	}

	return s.moderationRepo.Create(moderationAction)
}

// UnbanUser handles user unbanning
func (s *moderationService) UnbanUser(userID uuid.UUID, moderatorID uuid.UUID) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("USER_NOT_FOUND")
		}
		return err
	}

	// Update user status
	user.Status = models.StatusActive

	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// Create moderation action record
	moderationAction := &models.ModerationAction{
		ContentType:    models.ContentTypeUser,
		ContentID:      userID,
		ReportedUserID: userID,
		ModeratorID:    moderatorID,
		Action:         models.ModerationActionUnban,
		Reason:         "User unbanned by moderator",
	}

	return s.moderationRepo.Create(moderationAction)
}

// Helper methods

func (s *moderationService) validateModerationAction(req dto.ModerationActionRequest) error {
	validActions := []string{"dismiss", "warn_user", "hide_content", "delete_content", "ban_user_temp", "ban_user_permanent"}

	isValid := false
	for _, action := range validActions {
		if req.Action == action {
			isValid = true
			break
		}
	}

	if !isValid {
		return ErrModerationActionInvalid
	}

	if req.Action == "ban_user_temp" && (req.BanDurationDays == nil || *req.BanDurationDays < 1 || *req.BanDurationDays > 365) {
		return errors.New("INVALID_BAN_DURATION")
	}

	return nil
}

func (s *moderationService) executeModerationAction(report *models.Report, action *models.ModerationAction, req dto.ModerationActionRequest) error {
	switch req.Action {
	case "dismiss":
		// No action needed, just update report status
		return nil

	case "warn_user":
		// Could implement user warning system here
		return nil

	case "hide_content":
		return s.hideContent(report.ContentType, report.ContentID)

	case "delete_content":
		return s.deleteContent(report.ContentType, report.ContentID)

	case "ban_user_temp", "ban_user_permanent":
		banReq := dto.UserBanRequest{
			BanType:         req.Action[9:], // Extract "temp" or "permanent"
			Reason:          req.Reason,
			BanDurationDays: req.BanDurationDays,
			InternalNotes:   req.InternalNotes,
		}
		return s.BanUser(report.ReportedUserID, banReq, action.ModeratorID)

	default:
		return ErrModerationActionInvalid
	}
}

func (s *moderationService) hideContent(contentType models.ContentType, contentID uuid.UUID) error {
	switch contentType {
	case models.ContentTypeThread:
		thread, err := s.threadRepo.FindByID(contentID)
		if err != nil {
			return err
		}
		thread.ModerationStatus = models.ModerationStatusHidden
		return s.threadRepo.Update(thread)

	case models.ContentTypeReply:
		reply, err := s.replyRepo.FindByID(contentID)
		if err != nil {
			return err
		}
		reply.ModerationStatus = models.ModerationStatusHidden
		return s.replyRepo.Update(reply)

	default:
		return errors.New("INVALID_CONTENT_TYPE")
	}
}

func (s *moderationService) deleteContent(contentType models.ContentType, contentID uuid.UUID) error {
	switch contentType {
	case models.ContentTypeThread:
		thread, err := s.threadRepo.FindByID(contentID)
		if err != nil {
			return err
		}
		thread.ModerationStatus = models.ModerationStatusDeleted
		return s.threadRepo.Update(thread)

	case models.ContentTypeReply:
		reply, err := s.replyRepo.FindByID(contentID)
		if err != nil {
			return err
		}
		reply.ModerationStatus = models.ModerationStatusDeleted
		return s.replyRepo.Update(reply)

	default:
		return errors.New("INVALID_CONTENT_TYPE")
	}
}

func (s *moderationService) buildModerationActionResponse(action *models.ModerationAction) dto.ModerationActionResponse {
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
