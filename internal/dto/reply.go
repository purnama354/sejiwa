package dto

// ReplyModerationRequest for moderation actions on replies
type ReplyModerationRequest struct {
	Action string `json:"action" binding:"required,oneof=hide unhide delete"`
	Reason string `json:"reason,omitempty" binding:"max=500"`
}
