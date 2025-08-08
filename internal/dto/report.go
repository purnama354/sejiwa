package dto

import "time"

// CreateReportRequest defines the structure for creating a new report
type CreateReportRequest struct {
	ContentType string `json:"content_type" binding:"required,oneof=thread reply"`
	ContentID   string `json:"content_id" binding:"required,uuid"`
	Reason      string `json:"reason" binding:"required,oneof=spam harassment hate_speech inappropriate_content self_harm misinformation other"`
	Description string `json:"description,omitempty" binding:"max=500"`
}

// ReportResponse defines the structure for report responses
type ReportResponse struct {
	ID             string    `json:"id"`
	ContentType    string    `json:"content_type"`
	ContentID      string    `json:"content_id"`
	Reason         string    `json:"reason"`
	Description    string    `json:"description"`
	Status         string    `json:"status"`
	Priority       string    `json:"priority"`
	ReporterID     string    `json:"reporter_id"`
	ReportedUserID string    `json:"reported_user_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// ModerationReportResponse defines enhanced report structure for moderators
type ModerationReportResponse struct {
	ID             string              `json:"id"`
	ContentType    string              `json:"content_type"`
	ContentID      string              `json:"content_id"`
	Reason         string              `json:"reason"`
	Description    string              `json:"description"`
	Status         string              `json:"status"`
	Priority       string              `json:"priority"`
	Reporter       AnonymousAuthor     `json:"reporter"`
	ReportedUser   AnonymousAuthor     `json:"reported_user"`
	Content        interface{}         `json:"content"`
	ContentPreview string              `json:"content_preview"`
	UserHistory    ReportedUserHistory `json:"reported_user_history"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}

// AnonymousAuthor represents the anonymous author information
type AnonymousAuthor struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

// ReportedUserHistory provides context about the reported user
type ReportedUserHistory struct {
	PreviousReportsCount    int    `json:"previous_reports_count"`
	PreviousViolationsCount int    `json:"previous_violations_count"`
	AccountAgeDays          int    `json:"account_age_days"`
	RecentActivityLevel     string `json:"recent_activity_level"`
}

// ReportListResponse for paginated report lists
type ReportListResponse struct {
	Reports    []ModerationReportResponse `json:"reports"`
	Total      int64                      `json:"total"`
	Page       int                        `json:"page"`
	PageSize   int                        `json:"page_size"`
	TotalPages int                        `json:"total_pages"`
}
