package dto

import "time"

// ModerationActionRequest defines the structure for moderation actions
type ModerationActionRequest struct {
	Action          string `json:"action" binding:"required,oneof=dismiss warn_user hide_content delete_content ban_user_temp ban_user_permanent"`
	Reason          string `json:"reason" binding:"required,max=500"`
	BanDurationDays *int   `json:"ban_duration_days,omitempty" binding:"omitempty,min=1,max=365"`
	InternalNotes   string `json:"internal_notes,omitempty" binding:"max=1000"`
}

// ModerationActionResponse defines the structure for moderation action responses
type ModerationActionResponse struct {
	ID             string          `json:"id"`
	ReportID       string          `json:"report_id"`
	ContentType    string          `json:"content_type"`
	ContentID      string          `json:"content_id"`
	ReportedUserID string          `json:"reported_user_id"`
	Action         string          `json:"action"`
	Reason         string          `json:"reason"`
	Moderator      AnonymousAuthor `json:"moderator"`
	CreatedAt      time.Time       `json:"created_at"`
	BanExpiresAt   *time.Time      `json:"ban_expires_at,omitempty"`
}

// ModerationActionListResponse for paginated moderation action lists
type ModerationActionListResponse struct {
	Actions    []ModerationActionResponse `json:"actions"`
	Total      int64                      `json:"total"`
	Page       int                        `json:"page"`
	PageSize   int                        `json:"page_size"`
	TotalPages int                        `json:"total_pages"`
}

// ModerationFilters for filtering moderation actions
type ModerationFilters struct {
	ModeratorID *string `json:"moderator_id,omitempty"`
	Action      *string `json:"action,omitempty"`
	FromDate    *string `json:"from_date,omitempty"`
	ToDate      *string `json:"to_date,omitempty"`
}

// ModerationStatsResponse provides moderation statistics
type ModerationStatsResponse struct {
	TotalReports        int     `json:"total_reports"`
	PendingReports      int     `json:"pending_reports"`
	ResolvedReports     int     `json:"resolved_reports"`
	ContentHidden       int     `json:"content_hidden"`
	ContentDeleted      int     `json:"content_deleted"`
	UsersWarned         int     `json:"users_warned"`
	UsersBannedTemp     int     `json:"users_banned_temp"`
	UsersBannedPerm     int     `json:"users_banned_perm"`
	ActionsThisWeek     int     `json:"actions_this_week"`
	ActionsThisMonth    int     `json:"actions_this_month"`
	AverageResponseTime float64 `json:"average_response_time_hours"`
}

// UserBanRequest for banning users
type UserBanRequest struct {
	BanType         string `json:"ban_type" binding:"required,oneof=temporary permanent"`
	Reason          string `json:"reason" binding:"required,max=500"`
	BanDurationDays *int   `json:"ban_duration_days,omitempty"`
	InternalNotes   string `json:"internal_notes,omitempty" binding:"max=1000"`
}


// ReportFilters for filtering reports
type ReportFilters struct {
	Status   *string `json:"status,omitempty"`
	Priority *string `json:"priority,omitempty"`
	Category *string `json:"category,omitempty"`
}

// ModerationStats for repository statistics
type ModerationStats struct {
	TotalReports        int     `json:"total_reports"`
	PendingReports      int     `json:"pending_reports"`
	ResolvedReports     int     `json:"resolved_reports"`
	ContentHidden       int     `json:"content_hidden"`
	ContentDeleted      int     `json:"content_deleted"`
	UsersWarned         int     `json:"users_warned"`
	UsersBannedTemp     int     `json:"users_banned_temp"`
	UsersBannedPerm     int     `json:"users_banned_perm"`
	ActionsThisWeek     int     `json:"actions_this_week"`
	ActionsThisMonth    int     `json:"actions_this_month"`
	AverageResponseTime float64 `json:"average_response_time"`
}
