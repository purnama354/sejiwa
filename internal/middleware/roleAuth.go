package middleware

import (
	"net/http"

	"github.com/purnama354/sejiwa-api/internal/models"

	"github.com/gin-gonic/gin"
)

// AdminOnlyMiddleware ensures only admin users can access the endpoint
func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoleInterface, exists := c.Get(ContextUserRoleKey)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "No role found in token",
				"code":    "TOKEN_INVALID",
				"success": false,
			})
			return
		}

		userRole, ok := userRoleInterface.(models.UserRole)
		if !ok || userRole != models.RoleAdmin {
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
		userRoleInterface, exists := c.Get(ContextUserRoleKey)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "No role found in token",
				"code":    "TOKEN_INVALID",
				"success": false,
			})
			return
		}

		userRole, ok := userRoleInterface.(models.UserRole)
		if !ok || (userRole != models.RoleAdmin && userRole != models.RoleModerator) {
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
