package testutils

import (
	"database/sql"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	sqlite "github.com/glebarez/sqlite"
	"github.com/purnama354/sejiwa-api/internal/models"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

var ErrDatabase = errors.New("database error")

func NewMockDB() (*sql.DB, sqlmock.Sqlmock, error) {
	db, mock, err := sqlmock.New()
	if err != nil {
		return nil, nil, err
	}
	return db, mock, nil
}

func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	require.NoError(t, err)
	err = db.AutoMigrate(&models.User{}, &models.UserPreferences{}, &models.Category{}, &models.Thread{}, &models.Reply{}, &models.Report{}, &models.SavedThread{}, &models.CategorySubscription{})
	require.NoError(t, err)
	return db
}
