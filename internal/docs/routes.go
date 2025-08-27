package docs

// This file maps HTTP routes to swagger:route entries using the operation IDs referenced in parameters.go.

// ---------- Health ----------

// swagger:route GET /health health healthCheck
// Health check for API and database
// responses:
//   200: successResponse
//   503: errorResponse

// ---------- Auth ----------

// swagger:route POST /auth/register auth authRegister
// Register a new user account
// responses:
//   201: authResponse
//   409: errorResponse
//   422: errorResponse
//   500: errorResponse

// swagger:route POST /auth/login auth authLogin
// Login and obtain access/refresh tokens
// responses:
//   200: authResponse
//   401: errorResponse
//   423: errorResponse
//   422: errorResponse
//   500: errorResponse

// ---------- Categories ----------

// swagger:route GET /categories categories listCategories
// List categories
// responses:
//   200: categoryListResponse
//   500: errorResponse

// swagger:route GET /categories/{id} categories getCategoryByID
// Get category by ID
// responses:
//   200: categoryResponse
//   404: errorResponse
//   400: errorResponse
//   500: errorResponse

// swagger:route GET /categories/{id}/threads threads getThreadsByCategory
// List threads in a specific category
// responses:
//   200: threadListResponse
//   404: errorResponse
//   400: errorResponse
//   500: errorResponse

// swagger:route POST /categories categories createCategory
// Create category (Admin only)
// Security:
//   - Bearer: []
// responses:
//   201: categoryResponse
//   409: errorResponse
//   422: errorResponse
//   401: errorResponse
//   403: errorResponse
//   500: errorResponse

// swagger:route PUT /categories/{id} categories updateCategory
// Update category (Admin only)
// Security:
//   - Bearer: []
// responses:
//   200: categoryResponse
//   404: errorResponse
//   409: errorResponse
//   422: errorResponse
//   401: errorResponse
//   403: errorResponse
//   500: errorResponse

// swagger:route DELETE /categories/{id} categories deleteCategory
// Delete category (Admin only)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   401: errorResponse
//   403: errorResponse
//   500: errorResponse

// ---------- Threads ----------

// swagger:route GET /threads threads listThreads
// List threads
// responses:
//   200: threadListResponse
//   500: errorResponse

// swagger:route GET /threads/search threads searchThreads
// Search threads by query
// responses:
//   200: threadListResponse
//   400: errorResponse
//   500: errorResponse

// swagger:route GET /threads/pinned threads pinnedThreads
// List pinned threads
// responses:
//   200: threadListResponse
//   500: errorResponse

// swagger:route GET /threads/{id} threads getThreadByID
// Get thread by ID
// responses:
//   200: threadResponse
//   404: errorResponse
//   400: errorResponse
//   500: errorResponse

// swagger:route POST /threads threads createThread
// Create thread (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   201: threadResponse
//   404: errorResponse
//   409: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route PUT /threads/{id} threads updateThread
// Update thread (Author or Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: threadResponse
//   404: errorResponse
//   403: errorResponse
//   409: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route DELETE /threads/{id} threads deleteThread
// Delete thread (Author or Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   403: errorResponse
//   400: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route GET /threads/{id}/replies replies listThreadReplies
// List replies for a thread
// responses:
//   200: replyListResponse
//   404: errorResponse
//   400: errorResponse
//   500: errorResponse

// swagger:route POST /threads/{id}/replies replies createThreadReply
// Create a reply in a thread (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   201: replyResponse
//   404: errorResponse
//   409: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// ---------- Replies ----------

// swagger:route GET /replies/{id} replies getReplyByID
// Get reply by ID
// responses:
//   200: replyResponse
//   404: errorResponse
//   400: errorResponse
//   500: errorResponse

// swagger:route PATCH /replies/{id} replies updateReply
// Update reply (Author or Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: replyResponse
//   404: errorResponse
//   403: errorResponse
//   409: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route DELETE /replies/{id} replies deleteReply
// Delete reply (Author or Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   403: errorResponse
//   400: errorResponse
//   401: errorResponse
//   500: errorResponse

// ---------- Reports ----------

// swagger:route POST /reports moderation createReport
// Submit a content report (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   201: reportResponse
//   404: errorResponse
//   409: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route GET /reports/me moderation getMyReports
// List my submitted reports (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   200: reportListResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route GET /moderation/reports moderation getReportsForModeration
// List reports for moderation review (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: reportListResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route GET /moderation/reports/{id} moderation getReportByID
// Get report by ID (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: moderationReportResponse
//   404: errorResponse
//   400: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route POST /moderation/reports/{id}/actions moderation processReport
// Process a report with a moderation action (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: moderationActionResponse
//   404: errorResponse
//   409: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route GET /moderation/actions moderation getModerationActions
// List moderation actions (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: moderationActionListResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route GET /moderation/stats moderation getModerationStats
// Get moderation statistics (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: moderationStatsResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route POST /moderation/users/{id}/ban moderation banUser
// Ban a user (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   409: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route POST /moderation/users/{id}/unban moderation unbanUser
// Unban a user (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route POST /moderation/threads/{id} moderation moderateThread
// Moderate a thread (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route POST /moderation/replies/{id} moderation moderateReply
// Moderate a reply (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   400: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// ---------- Moderator Notes ----------

// swagger:route GET /moderation/users/{id}/moderator-notes moderation listModeratorNotes
// List moderator notes for a user (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: moderatorNotesListResponse
//   404: errorResponse
//   401: errorResponse
//   500: errorResponse

// ---------- Users ----------

// swagger:route GET /users/me users getMe
// Get my profile (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   200: userProfileResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route PATCH /users/me users updateMe
// Update my profile (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   200: userProfileResponse
//   401: errorResponse
//   404: errorResponse
//   409: errorResponse
//   422: errorResponse
//   500: errorResponse

// swagger:route GET /users/me/role users getRoleInfo
// Get my role info (Authenticated)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   401: errorResponse

// ---------- Admin ----------

// swagger:route POST /admin/auth/create-admin admin createAdmin
// Create an admin account (Admin only)
// Security:
//   - Bearer: []
// responses:
//   201: moderatorProfileResponse
//   401: errorResponse
//   403: errorResponse
//   409: errorResponse
//   422: errorResponse
//   500: errorResponse

// swagger:route POST /admin/auth/create-moderator admin createModerator
// Create a moderator account (Admin only)
// Security:
//   - Bearer: []
// responses:
//   201: moderatorProfileResponse
//   401: errorResponse
//   403: errorResponse
//   409: errorResponse
//   422: errorResponse
//   500: errorResponse

// swagger:route POST /moderation/users/{id}/moderator-notes moderation createModeratorNote
// Create a moderator note for a user (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   201: successResponse
//   404: errorResponse
//   422: errorResponse
//   401: errorResponse
//   500: errorResponse

// swagger:route DELETE /moderation/moderator-notes/{noteId} moderation deleteModeratorNote
// Delete a moderator note (Moderator/Admin)
// Security:
//   - Bearer: []
// responses:
//   200: successResponse
//   404: errorResponse
//   403: errorResponse
//   401: errorResponse
//   500: errorResponse
