package routes

import (
	"net/http"
	"time"

	"github.com/purnama354/sejiwa-api/internal/config"
	"github.com/purnama354/sejiwa-api/internal/handlers"
	"github.com/purnama354/sejiwa-api/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config, authHandler *handlers.AuthHandler, adminHandler *handlers.AdminHandler, userHandler *handlers.UserHandler, categoryHandler *handlers.CategoryHandler, threadHandler *handlers.ThreadHandler) {
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

		// Authentication routes (public)
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
		}

		// Category routes
		categoryRoutes := api.Group("/categories")
		{
			categoryRoutes.GET("", categoryHandler.GetAll)
			categoryRoutes.GET("/:id", categoryHandler.GetByID)

			// Admin-only category routes
			categoryRoutes.POST("", middleware.AuthMiddleware(cfg.JWTSecret), middleware.AdminOnlyMiddleware(), categoryHandler.Create)
			categoryRoutes.PUT("/:id", middleware.AuthMiddleware(cfg.JWTSecret), middleware.AdminOnlyMiddleware(), categoryHandler.Update)
			categoryRoutes.DELETE("/:id", middleware.AuthMiddleware(cfg.JWTSecret), middleware.AdminOnlyMiddleware(), categoryHandler.Delete)
		}

		// Thread routes
		threadRoutes := api.Group("/threads")
		{
			// Public routes
			threadRoutes.GET("", threadHandler.GetAll)
			threadRoutes.GET("/search", threadHandler.Search)
			threadRoutes.GET("/pinned", threadHandler.GetPinned)
			threadRoutes.GET("/:id", threadHandler.GetByID)

			// Authenticated routes
			threadRoutes.POST("", middleware.AuthMiddleware(cfg.JWTSecret), threadHandler.Create)
			threadRoutes.PUT("/:id", middleware.AuthMiddleware(cfg.JWTSecret), threadHandler.Update)
			threadRoutes.DELETE("/:id", middleware.AuthMiddleware(cfg.JWTSecret), threadHandler.Delete)
		}

		// Category-specific thread routes
		categoryRoutes.GET("/:categoryId/threads", threadHandler.GetByCategory)

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

			// Test endpoint for admin access
			adminRoutes.GET("/test", func(c *gin.Context) {
				userID, _ := c.Get(middleware.ContextUserIDKey)
				userRole, _ := c.Get(middleware.ContextUserRoleKey)

				c.JSON(http.StatusOK, gin.H{
					"message":   "Admin access confirmed",
					"user_id":   userID,
					"role":      userRole,
					"endpoint":  "admin-only",
					"timestamp": time.Now().Format(time.RFC3339),
				})
			})
		}

		// Moderator or Admin routes
		moderatorRoutes := api.Group("/moderation")
		moderatorRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		moderatorRoutes.Use(middleware.ModeratorOrAdminMiddleware())
		{
			// Test endpoint for moderator/admin access
			moderatorRoutes.GET("/test", func(c *gin.Context) {
				userID, _ := c.Get(middleware.ContextUserIDKey)
				userRole, _ := c.Get(middleware.ContextUserRoleKey)

				c.JSON(http.StatusOK, gin.H{
					"message":   "Moderator/Admin access confirmed",
					"user_id":   userID,
					"role":      userRole,
					"endpoint":  "moderator-or-admin",
					"timestamp": time.Now().Format(time.RFC3339),
				})
			})

			// Thread moderation
			moderatorRoutes.POST("/threads/:id", threadHandler.ModerateThread)
		}

		// Authenticated user routes (all roles)
		userRoutes := api.Group("/users")
		userRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			userRoutes.GET("/me", userHandler.GetProfile)
			userRoutes.GET("/me/role", userHandler.GetRoleInfo)

			// Test endpoint for any authenticated user
			userRoutes.GET("/test", func(c *gin.Context) {
				userID, _ := c.Get(middleware.ContextUserIDKey)
				userRole, _ := c.Get(middleware.ContextUserRoleKey)

				c.JSON(http.StatusOK, gin.H{
					"message":   "Authenticated user access confirmed",
					"user_id":   userID,
					"role":      userRole,
					"endpoint":  "authenticated-user",
					"timestamp": time.Now().Format(time.RFC3339),
				})
			})
		}
	}
}
