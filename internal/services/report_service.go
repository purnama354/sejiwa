package services

import (
	"errors"
	"math"
	"strings"
	"time"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/purnama354/sejiwa-api/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrReportNotFound   = errors.New("REPORT_NOT_FOUND")
	ErrContentNotFound  = errors.New("CONTENT_NOT_FOUND")
	ErrAlreadyReported  = errors.New("ALREADY_REPORTED")
	ErrCannotReportSelf = errors.New("CANNOT_REPORT_SELF")
)

// ReportService defines the interface for report-related business logic
type ReportService interface {
	Create(req dto.CreateReportRequest, reporterID uuid.UUID) (*models.Report, error)
	GetByID(id uuid.UUID) (*models.Report, error)
	GetForModeration(page, pageSize int, status, priority string) (*dto.ReportListResponse, error)
	GetByReporter(reporterID uuid.UUID, page, pageSize int) (*dto.ReportListResponse, error)
	GetByReportedUser(reportedUserID uuid.UUID, page, pageSize int) (*dto.ReportListResponse, error)
}

type reportService struct {
	reportRepo repository.ReportRepository
	threadRepo repository.ThreadRepository
	replyRepo  repository.ReplyRepository
	userRepo   repository.UserRepository
}

// NewReportService creates a new instance of ReportService
func NewReportService(
	reportRepo repository.ReportRepository,
	threadRepo repository.ThreadRepository,
	replyRepo repository.ReplyRepository,
	userRepo repository.UserRepository,
) ReportService {
	return &reportService{
		reportRepo: reportRepo,
		threadRepo: threadRepo,
		replyRepo:  replyRepo,
		userRepo:   userRepo,
	}
}

// Create handles the business logic for creating a new report
func (s *reportService) Create(req dto.CreateReportRequest, reporterID uuid.UUID) (*models.Report, error) {
	// Parse and validate content ID
	contentID, err := uuid.Parse(req.ContentID)
	if err != nil {
		return nil, errors.New("INVALID_CONTENT_ID")
	}

	contentType := models.ContentType(req.ContentType)

	// Check if content exists and get reported user ID
	var reportedUserID uuid.UUID

	switch contentType {
	case models.ContentTypeThread:
		thread, err := s.threadRepo.FindByID(contentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrContentNotFound
			}
			return nil, err
		}
		reportedUserID = thread.AuthorID
	case models.ContentTypeReply:
		reply, err := s.replyRepo.FindByID(contentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrContentNotFound
			}
			return nil, err
		}
		reportedUserID = reply.AuthorID
	default:
		return nil, errors.New("INVALID_CONTENT_TYPE")
	}

	// Check if user is trying to report their own content
	if reporterID == reportedUserID {
		return nil, ErrCannotReportSelf
	}

	// Check for duplicate reports
	isDuplicate, err := s.reportRepo.CheckDuplicateReport(reporterID, contentID, contentType)
	if err != nil {
		return nil, err
	}
	if isDuplicate {
		return nil, ErrAlreadyReported
	}

	// Get user violation history for priority assignment
	violationCount, err := s.reportRepo.CountViolationsByReportedUser(reportedUserID)
	if err != nil {
		violationCount = 0 // Default to 0 if we can't get history
	}

	// Create new report
	report := &models.Report{
		ContentType:    contentType,
		ContentID:      contentID,
		ReporterID:     reporterID,
		ReportedUserID: reportedUserID,
		Reason:         models.ReportReason(req.Reason),
		Description:    req.Description,
		Status:         models.ReportStatusPending,
	}

	// Auto-assign priority based on reason and user history
	report.AutoAssignPriority(int(violationCount))

	// Save report to database
	if err := s.reportRepo.Create(report); err != nil {
		return nil, err
	}

	return report, nil
}

// GetByID retrieves a report by ID
func (s *reportService) GetByID(id uuid.UUID) (*models.Report, error) {
	report, err := s.reportRepo.FindByIDWithDetails(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReportNotFound
		}
		return nil, err
	}
	return report, nil
}

// GetForModeration retrieves reports for moderator review with enhanced details
func (s *reportService) GetForModeration(page, pageSize int, status, priority string) (*dto.ReportListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	reports, total, err := s.reportRepo.FindAll(offset, pageSize, status, priority)
	if err != nil {
		return nil, err
	}

	// Build enhanced response for moderation
	moderationReports := make([]dto.ModerationReportResponse, len(reports))
	for i, report := range reports {
		moderationReport, err := s.buildModerationReportResponse(&report)
		if err != nil {
			// Log error but continue with other reports
			continue
		}
		moderationReports[i] = *moderationReport
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.ReportListResponse{
		Reports:    moderationReports,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetByReporter retrieves reports by reporter with pagination
func (s *reportService) GetByReporter(reporterID uuid.UUID, page, pageSize int) (*dto.ReportListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	reports, total, err := s.reportRepo.FindByReporter(reporterID, offset, pageSize)
	if err != nil {
		return nil, err
	}

	// Build basic response for user's own reports
	moderationReports := make([]dto.ModerationReportResponse, len(reports))
	for i, report := range reports {
		moderationReports[i] = dto.ModerationReportResponse{
			ID:          report.ID.String(),
			ContentType: string(report.ContentType),
			ContentID:   report.ContentID.String(),
			Reason:      string(report.Reason),
			Description: report.Description,
			Status:      string(report.Status),
			Priority:    string(report.Priority),
			CreatedAt:   report.CreatedAt,
			UpdatedAt:   report.UpdatedAt,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.ReportListResponse{
		Reports:    moderationReports,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetByReportedUser retrieves reports for a specific reported user (admin only)
func (s *reportService) GetByReportedUser(reportedUserID uuid.UUID, page, pageSize int) (*dto.ReportListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	reports, total, err := s.reportRepo.FindByReportedUser(reportedUserID, offset, pageSize)
	if err != nil {
		return nil, err
	}

	// Build enhanced response for admin review
	moderationReports := make([]dto.ModerationReportResponse, len(reports))
	for i, report := range reports {
		moderationReport, err := s.buildModerationReportResponse(&report)
		if err != nil {
			continue
		}
		moderationReports[i] = *moderationReport
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.ReportListResponse{
		Reports:    moderationReports,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// Helper methods

// buildModerationReportResponse creates an enhanced report response for moderation
func (s *reportService) buildModerationReportResponse(report *models.Report) (*dto.ModerationReportResponse, error) {
	// Get content details
	var content interface{}
	var contentPreview string

	switch report.ContentType {
	case models.ContentTypeThread:
		thread, err := s.threadRepo.FindByIDWithDetails(report.ContentID)
		if err == nil {
			content = dto.ThreadResponse{
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
			contentPreview = s.createContentPreview(thread.Title + " " + thread.Content)
		}
	case models.ContentTypeReply:
		reply, err := s.replyRepo.FindByIDWithDetails(report.ContentID)
		if err == nil {
			content = dto.ReplyResponse{
				ID:               reply.ID.String(),
				Content:          reply.Content,
				AuthorUsername:   reply.Author.Username,
				ThreadID:         reply.ThreadID.String(),
				ModerationStatus: string(reply.ModerationStatus),
				IsEdited:         reply.IsEdited,
				CreatedAt:        reply.CreatedAt,
				UpdatedAt:        reply.UpdatedAt,
			}
			contentPreview = s.createContentPreview(reply.Content)
		}
	}

	// Get user history
	userHistory, err := s.buildUserHistory(report.ReportedUserID)
	if err != nil {
		// Use default values if we can't get history
		userHistory = dto.ReportedUserHistory{
			PreviousReportsCount:    0,
			PreviousViolationsCount: 0,
			AccountAgeDays:          0,
			RecentActivityLevel:     "unknown",
		}
	}

	return &dto.ModerationReportResponse{
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
		Content:        content,
		ContentPreview: contentPreview,
		UserHistory:    userHistory,
		CreatedAt:      report.CreatedAt,
		UpdatedAt:      report.UpdatedAt,
	}, nil
}

// createContentPreview creates a preview of content for quick moderation review
func (s *reportService) createContentPreview(content string) string {
	maxLength := 200
	if len(content) <= maxLength {
		return content
	}
	// Find the last space before the limit to avoid cutting words
	preview := content[:maxLength]
	lastSpace := strings.LastIndex(preview, " ")
	if lastSpace > 0 {
		preview = preview[:lastSpace]
	}
	return preview + "..."
}

// buildUserHistory creates user history context for moderation decisions
func (s *reportService) buildUserHistory(userID uuid.UUID) (dto.ReportedUserHistory, error) {
	// Get user details
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return dto.ReportedUserHistory{}, err
	}

	// Calculate account age
	accountAge := int(time.Since(user.CreatedAt).Hours() / 24)

	// Get report counts
	reportsCount, _ := s.reportRepo.CountByReportedUser(userID)
	violationsCount, _ := s.reportRepo.CountViolationsByReportedUser(userID)

	// Determine activity level based on thread/reply counts
	activityLevel := "low"
	totalActivity := user.ThreadCount + user.ReplyCount
	if totalActivity > 50 {
		activityLevel = "high"
	} else if totalActivity > 10 {
		activityLevel = "medium"
	}

	return dto.ReportedUserHistory{
		PreviousReportsCount:    int(reportsCount),
		PreviousViolationsCount: int(violationsCount),
		AccountAgeDays:          accountAge,
		RecentActivityLevel:     activityLevel,
	}, nil
}
