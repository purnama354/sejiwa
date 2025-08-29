import api from "@/lib/api"
import type {
  ModerationActionRequest,
  ModerationActionResponse,
  ModerationStatsResponse,
  ReportListResponse,
} from "@/types/api"

export async function getReports(params: {
  page?: number
  pageSize?: number
  status?: string
  priority?: string
}) {
  const { page = 1, pageSize = 20, status, priority } = params
  const res = await api.get<ReportListResponse>(`/moderation/reports`, {
    params: {
      page,
      pageSize,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
  })
  return res.data
}

export async function processReport(
  reportId: string,
  body: ModerationActionRequest
) {
  const res = await api.post<ModerationActionResponse>(
    `/moderation/reports/${reportId}/actions`,
    body
  )
  return res.data
}

export async function getModerationStats(moderatorId?: string) {
  const res = await api.get<ModerationStatsResponse>(`/moderation/stats`, {
    params: moderatorId ? { moderator_id: moderatorId } : undefined,
  })
  return res.data
}
