package config

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	AppPort              string `envconfig:"APP_PORT" default:"8080"`
	DatabaseURL          string `envconfig:"DATABASE_URL" required:"true"`
	JWTSecret            string `envconfig:"JWT_SECRET"   required:"true"`
	InitialAdminUsername string `envconfig:"INITIAL_ADMIN_USERNAME" default:"admin"`
	InitialAdminPassword string `envconfig:"INITIAL_ADMIN_PASSWORD" required:"true"`
}

// LoadConfig loads configuration from environment variables.
func LoadConfig() (*Config, error) {
	// Try typical locations for .env during local dev; ignore errors
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../../.env")

	var cfg Config
	err := envconfig.Process("", &cfg)
	if err != nil {
		return nil, err
	}

	// Railway and many PaaS set PORT; prefer it if present
	if p := os.Getenv("PORT"); p != "" {
		cfg.AppPort = p
	}

	return &cfg, nil
}
