export default function AdminSettings() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Basic placeholders for future configuration.</p>
      </div>
      <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow">
        <h2 className="font-semibold text-slate-900 mb-2">Moderation</h2>
        <p className="text-sm text-slate-600">Coming soon: thresholds, automations, and templates.</p>
      </div>
      <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow">
        <h2 className="font-semibold text-slate-900 mb-2">Appearance</h2>
        <p className="text-sm text-slate-600">Coming soon: theme and branding controls.</p>
      </div>
    </div>
  )
}
