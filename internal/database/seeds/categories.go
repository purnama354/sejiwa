package seeds

import (
	"log"

	"github.com/purnama354/sejiwa-api/internal/models"
	"gorm.io/gorm"
)

// SeedCategories creates initial discussion categories if they don't exist
func SeedCategories(db *gorm.DB) {
	var categoryCount int64
	db.Model(&models.Category{}).Count(&categoryCount)

	if categoryCount > 0 {
		log.Println("Categories already exist. Skipping category seed.")
		return
	}

	log.Println("No categories found. Seeding initial categories...")

	initialCategories := []models.Category{
		{
			Name:        "General Discussion",
			Slug:        "general-discussion",
			Description: "Open discussions about mental health and well-being",
		},
		{
			Name:        "Anxiety & Stress",
			Slug:        "anxiety-stress",
			Description: "Support and discussions about anxiety, panic attacks, and stress management",
		},
		{
			Name:        "Depression",
			Slug:        "depression",
			Description: "Share experiences and find support for depression-related challenges",
		},
		{
			Name:        "Relationships",
			Slug:        "relationships",
			Description: "Discuss relationship challenges, family issues, and social connections",
		},
		{
			Name:        "Self-Care & Recovery",
			Slug:        "self-care-recovery",
			Description: "Tips, strategies, and experiences with self-care and recovery journeys",
		},
		{
			Name:        "Professional Help",
			Slug:        "professional-help",
			Description: "Discussions about therapy, counseling, and professional mental health services",
		},
	}

	for _, category := range initialCategories {
		if err := db.Create(&category).Error; err != nil {
			log.Printf("Failed to seed category '%s': %v", category.Name, err)
			continue
		}
		log.Printf("Created category: %s", category.Name)
	}

	log.Println("Initial categories seeded successfully.")
}
