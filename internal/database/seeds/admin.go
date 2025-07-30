package seeds

import (
	"log"
	"sejiwa-api/internal/models"
	"sejiwa-api/internal/utils"

	"gorm.io/gorm"
)

// SeedAdmin checks for an existing admin user and creates one if none exists.
func SeedAdmin(db *gorm.DB, username, password string) {
    var userCount int64
    db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&userCount)

    if userCount > 0 {
        log.Println("Admin user already exists. Skipping seed.")
        return
    }

    log.Println("No admin user found. Seeding initial admin account...")

    hashedPassword, err := utils.HashPassword(password)
    if err != nil {
        log.Fatalf("Failed to hash admin password: %v", err)
        return
    }

    adminUser := models.User{
        Username: username,
        Password: hashedPassword,
        Role:     models.RoleAdmin,
    }

    if err := db.Create(&adminUser).Error; err != nil {
        log.Fatalf("Failed to seed admin user: %v", err)
        return
    }

    log.Println("Initial admin user created successfully.")
}