import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Check,
} from "lucide-react"
import { getUserProfile, updateUserProfile } from "@/services/user"
import { toast } from "sonner"

type ProfileFormData = {
  current_password?: string
  new_password?: string
  confirm_password?: string
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<
    "account" | "privacy" | "notifications"
  >("account")
  const [formData, setFormData] = useState<ProfileFormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState(false)

  // Fetch user profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!")
      setFormData({})
      setErrors({})
      queryClient.invalidateQueries({ queryKey: ["user-profile"] })
    },
    onError: (
      error: Error & {
        response?: {
          status?: number
          data?: {
            message?: string
            details?: Array<{ field: string; message: string }>
          }
        }
      }
    ) => {
      console.error("Update profile error:", error)

      if (error.response?.status === 400 && error.response?.data?.details) {
        const validationErrors: Record<string, string> = {}
        error.response.data.details.forEach((detail) => {
          validationErrors[detail.field] = detail.message
        })
        setErrors(validationErrors)
      } else {
        toast.error(error.response?.data?.message || "Failed to update profile")
      }
    },
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate passwords
    const newErrors: Record<string, string> = {}

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required"
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required"
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters"
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    updateProfileMutation.mutate({
      current_password: formData.current_password,
      new_password: formData.new_password,
    })
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load profile settings. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-slate-300"></div>
            <h1 className="text-3xl font-bold text-slate-900">
              Profile Settings
            </h1>
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {profile.username}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      profile.role === "admin"
                        ? "destructive"
                        : profile.role === "moderator"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {profile.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-green-700 bg-green-50 border-green-200"
                  >
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${
                          activeTab === tab.id
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Profile Stats */}
            {profile && (
              <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Your Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Threads Created</span>
                    <Badge variant="secondary">
                      {profile.thread_count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Replies Posted</span>
                    <Badge variant="secondary">
                      {profile.reply_count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Member Since</span>
                    <span className="text-sm text-slate-700">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Last Active</span>
                    <span className="text-sm text-slate-700">
                      {new Date(profile.last_active_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {activeTab === "account" && "Account Settings"}
                    {activeTab === "privacy" && "Privacy Settings"}
                    {activeTab === "notifications" && "Notification Settings"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-8">
                  {/* Account Tab */}
                  {activeTab === "account" && (
                    <div className="space-y-8">
                      {/* Account Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Account Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-700">Username</Label>
                            <Input
                              value={profile?.username || ""}
                              disabled
                              className="bg-slate-50 text-slate-600"
                            />
                            <p className="text-sm text-slate-500 mt-1">
                              Username cannot be changed for privacy reasons
                            </p>
                          </div>
                          <div>
                            <Label className="text-slate-700">Role</Label>
                            <Input
                              value={profile?.role || ""}
                              disabled
                              className="bg-slate-50 text-slate-600 capitalize"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Change Password */}
                      <div className="border-t border-slate-200 pt-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Change Password
                        </h3>
                        <form
                          onSubmit={handlePasswordChange}
                          className="space-y-4 max-w-md"
                        >
                          <div>
                            <Label htmlFor="current_password">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="current_password"
                                type={showPasswords ? "text" : "password"}
                                value={formData.current_password || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "current_password",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors.current_password
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showPasswords ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            {errors.current_password && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.current_password}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="new_password">New Password</Label>
                            <Input
                              id="new_password"
                              type={showPasswords ? "text" : "password"}
                              value={formData.new_password || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "new_password",
                                  e.target.value
                                )
                              }
                              className={
                                errors.new_password ? "border-red-500" : ""
                              }
                            />
                            {errors.new_password && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.new_password}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="confirm_password">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirm_password"
                              type={showPasswords ? "text" : "password"}
                              value={formData.confirm_password || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "confirm_password",
                                  e.target.value
                                )
                              }
                              className={
                                errors.confirm_password ? "border-red-500" : ""
                              }
                            />
                            {errors.confirm_password && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.confirm_password}
                              </p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {updateProfileMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Save className="mr-2 h-4 w-4" />
                            Update Password
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Privacy Tab */}
                  {activeTab === "privacy" && (
                    <div className="space-y-6">
                      <div className="text-center py-16">
                        <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          Privacy Settings
                        </h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                          Your privacy is protected by default. All interactions
                          are anonymous, and no personal information is
                          collected or shared.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                          <div className="flex items-center gap-2 text-green-700">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">
                              Anonymous by design
                            </span>
                          </div>
                          <p className="text-green-600 text-sm mt-1">
                            Your username is your only identifier, ensuring
                            complete privacy.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === "notifications" && (
                    <div className="space-y-6">
                      <div className="text-center py-16">
                        <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          Notification Settings
                        </h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                          Notification preferences will be available in a future
                          update. For now, all notifications are handled through
                          the web interface.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Bell className="w-5 h-5" />
                            <span className="font-medium">Coming soon</span>
                          </div>
                          <p className="text-blue-600 text-sm mt-1">
                            Email and push notification settings will be added
                            in future updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
