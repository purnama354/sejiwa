package routes

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/purnama354/sejiwa-api/internal/config"
	"github.com/purnama354/sejiwa-api/internal/handlers"
	"github.com/purnama354/sejiwa-api/internal/middleware"
)

func RegisterRoutes(
	router *gin.Engine, db *gorm.DB, cfg *config.Config,
	authHandler *handlers.AuthHandler, adminHandler *handlers.AdminHandler, userHandler *handlers.UserHandler,
	categoryHandler *handlers.CategoryHandler, threadHandler *handlers.ThreadHandler, replyHandler *handlers.ReplyHandler,
	reportHandler *handlers.ReportHandler, moderationHandler *handlers.ModerationHandler, moderatorNoteHandler *handlers.ModeratorNoteHandler,
	authLimiter gin.HandlerFunc, accountLockout gin.HandlerFunc,
) {
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

		// Authentication routes (public, with rate limiting and lockout)
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", authLimiter, authHandler.Register)
			authRoutes.POST("/login", authLimiter, accountLockout, authHandler.Login)

		}

		// Category routes
		categoryRoutes := api.Group("/categories")
		{
			categoryRoutes.GET("", categoryHandler.GetAll)
			categoryRoutes.GET("/:id", categoryHandler.GetByID)
			categoryRoutes.GET("/:id/threads", threadHandler.GetByCategory)

			// Admin-only category routes
			categoryRoutes.POST("", middleware.AuthMiddleware(cfg.JWTSecret), middleware.AdminOnlyMiddleware(), categoryHandler.Create)
			categoryRoutes.PUT("/:id", middleware.AuthMiddleware(cfg.JWTSecret), middleware.AdminOnlyMiddleware(), categoryHandler.Update)
			categoryRoutes.DELETE("/:id", middleware.AuthMiddleware(cfg.JWTSecret), middleware.AdminOnlyMiddleware(), categoryHandler.Delete)
		}

		// Thread routes with reply endpoints
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

			// Thread reply routes
			threadRoutes.GET("/:id/replies", replyHandler.GetByThread)
			threadRoutes.POST("/:id/replies", middleware.AuthMiddleware(cfg.JWTSecret), replyHandler.Create)
		}

		// Reply routes
		replyRoutes := api.Group("/replies")
		{
			// Public routes
			replyRoutes.GET("/:id", replyHandler.GetByID)

			// Authenticated routes
			replyRoutes.PATCH("/:id", middleware.AuthMiddleware(cfg.JWTSecret), replyHandler.Update)
			replyRoutes.DELETE("/:id", middleware.AuthMiddleware(cfg.JWTSecret), replyHandler.Delete)
		}

		// Report routes
		reportRoutes := api.Group("/reports")
		reportRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			reportRoutes.POST("", reportHandler.Create)
			reportRoutes.GET("/me", reportHandler.GetMyReports)
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

			// Users listing for admin panel
			adminRoutes.GET("/users", adminHandler.ListUsers)

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

			// Content moderation endpoints
			moderatorRoutes.POST("/threads/:id", threadHandler.ModerateThread)
			moderatorRoutes.POST("/replies/:id", replyHandler.ModerateReply)

			moderatorRoutes.GET("/users/:id/moderator-notes", moderatorNoteHandler.GetNotesByUserID)
			moderatorRoutes.POST("/users/:id/moderator-notes", moderatorNoteHandler.CreateNote)
			moderatorRoutes.DELETE("/moderator-notes/:noteId", moderatorNoteHandler.DeleteNote)

			// Report management
			moderatorRoutes.GET("/reports", moderationHandler.GetReportsForModeration)
			moderatorRoutes.GET("/reports/:id", reportHandler.GetByID)
			moderatorRoutes.POST("/reports/:id/actions", moderationHandler.ProcessReport)

			// Moderation actions and statistics
			moderatorRoutes.GET("/actions", moderationHandler.GetModerationActions)
			moderatorRoutes.GET("/stats", moderationHandler.GetModerationStats)

			// User management
			moderatorRoutes.POST("/users/:id/ban", moderationHandler.BanUser)
			moderatorRoutes.POST("/users/:id/unban", moderationHandler.UnbanUser)
		}

		// Authenticated user routes (all roles)
		userRoutes := api.Group("/users")
		userRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			userRoutes.GET("/me", userHandler.GetProfile)
			userRoutes.PATCH("/me", userHandler.UpdateProfile)
			userRoutes.GET("/me/role", userHandler.GetRoleInfo)
			userRoutes.GET("/me/stats", userHandler.GetMyStats)
			userRoutes.GET("/me/activity", userHandler.GetMyActivity)
			userRoutes.GET("/me/categories", userHandler.GetMyCategories)

			// Preferences
			userRoutes.GET("/me/preferences", userHandler.GetPreferences)
			userRoutes.PUT("/me/preferences/notifications", userHandler.UpdateNotificationPreferences)
			userRoutes.PUT("/me/preferences/privacy", userHandler.UpdatePrivacySettings)

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
