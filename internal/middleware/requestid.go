package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

// RequestIDMiddleware ensures every request has a unique ID available in headers and context.
//
// Behavior:
// - If incoming header X-Request-ID exists and is a valid UUID, it's used.
// - Otherwise, a new UUIDv4 is generated.
// - The value is set into context under ContextRequestIDKey and echoed back in X-Request-ID response header.
func RequestIDMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        reqID := c.GetHeader("X-Request-ID")
        if _, err := uuid.Parse(reqID); err != nil {
            reqID = uuid.NewString()
        }
        c.Set(ContextRequestIDKey, reqID)
        c.Writer.Header().Set("X-Request-ID", reqID)
        c.Next()
    }
}

// GetRequestID returns the request id from context if available, otherwise empty string.
func GetRequestID(c *gin.Context) string {
    if v, ok := c.Get(ContextRequestIDKey); ok {
        if s, ok := v.(string); ok {
            return s
        }
    }
    return ""
}
