package middleware

import (
	"net/http"
	"sejiwa-api/internal/models"

	"github.com/gin-gonic/gin"
)

// AdminOnlyMiddleware ensures only admin users can access the endpoint
func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get(ContextUserRoleKey)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "No role found in token",
				"code":    "TOKEN_INVALID",
				"success": false,
			})
			return
		}

		if role, ok := userRole.(models.UserRole); !ok || role != models.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "Admin access required",
				"code":    "ADMIN_ONLY",
				"success": false,
			})
			return
		}

		c.Next()
	}
}

// ModeratorOrAdminMiddleware ensures only moderators or admins can access the endpoint
func ModeratorOrAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get(ContextUserRoleKey)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "No role found in token",
				"code":    "TOKEN_INVALID",
				"success": false,
			})
			return
		}

		if role, ok := userRole.(models.UserRole); !ok || (role != models.RoleAdmin && role != models.RoleModerator) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "Moderator or admin access required",
				"code":    "INSUFFICIENT_PERMISSIONS",
				"success": false,
			})
			return
		}

		c.Next()
	}
}
