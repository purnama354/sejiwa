import { useEffect, useState } from "react"
import {
  getUserPrivacySettings,
  updateUserPrivacySettings,
} from "@/services/user"
import { Button } from "@/components/ui/button"
import {
  Eye,
  EyeOff,
  MessageSquare,
  ChevronLeft,
  Shield,
  Check,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

type PrivacySettings = {
  show_active_status: boolean
  allow_direct_messages: boolean
  content_visibility: "all" | "categories" | "none"
}

export default function PrivacySettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<PrivacySettings>({
    show_active_status: true,
    allow_direct_messages: true,
    content_visibility: "all",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getUserPrivacySettings()
        setSettings(data as PrivacySettings)
      } catch (error) {
        console.error("Failed to load privacy settings:", error)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (key: keyof PrivacySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUserPrivacySettings(settings)
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
    } catch (error) {
      console.error("Failed to save privacy settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const contentVisibilityOptions = [
    {
      value: "all",
      label: "Everyone can see my content",
      description: "Your threads and replies are visible to all users",
    },
    {
      value: "categories",
      label: "Only within categories I join",
      description: "Your content is only visible in categories you've joined",
    },
    {
      value: "none",
      label: "Hidden from profiles",
      description:
        "Your content is still in threads but not linked to your profile",
    },
  ]

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Privacy Settings
        </h1>
        <p className="text-slate-600">
          Control how your information is shared and who can interact with you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Visibility */}
        <div className="rounded-lg border border-slate-200 p-6 bg-white/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {settings.show_active_status ? (
                  <Eye className="w-4 h-4 text-blue-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                )}
                <h2 className="text-lg font-medium">Online Status</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Control whether other users can see when you're active on the
                platform.
              </p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_active_status}
                  onChange={(e) =>
                    handleChange("show_active_status", e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4"
                />
                <span>Show when I'm active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Direct Messages */}
        <div className="rounded-lg border border-slate-200 p-6 bg-white/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <h2 className="text-lg font-medium">Direct Messages</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Choose who can send you direct messages on the platform.
              </p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_direct_messages}
                  onChange={(e) =>
                    handleChange("allow_direct_messages", e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4"
                />
                <span>Allow direct messages</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content Visibility */}
        <div className="rounded-lg border border-slate-200 p-6 bg-white/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <h2 className="text-lg font-medium">Content Visibility</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Control who can see your threads and replies across the
                platform.
              </p>

              <div className="space-y-3">
                {contentVisibilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      settings.content_visibility === option.value
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="content_visibility"
                      checked={settings.content_visibility === option.value}
                      onChange={() =>
                        handleChange("content_visibility", option.value)
                      }
                      className="mt-1 rounded-full border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {showSaveMessage && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="w-4 h-4 mr-1" />
                Settings saved successfully
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
