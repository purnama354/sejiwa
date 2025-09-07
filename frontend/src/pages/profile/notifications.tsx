import { useEffect, useState } from "react"
import {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from "@/services/user"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Users,
  MessageSquare,
  ListFilter,
  Check,
  AtSign,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

type NotificationPreferences = {
  thread_replies: boolean
  mentions: boolean
  category_updates: boolean
  community_announcements: boolean
}

export default function NotificationSettings() {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    thread_replies: true,
    mentions: true,
    category_updates: false,
    community_announcements: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getUserNotificationPreferences()
        setPreferences(data as NotificationPreferences)
      } catch (error) {
        console.error("Failed to load notification preferences:", error)
      }
    }

    fetchPreferences()
  }, [])

  const handleChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUserNotificationPreferences(preferences)
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
    } catch (error) {
      console.error("Failed to save notification preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const notificationSettings = [
    {
      key: "thread_replies" as const,
      label: "Thread replies",
      description: "Get notified when someone replies to your threads",
      icon: MessageSquare,
    },
    {
      key: "mentions" as const,
      label: "Mentions",
      description:
        "Get notified when someone mentions you in a thread or reply",
      icon: AtSign,
    },
    {
      key: "category_updates" as const,
      label: "Category updates",
      description: "Get notified about updates in categories you've joined",
      icon: ListFilter,
    },
    {
      key: "community_announcements" as const,
      label: "Community announcements",
      description: "Important updates about the platform and community",
      icon: Users,
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
          Notification Settings
        </h1>
        <p className="text-slate-600">
          Choose which notifications you want to receive.
        </p>
      </div>

      <div className="space-y-4">
        {notificationSettings.map((setting) => {
          const Icon = setting.icon
          return (
            <div
              key={setting.key}
              className="rounded-lg border border-slate-200 p-5 bg-white/80"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Icon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">
                    {setting.label}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {setting.description}
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences[setting.key]}
                      onChange={(e) =>
                        handleChange(setting.key, e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )
        })}

        <div className="flex items-center justify-between pt-4">
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
