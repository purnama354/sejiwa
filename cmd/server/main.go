package main

import (
	"fmt"
	"log"
	"net/http"

	"sejiwa-api/internal/config"
	"sejiwa-api/internal/database"
	"sejiwa-api/internal/handlers"
	"sejiwa-api/internal/models"
	"sejiwa-api/internal/repository"
	"sejiwa-api/internal/services"

	"github.com/gin-gonic/gin"
)

// @title Sejiwa API
// @version 1.0
// @description This is the API for Sejiwa, an anonymous mental health discussion platform.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1

func main() {

	log.Println("Starting database migration...")

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading configuration: %v", err)
	}

	// Connect to the database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
	log.Println("Database connection established")

	log.Println("Running auto-migration...")
	err = db.AutoMigrate(
		&models.User{},
		// Add other models here

	)

	if err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully.")

	// Initialize the user repository
	userRepo := repository.NewUserRepository(db)

	// Initialize the authentication service
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)

	// Initialize the authentication handler
	authHandler := handlers.NewAuthHandler(authService)

	router := gin.Default()

	// Define a simple health check endpoint
	api := router.Group("/api/v1")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			// Check database connection
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
	}

	// Start the server using the configured port
	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("Server starting on %s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
