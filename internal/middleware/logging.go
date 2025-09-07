package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// ContextRequestIDKey is the context key used to store the request ID
const ContextRequestIDKey = "requestID"

// LoggingMiddleware logs basic request/response info and flags errors (4xx/5xx)
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()

		// Continue to next handlers
		c.Next()

		status := c.Writer.Status()
		latency := time.Since(start)

		// Attach user id/role if present
		var uid any
		var role any
		if v, ok := c.Get(ContextUserIDKey); ok {
			uid = v
		}
		if v, ok := c.Get(ContextUserRoleKey); ok {
			role = v
		}

		// Attach request id if present
		var reqID any
		if v, ok := c.Get(ContextRequestIDKey); ok {
			reqID = v
		}

		// Log level based on status code
		if status >= 500 {
			log.Printf("ERROR | %3d | %13v | %15s | %-7s %s | req=%v | user=%v role=%v | errs=%v",
				status, latency, clientIP, method, path, reqID, uid, role, c.Errors)
		} else if status >= 400 {
			log.Printf("WARN  | %3d | %13v | %15s | %-7s %s | req=%v | user=%v role=%v | errs=%v",
				status, latency, clientIP, method, path, reqID, uid, role, c.Errors)
		} else {
			log.Printf("INFO  | %3d | %13v | %15s | %-7s %s | req=%v | user=%v role=%v",
				status, latency, clientIP, method, path, reqID, uid, role)
		}
	}
}
