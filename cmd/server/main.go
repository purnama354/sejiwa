package main

import (
	"fmt"
	"log"

	"sejiwa-api/internal/config"
	"sejiwa-api/internal/database"
	"sejiwa-api/internal/database/seeds"
	"sejiwa-api/internal/handlers"
	"sejiwa-api/internal/models"
	"sejiwa-api/internal/repository"
	"sejiwa-api/internal/routes"
	"sejiwa-api/internal/services"
	"sejiwa-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
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
	// Load application configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// Register custom validators
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidators(v)
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

	// Seed the database with initial data
	seeds.SeedAdmin(db, cfg.InitialAdminUsername, cfg.InitialAdminPassword)

	// Initialize the user repository
	userRepo := repository.NewUserRepository(db)

	// Initialize the authentication service
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)

	// Initialize the authentication handler
	authHandler := handlers.NewAuthHandler(authService)

	router := gin.Default()

	// Register all routes in a separate package
	routes.RegisterRoutes(router, db, cfg, authHandler)

	// Start the server using the configured port
	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("Server starting on %s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
