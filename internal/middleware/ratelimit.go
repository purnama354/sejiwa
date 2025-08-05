package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	ginlimiter "github.com/ulule/limiter/v3/drivers/middleware/gin"
	memory "github.com/ulule/limiter/v3/drivers/store/memory"
)

// NewRateLimiter returns a Gin middleware for rate limiting
func NewRateLimiter(rate limiter.Rate) gin.HandlerFunc {
	store := memory.NewStore()
	instance := limiter.New(store, rate)
	return ginlimiter.NewMiddleware(instance)
}
