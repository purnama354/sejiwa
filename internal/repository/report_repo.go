package repository

import (
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ReportRepository defines the interface for report data operations
type ReportRepository interface {
	Create(report *models.Report) error
	FindByID(id uuid.UUID) (*models.Report, error)
	FindByIDWithDetails(id uuid.UUID) (*models.Report, error)
	Update(report *models.Report) error
	Delete(id uuid.UUID) error
	FindAll(offset, limit int, status string, priority string) ([]models.Report, int64, error)
	FindByReporter(reporterID uuid.UUID, offset, limit int) ([]models.Report, int64, error)
	FindByReportedUser(reportedUserID uuid.UUID, offset, limit int) ([]models.Report, int64, error)
	FindByContent(contentType models.ContentType, contentID uuid.UUID) ([]models.Report, error)
	CheckDuplicateReport(reporterID, contentID uuid.UUID, contentType models.ContentType) (bool, error)
	CountByReportedUser(reportedUserID uuid.UUID) (int64, error)
	CountViolationsByReportedUser(reportedUserID uuid.UUID) (int64, error)
}

type reportRepository struct {
	db *gorm.DB
}

// NewReportRepository creates a new instance of ReportRepository
func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

// Create inserts a new report record into the database
func (r *reportRepository) Create(report *models.Report) error {
	return r.db.Create(report).Error
}

// FindByID retrieves a report by its UUID
func (r *reportRepository) FindByID(id uuid.UUID) (*models.Report, error) {
	var report models.Report
	err := r.db.Where("id = ?", id).First(&report).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

// FindByIDWithDetails retrieves a report with reporter and reported user details
func (r *reportRepository) FindByIDWithDetails(id uuid.UUID) (*models.Report, error) {
	var report models.Report
	err := r.db.Preload("Reporter").Preload("ReportedUser").
		Where("id = ?", id).First(&report).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

// Update modifies an existing report
func (r *reportRepository) Update(report *models.Report) error {
	return r.db.Save(report).Error
}

// Delete soft-deletes a report by ID
func (r *reportRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Report{}, id).Error
}

// FindAll retrieves reports with pagination and filters
func (r *reportRepository) FindAll(offset, limit int, status string, priority string) ([]models.Report, int64, error) {
	var reports []models.Report
	var total int64

	query := r.db.Model(&models.Report{})

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get reports with preloaded relationships
	err := query.Preload("Reporter").Preload("ReportedUser").
		Order("priority DESC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&reports).Error

	return reports, total, err
}

// FindByReporter retrieves reports by reporter with pagination
func (r *reportRepository) FindByReporter(reporterID uuid.UUID, offset, limit int) ([]models.Report, int64, error) {
	var reports []models.Report
	var total int64

	// Get total count
	if err := r.db.Model(&models.Report{}).
		Where("reporter_id = ?", reporterID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get reports
	err := r.db.Preload("Reporter").Preload("ReportedUser").
		Where("reporter_id = ?", reporterID).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&reports).Error

	return reports, total, err
}

// FindByReportedUser retrieves reports for a specific reported user
func (r *reportRepository) FindByReportedUser(reportedUserID uuid.UUID, offset, limit int) ([]models.Report, int64, error) {
	var reports []models.Report
	var total int64

	// Get total count
	if err := r.db.Model(&models.Report{}).
		Where("reported_user_id = ?", reportedUserID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get reports
	err := r.db.Preload("Reporter").Preload("ReportedUser").
		Where("reported_user_id = ?", reportedUserID).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&reports).Error

	return reports, total, err
}

// FindByContent retrieves all reports for specific content
func (r *reportRepository) FindByContent(contentType models.ContentType, contentID uuid.UUID) ([]models.Report, error) {
	var reports []models.Report
	err := r.db.Preload("Reporter").Preload("ReportedUser").
		Where("content_type = ? AND content_id = ?", contentType, contentID).
		Order("created_at DESC").
		Find(&reports).Error
	return reports, err
}

// CheckDuplicateReport checks if a user has already reported this content
func (r *reportRepository) CheckDuplicateReport(reporterID, contentID uuid.UUID, contentType models.ContentType) (bool, error) {
	var count int64
	err := r.db.Model(&models.Report{}).
		Where("reporter_id = ? AND content_id = ? AND content_type = ?", reporterID, contentID, contentType).
		Count(&count).Error
	return count > 0, err
}

// CountByReportedUser counts total reports against a user
func (r *reportRepository) CountByReportedUser(reportedUserID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Report{}).
		Where("reported_user_id = ?", reportedUserID).
		Count(&count).Error
	return count, err
}

// CountViolationsByReportedUser counts resolved reports that resulted in violations
func (r *reportRepository) CountViolationsByReportedUser(reportedUserID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Report{}).
		Where("reported_user_id = ? AND status = ?", reportedUserID, models.ReportStatusResolved).
		Count(&count).Error
	return count, err
}
