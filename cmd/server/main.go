package main

import (
	"fmt"
	"log"

	"sejiwa-api/internal/config"
	"sejiwa-api/internal/database"
	"sejiwa-api/internal/database/seeds"
	"sejiwa-api/internal/handlers"
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

	// Connect to the database and run migrations
	db, err := database.InitAndMigrate(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	log.Println("Database connection established and migrations completed")

	// Seed the database with initial data
	seeds.SeedAdmin(db, cfg.InitialAdminUsername, cfg.InitialAdminPassword)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	adminService := services.NewAdminService(userRepo)
	userService := services.NewUserService(userRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	adminHandler := handlers.NewAdminHandler(adminService)
	userHandler := handlers.NewUserHandler(userService)

	router := gin.Default()

	// Register routes
	routes.RegisterRoutes(router, db, cfg, authHandler, adminHandler, userHandler)

	// Start the server using the configured port
	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("Server starting on %s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
