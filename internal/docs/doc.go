package docs

// This file contains the top-level Swagger metadata for the Sejiwa API.
// It uses go-swagger annotations to generate an OpenAPI specification from code comments.

// Title: Sejiwa API
// Description: |
//   The Sejiwa API powers an anonymity-first mental health discussion platform with heavy moderation.
//   It provides endpoints for authentication, categories, threads, replies, reports, and moderation workflows.
// Version: 0.1.0
// BasePath: /api/v1
// Schemes: http, https
//
// Consumes:
// - application/json
//
// Produces:
// - application/json
//
// SecurityDefinitions:
//   Bearer:
//     type: apiKey
//     name: Authorization
//     in: header
//
// Security:
//   - Bearer: []
//
// swagger:meta
type swaggerMeta struct{}
