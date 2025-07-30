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
