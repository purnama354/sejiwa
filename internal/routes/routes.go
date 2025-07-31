package routes

import (
	"net/http"

	"sejiwa-api/internal/config"
	"sejiwa-api/internal/handlers"
	"sejiwa-api/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config, authHandler *handlers.AuthHandler, adminHandler *handlers.AdminHandler) {
	api := router.Group("/api/v1")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			sqlDB, err := db.DB()
			if err != nil {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"status":          "DOWN",
					"database_status": "unreachable",
				})
				return
			}

			err = sqlDB.Ping()
			if err != nil {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"status":          "DOWN",
					"database_status": "unhealthy",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"status":          "UP",
				"database_status": "healthy",
			})
		})

		// Authentication routes
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
		}

		// Admin-only routes
		adminRoutes := api.Group("/admin")
		adminRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		adminRoutes.Use(middleware.AdminOnlyMiddleware())
		{
			adminAuthRoutes := adminRoutes.Group("/auth")
			{
				adminAuthRoutes.POST("/create-admin", adminHandler.CreateAdmin)
				adminAuthRoutes.POST("/create-moderator", adminHandler.CreateModerator)
			}
		}

		authRequired := api.Group("/")
		authRequired.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			authRequired.GET("/me", func(c *gin.Context) {
				userID, _ := c.Get(middleware.ContextUserIDKey)
				userRole, _ := c.Get(middleware.ContextUserRoleKey)

				c.JSON(http.StatusOK, gin.H{
					"message": "This is a protected route",
					"user_id": userID,
					"role":    userRole,
				})
			})
		}
	}
}
