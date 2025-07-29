package main

import (
	"net/http"

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
	router := gin.Default()

	// Define a simple health check endpoint
	api := router.Group("/api/v1")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "UP",
			})
		})
	}

	// Start the server on port 8080
	if err := router.Run(":8080"); err != nil {
		panic(err)
	}
}
