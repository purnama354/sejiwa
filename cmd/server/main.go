package main

import (
	"fmt"
	"log"
	"time"

	"github.com/purnama354/sejiwa-api/internal/config"
	"github.com/purnama354/sejiwa-api/internal/database"
	"github.com/purnama354/sejiwa-api/internal/database/seeds"
	"github.com/purnama354/sejiwa-api/internal/handlers"
	"github.com/purnama354/sejiwa-api/internal/middleware"
	"github.com/purnama354/sejiwa-api/internal/repository"
	"github.com/purnama354/sejiwa-api/internal/routes"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"
	"github.com/ulule/limiter/v3"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func main() {
	// Load application configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// Register custom validators
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidators(v)
	}

	// Connect to the database and run migrations
	db, err := database.InitAndMigrate(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	log.Println("Database connection established and migrations completed")

	// Seed the database with initial data
	seeds.SeedAdmin(db, cfg.InitialAdminUsername, cfg.InitialAdminPassword)
	seeds.SeedCategories(db)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	threadRepo := repository.NewThreadRepository(db)
	replyRepo := repository.NewReplyRepository(db)
	reportRepo := repository.NewReportRepository(db)
	moderationRepo := repository.NewModerationActionRepository(db) // Add this line

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	adminService := services.NewAdminService(userRepo)
	userService := services.NewUserService(userRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	threadService := services.NewThreadService(threadRepo, categoryRepo, userRepo)
	replyService := services.NewReplyService(replyRepo, threadRepo, userRepo)
	reportService := services.NewReportService(reportRepo, threadRepo, replyRepo, userRepo)
	moderationService := services.NewModerationService(reportRepo, userRepo, threadRepo, replyRepo, moderationRepo)

	// Add moderator note repo/service/handler
	moderatorNoteRepo := repository.NewModeratorNoteRepository(db)
	moderatorNoteService := services.NewModeratorNoteService(moderatorNoteRepo, userRepo)
	moderatorNoteHandler := handlers.NewModeratorNoteHandler(moderatorNoteService)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	adminHandler := handlers.NewAdminHandler(adminService, userService)
	userHandler := handlers.NewUserHandler(userService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	threadHandler := handlers.NewThreadHandler(threadService)
	replyHandler := handlers.NewReplyHandler(replyService)
	reportHandler := handlers.NewReportHandler(reportService)
	moderationHandler := handlers.NewModerationHandler(moderationService, reportService)

	router := gin.Default()

	// Enable CORS for frontend dev origin
	router.Use(middleware.CORSMiddleware())

	// Rate limit: 5 requests per minute per IP for auth endpoints
	authRate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  5,
	}
	authLimiter := middleware.NewRateLimiter(authRate)
	accountLockout := middleware.AccountLockoutMiddleware()

	// Register routes with rate limiting and account lockout for auth endpoints
	routes.RegisterRoutes(
		router, db, cfg,
		authHandler, adminHandler, userHandler, categoryHandler, threadHandler, replyHandler,
		reportHandler, moderationHandler, moderatorNoteHandler, authLimiter, accountLockout,
	)

	// Start the server using the configured port
	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("Server starting on %s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
