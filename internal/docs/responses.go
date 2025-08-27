package docs

import "github.com/purnama354/sejiwa-api/internal/dto"

// Generic error envelope
// swagger:response errorResponse
type errorResponseWrapper struct {
	// in: body
	Body dto.ErrorResponse
}

// Generic success envelope
// swagger:response successResponse
type successResponseWrapper struct {
	// in: body
	Body dto.SuccessResponse
}

// swagger:response authResponse
type authResponseWrapper struct {
	// in: body
	Body dto.AuthResponse
}

// swagger:response categoryResponse
type categoryResponseWrapper struct {
	// in: body
	Body dto.CategoryResponse
}

// swagger:response categoryListResponse
type categoryListResponseWrapper struct {
	// in: body
	Body []dto.CategoryResponse
}

// swagger:response threadResponse
type threadResponseWrapper struct {
	// in: body
	Body dto.ThreadResponse
}

// swagger:response threadListResponse
type threadListResponseWrapper struct {
	// in: body
	Body dto.ThreadListResponse
}

// swagger:response replyResponse
type replyResponseWrapper struct {
	// in: body
	Body dto.ReplyResponse
}

// swagger:response replyListResponse
type replyListResponseWrapper struct {
	// in: body
	Body dto.ReplyListResponse
}

// swagger:response reportResponse
type reportResponseWrapper struct {
	// in: body
	Body dto.ReportResponse
}

// swagger:response moderationReportResponse
type moderationReportResponseWrapper struct {
	// in: body
	Body dto.ModerationReportResponse
}

// swagger:response reportListResponse
type reportListResponseWrapper struct {
	// in: body
	Body dto.ReportListResponse
}

// swagger:response moderationActionResponse
type moderationActionResponseWrapper struct {
	// in: body
	Body dto.ModerationActionResponse
}

// swagger:response moderationActionListResponse
type moderationActionListResponseWrapper struct {
	// in: body
	Body dto.ModerationActionListResponse
}

// swagger:response moderationStatsResponse
type moderationStatsResponseWrapper struct {
	// in: body
	Body dto.ModerationStatsResponse
}

// swagger:response moderatorNotesListResponse
type moderatorNotesListResponseWrapper struct {
	// in: body
	Body dto.ModeratorNotesListResponse
}

// swagger:response userProfileResponse
type userProfileResponseWrapper struct {
	// in: body
	Body dto.UserProfile
}

// swagger:response moderatorProfileResponse
type moderatorProfileResponseWrapper struct {
	// in: body
	Body dto.ModeratorProfile
}
