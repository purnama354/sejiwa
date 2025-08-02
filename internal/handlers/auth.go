package handlers

import (
	"errors"
	"net/http"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := utils.ParseValidationErrors(err)
		errorResponse := dto.NewErrorResponse(
			"Validation failed",
			"VALIDATION_ERROR",
			validationErrors,
		)
		c.JSON(http.StatusUnprocessableEntity, errorResponse)
		return
	}

	authResponse, err := h.authService.Register(req)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) {
			errorResponse := dto.NewErrorResponse(
				"Username already exists",
				"USERNAME_ALREADY_EXISTS",
				nil,
			)
			c.JSON(http.StatusConflict, errorResponse)
			return
		}
		errorResponse := dto.NewErrorResponse(
			"Failed to register user",
			"INTERNAL_SERVER_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	c.JSON(http.StatusCreated, authResponse)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := utils.ParseValidationErrors(err)
		errorResponse := dto.NewErrorResponse(
			"Validation failed",
			"VALIDATION_ERROR",
			validationErrors,
		)
		c.JSON(http.StatusUnprocessableEntity, errorResponse)
		return
	}

	authResponse, err := h.authService.Login(req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			errorResponse := dto.NewErrorResponse(
				"Invalid credentials",
				"AUTH_INVALID_CREDENTIALS",
				nil,
			)
			c.JSON(http.StatusUnauthorized, errorResponse)
			return
		}
		errorResponse := dto.NewErrorResponse(
			"Failed to log in",
			"INTERNAL_SERVER_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	c.JSON(http.StatusOK, authResponse)
}
