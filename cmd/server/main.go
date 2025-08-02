package main

import (
	"fmt"
	"log"

	"github.com/purnama354/sejiwa-api/internal/config"
	"github.com/purnama354/sejiwa-api/internal/database"
	"github.com/purnama354/sejiwa-api/internal/database/seeds"
	"github.com/purnama354/sejiwa-api/internal/handlers"
	"github.com/purnama354/sejiwa-api/internal/repository"
	"github.com/purnama354/sejiwa-api/internal/routes"
	"github.com/purnama354/sejiwa-api/internal/services"
	"github.com/purnama354/sejiwa-api/internal/utils"

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
