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
