package docs

import (
	"github.com/purnama354/sejiwa-api/internal/dto"
)

// ---------- Auth ----------

// swagger:parameters authRegister
type authRegisterParams struct {
	// in:body
	// required: true
	Body dto.RegisterRequest
}

// swagger:parameters authLogin
type authLoginParams struct {
	// in:body
	// required: true
	Body dto.LoginRequest
}

// ---------- Categories ----------

// swagger:parameters createCategory
type createCategoryParams struct {
	// in:body
	// required: true
	Body dto.CreateCategoryRequest
}

// swagger:parameters updateCategory deleteCategory getCategoryByID
type categoryIDParam struct {
	// Category ID
	// in:path
	// required: true
	ID string `json:"id"`
}

// swagger:parameters getThreadsByCategory
type categoryThreadsParams struct {
	// Category ID
	// in:path
	// required: true
	ID string `json:"id"`

	// Page number
	// in:query
	Page int `json:"page"`

	// Page size
	// in:query
	PageSize int `json:"pageSize"`
}

// swagger:parameters updateCategory
type updateCategoryParams struct {
	// in:body
	// required: true
	Body dto.UpdateCategoryRequest
}

// ---------- Threads ----------

// swagger:parameters listThreads pinnedThreads
type threadsListQuery struct {
	// Page number (default 1)
	// in:query
	Page int `json:"page"`

	// Page size (default 20, max 100)
	// in:query
	PageSize int `json:"pageSize"`
}

// swagger:parameters searchThreads
type searchThreadsQuery struct {
	// Search query
	// in:query
	// required: true
	Q string `json:"q"`

	// Page number
	// in:query
	Page int `json:"page"`

	// Page size
	// in:query
	PageSize int `json:"pageSize"`
}

// swagger:parameters getThreadByID updateThread deleteThread threadReplies listThreadReplies createThreadReply moderateThread
type threadIDParam struct {
	// Thread ID
	// in:path
	// required: true
	ID string `json:"id"`
}

// swagger:parameters createThread
type createThreadParams struct {
	// in:body
	// required: true
	Body dto.CreateThreadRequest
}

// swagger:parameters updateThread
type updateThreadParams struct {
	// in:body
	// required: true
	Body dto.UpdateThreadRequest
}

// swagger:parameters listThreadReplies
type listThreadRepliesQuery struct {
	// Page number (default 1)
	// in:query
	Page int `json:"page"`

	// Page size (default 20, max 100)
	// in:query
	PageSize int `json:"pageSize"`

	// Include nested replies
	// in:query
	Nested bool `json:"nested"`
}

// swagger:parameters createThreadReply
type createThreadReplyBody struct {
	// in:body
	// required: true
	Body dto.CreateReplyRequest
}

// ---------- Replies ----------

// swagger:parameters getReplyByID updateReply deleteReply moderateReply
type replyIDParam struct {
	// Reply ID
	// in:path
	// required: true
	ID string `json:"id"`
}

// swagger:parameters updateReply
type updateReplyBody struct {
	// in:body
	// required: true
	Body dto.UpdateReplyRequest
}

// ---------- Reports ----------

// swagger:parameters createReport
type createReportParams struct {
	// in:body
	// required: true
	Body dto.CreateReportRequest
}

// swagger:parameters getReportsForModeration getMyReports
type reportsListQuery struct {
	// Page number (default 1)
	// in:query
	Page int `json:"page"`

	// Page size (default varies, use pageSize or limit)
	// in:query
	PageSize int `json:"pageSize"`

	// Limit (for some endpoints using 'limit' instead of 'pageSize')
	// in:query
	Limit int `json:"limit"`

	// Filter by status (pending, reviewed, resolved)
	// in:query
	Status string `json:"status"`

	// Filter by priority (low, medium, high, critical)
	// in:query
	Priority string `json:"priority"`

	// Optional category filter
	// in:query
	Category string `json:"category"`
}

// swagger:parameters getReportByID processReport
type reportIDParam struct {
	// Report ID
	// in:path
	// required: true
	ID string `json:"id"`
}

// swagger:parameters processReport
type processReportBody struct {
	// in:body
	// required: true
	Body dto.ModerationActionRequest
}

// ---------- Moderation ----------

// swagger:parameters getModerationActions
type moderationActionsQuery struct {
	// Page number
	// in:query
	Page int `json:"page"`

	// Page size
	// in:query
	PageSize int `json:"pageSize"`

	// Filter by moderator ID
	// in:query
	ModeratorID string `json:"moderator_id"`

	// Filter by action type
	// in:query
	Action string `json:"action"`

	// Filter from date (RFC3339)
	// in:query
	FromDate string `json:"from_date"`

	// Filter to date (RFC3339)
	// in:query
	ToDate string `json:"to_date"`
}

// swagger:parameters getModerationStats
type moderationStatsQuery struct {
	// Optional moderator ID
	// in:query
	ModeratorID string `json:"moderator_id"`
}

// swagger:parameters banUser unbanUser
type userIDPathParam struct {
	// User ID
	// in:path
	// required: true
	ID string `json:"id"`
}

// swagger:parameters banUser
type banUserBody struct {
	// in:body
	// required: true
	Body dto.UserBanRequest
}

// ---------- Moderator Notes ----------

// swagger:parameters createModeratorNote listModeratorNotes
type moderatorNotesUserIDParam struct {
	// User ID
	// in:path
	// required: true
	ID string `json:"id"`
}

// swagger:parameters createModeratorNote
type createModeratorNoteBody struct {
	// in:body
	// required: true
	Body dto.CreateModeratorNoteRequest
}

// swagger:parameters deleteModeratorNote
type deleteModeratorNotePath struct {
	// Note ID
	// in:path
	// required: true
	NoteID string `json:"noteId"`
}

// swagger:parameters listModeratorNotes
type listModeratorNotesQuery struct {
	// Page number
	// in:query
	Page int `json:"page"`
	// Page size (limit)
	// in:query
	Limit int `json:"limit"`
}

// ---------- Users ----------

// swagger:parameters updateMe
type updateMeBody struct {
	// in:body
	// required: true
	Body dto.UpdateUserRequest
}

// ---------- Admin ----------

// swagger:parameters createAdmin
type createAdminParams struct {
	// in:body
	// required: true
	Body dto.CreateAdminRequest
}

// swagger:parameters createModerator
type createModeratorParams struct {
	// in:body
	// required: true
	Body dto.CreateModeratorRequest
}
