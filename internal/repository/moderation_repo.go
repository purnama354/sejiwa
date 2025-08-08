package repository

import (
	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ModerationActionRepository defines the interface for moderation action data operations
type ModerationActionRepository interface {
	Create(action *models.ModerationAction) error
	FindByID(id uuid.UUID) (*models.ModerationAction, error)
	FindAll(offset, limit int, filters dto.ModerationFilters) ([]models.ModerationAction, int64, error)
	GetStats(moderatorID *uuid.UUID) (*dto.ModerationStats, error)
}

type moderationActionRepository struct {
	db *gorm.DB
}

// NewModerationActionRepository creates a new instance of ModerationActionRepository
func NewModerationActionRepository(db *gorm.DB) ModerationActionRepository {
	return &moderationActionRepository{db: db}
}

// Create inserts a new moderation action record into the database
func (r *moderationActionRepository) Create(action *models.ModerationAction) error {
	return r.db.Create(action).Error
}

// FindByID retrieves a moderation action by its UUID
func (r *moderationActionRepository) FindByID(id uuid.UUID) (*models.ModerationAction, error) {
	var action models.ModerationAction
	err := r.db.Preload("Report").Preload("ReportedUser").Preload("Moderator").
		Where("id = ?", id).First(&action).Error
	if err != nil {
		return nil, err
	}
	return &action, nil
}

// FindAll retrieves moderation actions with filtering and pagination
func (r *moderationActionRepository) FindAll(offset, limit int, filters dto.ModerationFilters) ([]models.ModerationAction, int64, error) {
	var actions []models.ModerationAction
	var total int64

	query := r.db.Model(&models.ModerationAction{})

	// Apply filters
	if filters.ModeratorID != nil {
		query = query.Where("moderator_id = ?", *filters.ModeratorID)
	}

	if filters.Action != nil {
		query = query.Where("action = ?", *filters.Action)
	}

	if filters.FromDate != nil {
		query = query.Where("created_at >= ?", *filters.FromDate)
	}

	if filters.ToDate != nil {
		query = query.Where("created_at <= ?", *filters.ToDate)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get actions with preloaded relationships
	err := query.Preload("Report").Preload("ReportedUser").Preload("Moderator").
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&actions).Error

	return actions, total, err
}

// GetStats retrieves moderation statistics
func (r *moderationActionRepository) GetStats(moderatorID *uuid.UUID) (*dto.ModerationStats, error) {
	stats := &dto.ModerationStats{}

	// Base query for filtering by moderator if specified
	baseQuery := r.db.Model(&models.ModerationAction{})
	if moderatorID != nil {
		baseQuery = baseQuery.Where("moderator_id = ?", *moderatorID)
	}

	// Total actions count
	if err := baseQuery.Count(&[]int64{int64(stats.TotalReports)}[0]).Error; err != nil {
		return nil, err
	}

	// Count pending reports (from reports table)
	reportQuery := r.db.Model(&models.Report{}).Where("status = ?", models.ReportStatusPending)
	if err := reportQuery.Count(&[]int64{int64(stats.PendingReports)}[0]).Error; err != nil {
		return nil, err
	}

	// Count resolved reports
	resolvedQuery := r.db.Model(&models.Report{}).Where("status = ?", models.ReportStatusResolved)
	if err := resolvedQuery.Count(&[]int64{int64(stats.ResolvedReports)}[0]).Error; err != nil {
		return nil, err
	}

	// Count actions by type
	actionCounts := []struct {
		Action string
		Count  int
	}{}

	err := baseQuery.Select("action, COUNT(*) as count").
		Group("action").
		Find(&actionCounts).Error

	if err != nil {
		return nil, err
	}

	// Map action counts to stats
	for _, ac := range actionCounts {
		switch ac.Action {
		case "hide_content":
			stats.ContentHidden = ac.Count
		case "delete_content":
			stats.ContentDeleted = ac.Count
		case "warn_user":
			stats.UsersWarned = ac.Count
		case "ban_user_temp":
			stats.UsersBannedTemp = ac.Count
		case "ban_user_permanent":
			stats.UsersBannedPerm = ac.Count
		}
	}

	// Actions this week
	err = baseQuery.Where("created_at >= CURRENT_DATE - INTERVAL '7 days'").
		Count(&[]int64{int64(stats.ActionsThisWeek)}[0]).Error
	if err != nil {
		return nil, err
	}

	// Actions this month
	err = baseQuery.Where("created_at >= CURRENT_DATE - INTERVAL '30 days'").
		Count(&[]int64{int64(stats.ActionsThisMonth)}[0]).Error
	if err != nil {
		return nil, err
	}

	// Calculate average response time (simplified - you may want to improve this)
	var avgHours float64
	err = r.db.Raw(`
        SELECT AVG(EXTRACT(EPOCH FROM (ma.created_at - r.created_at))/3600) as avg_hours
        FROM moderation_actions ma
        JOIN reports r ON ma.report_id = r.id
        WHERE ma.created_at >= CURRENT_DATE - INTERVAL '30 days'
    `).Scan(&avgHours).Error

	if err == nil {
		stats.AverageResponseTime = avgHours
	}

	return stats, nil
}
