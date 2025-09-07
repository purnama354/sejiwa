package middleware

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/purnama354/sejiwa-api/internal/models"
)

// helper middleware to inject a role for testing
func withRole(role models.UserRole) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Set(ContextUserRoleKey, role)
        c.Next()
    }
}

func TestRolesAllowedMiddleware_AllowsUserAndModerator_BlocksAdmin(t *testing.T) {
    gin.SetMode(gin.TestMode)

    // Build a tiny app with the roles-allowed middleware
    newEngine := func() *gin.Engine {
        r := gin.New()
        r.GET("/protected",
            RolesAllowedMiddleware(models.RoleUser, models.RoleModerator),
            func(c *gin.Context) { c.Status(http.StatusOK) },
        )
        return r
    }

    // Allowed: user
    {
        r := gin.New()
        r.GET("/protected",
            withRole(models.RoleUser),
            RolesAllowedMiddleware(models.RoleUser, models.RoleModerator),
            func(c *gin.Context) { c.Status(http.StatusOK) },
        )
        req := httptest.NewRequest(http.MethodGet, "/protected", nil)
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
        if w.Code != http.StatusOK {
            t.Fatalf("expected 200 for user, got %d", w.Code)
        }
    }

    // Allowed: moderator
    {
        r := gin.New()
        r.GET("/protected",
            withRole(models.RoleModerator),
            RolesAllowedMiddleware(models.RoleUser, models.RoleModerator),
            func(c *gin.Context) { c.Status(http.StatusOK) },
        )
        req := httptest.NewRequest(http.MethodGet, "/protected", nil)
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
        if w.Code != http.StatusOK {
            t.Fatalf("expected 200 for moderator, got %d", w.Code)
        }
    }

    // Blocked: admin
    {
        r := gin.New()
        r.GET("/protected",
            withRole(models.RoleAdmin),
            RolesAllowedMiddleware(models.RoleUser, models.RoleModerator),
            func(c *gin.Context) { c.Status(http.StatusOK) },
        )
        req := httptest.NewRequest(http.MethodGet, "/protected", nil)
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
        if w.Code != http.StatusForbidden {
            t.Fatalf("expected 403 for admin, got %d", w.Code)
        }
    }

    // Missing role in context -> 401
    {
        r := newEngine()
        req := httptest.NewRequest(http.MethodGet, "/protected", nil)
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
        if w.Code != http.StatusUnauthorized {
            t.Fatalf("expected 401 when role missing, got %d", w.Code)
        }
    }
}
