package dto

// RegisterRequest defines the structure for a user registration request.
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=30,alphanum_underscore_hyphen"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

// LoginRequest defines the structure for a user login request.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RefreshTokenRequest defines the structure for refresh token requests.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// CreateAdminRequest defines the structure for creating new admin accounts
type CreateAdminRequest struct {
	Username string `json:"username" binding:"required,min=3,max=30,alphanum_underscore_hyphen"`
	Password string `json:"password" binding:"required,min=8,max=128"`
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"full_name,omitempty" binding:"max=100"`
}

// CreateCategoryRequest defines the structure for creating new categories
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=50"`
	Description string `json:"description,omitempty" binding:"max=255"`
}

// CreateThreadRequest defines the structure for creating a new thread
type CreateThreadRequest struct {
	Title      string `json:"title" binding:"required,min=5,max=255"`
	Content    string `json:"content" binding:"required,min=10,max=10000"`
	CategoryID string `json:"category_id" binding:"required,uuid"`
}

// CreateReplyRequest defines the structure for creating a new reply

type CreateReplyRequest struct {
	Content       string  `json:"content" binding:"required,min=5,max=5000"`
	ParentReplyID *string `json:"parent_reply_id,omitempty" binding:"omitempty,uuid"`
}

// UpdateReplyRequest defines the structure for updating a reply
type UpdateReplyRequest struct {
	Content *string `json:"content,omitempty" binding:"omitempty,min=5,max=5000"`
}

// CreateModeratorRequest defines the structure for creating new moderator accounts
type CreateModeratorRequest struct {
	Username    string   `json:"username" binding:"required,min=3,max=30,alphanum_underscore_hyphen"`
	Password    string   `json:"password" binding:"required,min=8,max=128"`
	Email       string   `json:"email" binding:"required,email"`
	FullName    string   `json:"full_name,omitempty" binding:"max=100"`
	Permissions []string `json:"permissions,omitempty"`
}

// UpdateUserRequest defines the structure for updating user profile
type UpdateUserRequest struct {
	Username *string `json:"username,omitempty" binding:"omitempty,min=3,max=30,alphanum_underscore_hyphen"`
}

// Preferences update requests
type UpdateNotificationPreferencesRequest struct {
	ThreadReplies          *bool `json:"thread_replies"`
	Mentions               *bool `json:"mentions"`
	CategoryUpdates        *bool `json:"category_updates"`
	CommunityAnnouncements *bool `json:"community_announcements"`
}

type UpdatePrivacySettingsRequest struct {
	ShowActiveStatus    *bool   `json:"show_active_status"`
	AllowDirectMessages *bool   `json:"allow_direct_messages"`
	ContentVisibility   *string `json:"content_visibility"`
}

// Subscription and saved thread requests
type SubscribeRequest struct {
	CategoryID string `json:"category_id" binding:"required,uuid"`
}

type UnsubscribeRequest struct {
	CategoryID string `json:"category_id" binding:"required,uuid"`
}

type SaveThreadRequest struct {
	ThreadID string `json:"thread_id" binding:"required,uuid"`
}

type UnsaveThreadRequest struct {
	ThreadID string `json:"thread_id" binding:"required,uuid"`
}
