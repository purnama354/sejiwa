package handlers

import (
	"errors"
	"net/http"
	"sejiwa-api/internal/dto"
	"sejiwa-api/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register godoc
// @Summary Register a new user
// @Description Creates a new user account with an anonymous username.
// @Tags Auth
// @Accept json
// @Produce json
// @Param user body dto.RegisterRequest true "Registration Info"
// @Success 201 {object} map[string]string "User registered successfully"
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 409 {object} map[string]string "Username already exists"
// @Failure 500 {object} map[string]string "Internal server error

// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	_, err := h.authService.Register(req)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) {
			c.JSON(http.StatusConflict, gin.H{"error": services.ErrUserExists.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

// Login godoc
// @Summary Log in a user
// @Description Authenticates a user and returns a JWT token.
// @Tags Auth
// @Accept json
// @Produce json
// @Param user body dto.LoginRequest true "Login Credentials"
// @Success 200 {object} dto.AuthResponse
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 401 {object} map[string]string "Invalid credentials"
// @Failure 500 {object} map[string]string "Internal server error"

// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	res, err := h.authService.Login(req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": services.ErrInvalidCredentials.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log in"})
		return
	}

	c.JSON(http.StatusOK, res)
}
