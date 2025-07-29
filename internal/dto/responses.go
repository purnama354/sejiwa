package dto

// AuthResponse defines the structure for a successful authentication response.
type AuthResponse struct {
	Token string `json:"token"`
}
