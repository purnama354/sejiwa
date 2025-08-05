package database

import (
	"log"

	"github.com/purnama354/sejiwa-api/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

// InitAndMigrate connects to the DB and runs auto-migration for all models.
func InitAndMigrate(dsn string) (*gorm.DB, error) {
	db, err := Connect(dsn)
	if err != nil {
		return nil, err
	}
	log.Println("Database connection established")

	log.Println("Running auto-migration...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Thread{},
	)
	if err != nil {
		return nil, err
	}
	log.Println("Database migration completed successfully.")
	return db, nil
}
