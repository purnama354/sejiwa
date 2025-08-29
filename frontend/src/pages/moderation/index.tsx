import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { getReports, processReport } from "@/services/moderation"
import type { ModerationReport, ModerationActionRequest } from "@/types/api"

export default function ModerationPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("")
  const [priority, setPriority] = useState<string>("")

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports", { page, status, priority }],
    queryFn: () =>
      getReports({
        page,
        pageSize: 10,
        status: status || undefined,
        priority: priority || undefined,
      }),
  })

  async function act(
    report: ModerationReport,
    action: ModerationActionRequest["action"]
  ) {
    const reason = window.prompt("Reason for action:") || "Policy violation"
    const body: ModerationActionRequest = { action, reason }
    if (action === "ban_user_temp") {
      const daysStr = window.prompt("Ban duration (days):", "7")
      const days = daysStr ? parseInt(daysStr, 10) : 7
      body.ban_duration_days = Number.isFinite(days) ? days : 7
    }
    await processReport(report.id, body)
    qc.invalidateQueries({ queryKey: ["reports"] })
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Moderation Queue</h1>
          <p className="text-muted-foreground">
            Review and act on community reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 bg-background"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            className="border rounded px-2 py-1 bg-background"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {isLoading && <div>Loading…</div>}
      {isError && (
        <div className="text-red-600">
          {error instanceof Error ? error.message : "Failed to load"}
        </div>
      )}

      <div className="space-y-4">
        {data?.reports?.map((r) => (
          <ReportCard key={r.id} report={r} onAction={act} />
        ))}
      </div>

      {data && (
        <div className="mt-6 flex items-center justify-between">
          <button
            className="border rounded px-3 py-1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <div className="text-sm text-muted-foreground">
            Page {data.page} of {data.total_pages}
          </div>
          <button
            className="border rounded px-3 py-1 disabled:opacity-50"
            disabled={data.page >= data.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function ReportCard({
  report,
  onAction,
}: {
  report: ModerationReport
  onAction: (r: ModerationReport, a: ModerationActionRequest["action"]) => void
}) {
  return (
    <div className="rounded-lg border bg-card/60 backdrop-blur p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {report.content_type.toUpperCase()} •{" "}
            {report.reason.replaceAll("_", " ")}
          </div>
          <div className="mt-1 font-medium">
            Reported by {report.reporter.username} • Against{" "}
            {report.reported_user.username}
          </div>
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {report.content_preview || report.description}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs">
            Status: <span className="uppercase">{report.status}</span>
          </div>
          <div className="text-xs">
            Priority: <span className="uppercase">{report.priority}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => onAction(report, "dismiss")}
        >
          Dismiss
        </button>
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => onAction(report, "warn_user")}
        >
          Warn
        </button>
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => onAction(report, "hide_content")}
        >
          Hide
        </button>
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => onAction(report, "delete_content")}
        >
          Delete
        </button>
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => onAction(report, "ban_user_temp")}
        >
          Temp Ban
        </button>
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => onAction(report, "ban_user_permanent")}
        >
          Permaban
        </button>
      </div>
    </div>
  )
}
