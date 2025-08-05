package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type lockoutInfo struct {
	FailedAttempts int
	LockedUntil    time.Time
}

var (
	lockoutMap   = make(map[string]*lockoutInfo)
	lockoutMutex sync.Mutex
)

const (
	maxFailedAttempts = 5
	lockoutDuration   = 15 * time.Minute
)

// AccountLockoutMiddleware checks if the account is locked before allowing login
func AccountLockoutMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.PostForm("username")
		if username == "" {
			// Try JSON body
			var body struct {
				Username string `json:"username"`
			}
			_ = c.ShouldBindJSON(&body)
			username = body.Username
		}
		if username == "" {
			c.Next()
			return
		}

		lockoutMutex.Lock()
		info, exists := lockoutMap[username]
		lockoutMutex.Unlock()

		if exists && info.LockedUntil.After(time.Now()) {
			c.JSON(http.StatusLocked, gin.H{
				"error":       "Account is temporarily locked due to too many failed login attempts.",
				"code":        "ACCOUNT_LOCKED",
				"success":     false,
				"retry_after": int(time.Until(info.LockedUntil).Seconds()),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RegisterFailedLogin increments failed attempts and locks account if needed
func RegisterFailedLogin(username string) {
	lockoutMutex.Lock()
	defer lockoutMutex.Unlock()
	info, exists := lockoutMap[username]
	if !exists {
		info = &lockoutInfo{}
		lockoutMap[username] = info
	}
	info.FailedAttempts++
	if info.FailedAttempts >= maxFailedAttempts {
		info.LockedUntil = time.Now().Add(lockoutDuration)
		info.FailedAttempts = 0 // reset after lock
	}
}

// ResetFailedLogin resets failed attempts after successful login
func ResetFailedLogin(username string) {
	lockoutMutex.Lock()
	defer lockoutMutex.Unlock()
	delete(lockoutMap, username)
}
