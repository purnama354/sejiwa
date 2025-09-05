package dto

// UserProfile defines the user profile structure in auth responses.
type UserProfile struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
	Status       string `json:"status"`
	Role         string `json:"role"`
	ThreadCount  int    `json:"thread_count"`
	ReplyCount   int    `json:"reply_count"`
	LastActiveAt string `json:"last_active_at"`
}

// ModeratorProfile extends UserProfile for moderator-specific data
type ModeratorProfile struct {
	ID           string   `json:"id"`
	Username     string   `json:"username"`
	Email        string   `json:"email"`
	FullName     string   `json:"full_name,omitempty"`
	CreatedAt    string   `json:"created_at"`
	UpdatedAt    string   `json:"updated_at"`
	Status       string   `json:"status"`
	Role         string   `json:"role"`
	Permissions  []string `json:"permissions"`
	ThreadCount  int      `json:"thread_count"`
	ReplyCount   int      `json:"reply_count"`
	LastActiveAt string   `json:"last_active_at"`
	CreatedBy    string   `json:"created_by,omitempty"`
}

// ----- User Dashboard DTOs -----

type UserStatsResponse struct {
	ThreadsCreated   int `json:"threads_created"`
	RepliesPosted    int `json:"replies_posted"`
	ThreadsLiked     int `json:"threads_liked"`
	ThreadsSaved     int `json:"threads_saved"`
	ActiveDays       int `json:"active_days"`
	StreakDays       int `json:"streak_days"`
	CategoriesJoined int `json:"categories_joined"`
	ReportCount      int `json:"report_count"`
	KarmaPoints      int `json:"karma_points"`
}

type ThreadPreview struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Category     string `json:"category"`
	CategorySlug string `json:"category_slug"`
	Replies      int    `json:"replies"`
	CreatedAt    string `json:"created_at"`
	Preview      string `json:"preview"`
	HasNew       bool   `json:"has_new_replies"`
	IsLocked     bool   `json:"is_locked"`
}

type ReplyPreview struct {
	ThreadID    string `json:"thread_id"`
	ThreadTitle string `json:"thread_title"`
	Category    string `json:"category"`
	CategorySlug string `json:"category_slug"`
	RepliedAt   string `json:"replied_at"`
	Preview     string `json:"preview"`
}

type UserActivityResponse struct {
	Threads       []ThreadPreview `json:"threads"`
	RecentReplies []ReplyPreview  `json:"recent_replies"`
	SavedThreads  []ThreadPreview `json:"saved_threads"`
}

type CategorySubscription struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	ThreadCount int    `json:"thread_count"`
	Description string `json:"description"`
}

type NotificationPreferences struct {
	ThreadReplies         bool `json:"thread_replies"`
	Mentions              bool `json:"mentions"`
	CategoryUpdates       bool `json:"category_updates"`
	CommunityAnnouncements bool `json:"community_announcements"`
}

type PrivacySettings struct {
	ShowActiveStatus    bool   `json:"show_active_status"`
	AllowDirectMessages bool   `json:"allow_direct_messages"`
	ContentVisibility   string `json:"content_visibility"`
}
