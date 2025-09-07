package middleware

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	memory "github.com/ulule/limiter/v3/drivers/store/memory"

	"github.com/purnama354/sejiwa-api/internal/dto"
)

// NewRateLimiter returns a JSON rate limiter middleware (per client IP) with standard error responses.
func NewRateLimiter(rate limiter.Rate) gin.HandlerFunc {
	store := memory.NewStore()
	lmt := limiter.New(store, rate)

	return func(c *gin.Context) {
		// Key by client IP (can be enhanced with user ID if authenticated)
		key := c.ClientIP()

		// Acquire rate context
		ctx, cancel := context.WithTimeout(c.Request.Context(), 200*time.Millisecond)
		defer cancel()

		r, err := lmt.Get(ctx, key)
		if err != nil {
			// On limiter error, fail open but record as warning in logs via Gin errors
			c.Error(err) // collected by logging middleware
			c.Next()
			return
		}

		// Set standard rate limit headers
		c.Header("X-RateLimit-Limit", strconv.FormatInt(r.Limit, 10))
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(r.Remaining, 10))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(r.Reset, 10))

		if r.Reached {
			errBody := dto.NewErrorResponse(
				"Rate limit exceeded",
				"RATE_LIMIT_EXCEEDED",
				nil,
			)
			if rid := GetRequestID(c); rid != "" {
				errBody.RequestID = rid
			}
			c.AbortWithStatusJSON(http.StatusTooManyRequests, errBody)
			return
		}

		c.Next()
	}
}
