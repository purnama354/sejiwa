package middleware

import (
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// OptionalAuthMiddleware parses Authorization header if present and sets user context, but never aborts on missing/invalid tokens.
func OptionalAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// No auth header; continue without setting context
			c.Next()
			return
		}

		// Expected format: Bearer <token>
		// We are lenient here: if parsing fails, we just continue without user context
		var tokenString string
		if len(authHeader) > 7 && (authHeader[:7] == "Bearer " || authHeader[:7] == "bearer ") {
			tokenString = authHeader[7:]
		}

		if tokenString == "" {
			c.Next()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			// Ignore invalid token for optional auth
			c.Next()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if sub, ok := claims["sub"].(string); ok {
				if userID, err := uuid.Parse(sub); err == nil {
					c.Set(ContextUserIDKey, userID)
				}
			}
			if role, ok := claims["role"].(string); ok {
				c.Set(ContextUserRoleKey, models.UserRole(role))
			}
		}

		c.Next()
	}
}
