package testutils

import (
	"database/sql"

	"github.com/DATA-DOG/go-sqlmock"
)

func NewMockDB() (*sql.DB, sqlmock.Sqlmock, error) {
	db, mock, err := sqlmock.New()
	if err != nil {
		return nil, nil, err
	}
	return db, mock, nil
}
