package middleware

import (
	"net/http"

	"github.com/purnama354/sejiwa-api/internal/dto"
	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/gin-gonic/gin"
)

// AdminOnlyMiddleware ensures only admin users can access the endpoint
func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoleInterface, exists := c.Get(ContextUserRoleKey)
		if !exists {
			err := dto.NewErrorResponse("No role found in token", "TOKEN_INVALID", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, err)
			return
		}

		userRole, ok := userRoleInterface.(models.UserRole)
		if !ok || userRole != models.RoleAdmin {
			err := dto.NewErrorResponse("Admin access required", "ADMIN_ONLY", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusForbidden, err)
			return
		}

		c.Next()
	}
}

// ModeratorOrAdminMiddleware ensures only moderators or admins can access the endpoint
func ModeratorOrAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoleInterface, exists := c.Get(ContextUserRoleKey)
		if !exists {
			err := dto.NewErrorResponse("No role found in token", "TOKEN_INVALID", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, err)
			return
		}

		userRole, ok := userRoleInterface.(models.UserRole)
		if !ok || (userRole != models.RoleAdmin && userRole != models.RoleModerator) {
			err := dto.NewErrorResponse("Moderator or admin access required", "INSUFFICIENT_PERMISSIONS", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusForbidden, err)
			return
		}

		c.Next()
	}
}

// RolesAllowedMiddleware ensures only users with any of the allowed roles can access the endpoint
func RolesAllowedMiddleware(allowed ...models.UserRole) gin.HandlerFunc {
	allowedSet := make(map[models.UserRole]struct{}, len(allowed))
	for _, r := range allowed {
		allowedSet[r] = struct{}{}
	}
	return func(c *gin.Context) {
		userRoleInterface, exists := c.Get(ContextUserRoleKey)
		if !exists {
			err := dto.NewErrorResponse("No role found in token", "TOKEN_INVALID", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, err)
			return
		}
		userRole, ok := userRoleInterface.(models.UserRole)
		if !ok {
			err := dto.NewErrorResponse("Invalid role in token", "TOKEN_INVALID", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, err)
			return
		}
		if _, ok := allowedSet[userRole]; !ok {
			err := dto.NewErrorResponse("Insufficient permissions", "INSUFFICIENT_PERMISSIONS", nil)
			if rid := GetRequestID(c); rid != "" {
				err.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusForbidden, err)
			return
		}
		c.Next()
	}
}
