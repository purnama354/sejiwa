package models

import (
	"github.com/google/uuid"
)

type ContentType string

const (
	ContentTypeThread ContentType = "thread"
	ContentTypeReply  ContentType = "reply"
	ContentTypeUser   ContentType = "user"
)

type ReportReason string

const (
	ReasonSpam           ReportReason = "spam"
	ReasonHarassment     ReportReason = "harassment"
	ReasonHateSpeech     ReportReason = "hate_speech"
	ReasonInappropriate  ReportReason = "inappropriate_content"
	ReasonSelfHarm       ReportReason = "self_harm"
	ReasonMisinformation ReportReason = "misinformation"
	ReasonOther          ReportReason = "other"
)

type ReportStatus string

const (
	ReportStatusPending  ReportStatus = "pending"
	ReportStatusReviewed ReportStatus = "reviewed"
	ReportStatusResolved ReportStatus = "resolved"
)

type ReportPriority string

const (
	PriorityLow      ReportPriority = "low"
	PriorityMedium   ReportPriority = "medium"
	PriorityHigh     ReportPriority = "high"
	PriorityCritical ReportPriority = "critical"
)

type Report struct {
	BaseModel
	ContentType    ContentType    `gorm:"type:varchar(20);not null;index"`
	ContentID      uuid.UUID      `gorm:"type:uuid;not null;index"`
	ReporterID     uuid.UUID      `gorm:"type:uuid;not null;index"`
	ReportedUserID uuid.UUID      `gorm:"type:uuid;not null;index"`
	Reason         ReportReason   `gorm:"type:varchar(50);not null"`
	Description    string         `gorm:"type:text"`
	Status         ReportStatus   `gorm:"type:varchar(20);default:'pending';not null;index"`
	Priority       ReportPriority `gorm:"type:varchar(20);default:'medium';not null;index"`

	// Relationships
	Reporter     User `gorm:"foreignKey:ReporterID"`
	ReportedUser User `gorm:"foreignKey:ReportedUserID"`
}

// TableName returns the table name for Report model
func (Report) TableName() string {
	return "reports"
}

// AutoAssignPriority assigns priority based on reason and user history
func (r *Report) AutoAssignPriority(reportedUserViolationCount int) {
	switch r.Reason {
	case ReasonSelfHarm:
		r.Priority = PriorityCritical
	case ReasonHarassment, ReasonHateSpeech:
		if reportedUserViolationCount >= 2 {
			r.Priority = PriorityCritical
		} else {
			r.Priority = PriorityHigh
		}
	case ReasonSpam, ReasonMisinformation:
		if reportedUserViolationCount >= 3 {
			r.Priority = PriorityHigh
		} else {
			r.Priority = PriorityMedium
		}
	case ReasonInappropriate, ReasonOther:
		r.Priority = PriorityMedium
	default:
		r.Priority = PriorityLow
	}
}
