package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	ContextUserIDkey   = "userID"
	ContextUserRoleKey = "userRole"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "AUTH_HEADER_MISSING"})
			return
		}
		parts := strings.Split(authHeader, " ")
	}
}
