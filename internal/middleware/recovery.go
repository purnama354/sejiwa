package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/purnama354/sejiwa-api/internal/dto"
)

// RecoveryMiddleware recovers from panics, logs the stack trace, and returns a structured error response.
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				// Log the panic and stack trace
				log.Printf("panic recovered: %v\n%s", r, debug.Stack())
				// Return a standardized error response
				c.AbortWithStatusJSON(http.StatusInternalServerError, dto.NewErrorResponse(
					"An unexpected error occurred",
					"INTERNAL_SERVER_ERROR",
					nil,
				))
			}
		}()
		c.Next()
	}
}
