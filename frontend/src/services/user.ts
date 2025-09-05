import api from "@/lib/api"

// Types for user dashboard
export type UserStats = {
  threads_created: number
  replies_posted: number
  threads_liked: number
  threads_saved: number
  active_days: number
  streak_days: number
  categories_joined: number
  report_count: number
  karma_points: number
}

export type ThreadPreview = {
  id: string
  title: string
  category: string
  category_slug: string
  replies: number
  created_at: string
  preview: string
  has_new_replies: boolean
  is_locked: boolean
}

export type ReplyPreview = {
  thread_id: string
  thread_title: string
  category: string
  category_slug: string
  replied_at: string
  preview: string
}

export type UserActivity = {
  threads: ThreadPreview[]
  recent_replies: ReplyPreview[]
  saved_threads: ThreadPreview[]
}

export type CategorySubscription = {
  id: string
  name: string
  slug: string
  thread_count: number
  description: string
}

// Get user statistics
export async function getUserStats(): Promise<UserStats> {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.get("/user/stats")
  // return data

  // Mock data for now
  return {
    threads_created: 5,
    replies_posted: 18,
    threads_liked: 12,
    threads_saved: 7,
    active_days: 21,
    streak_days: 4,
    categories_joined: 5,
    report_count: 2,
    karma_points: 45,
  }
}

// Get user activity (threads, replies, saved)
export async function getUserActivity(): Promise<UserActivity> {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.get("/user/activity")
  // return data

  // Mock data for now
  return {
    threads: [
      {
        id: "1",
        title: "How I'm managing my anxiety during difficult times",
        category: "Anxiety",
        category_slug: "anxiety",
        replies: 12,
        created_at: "2 days ago",
        preview: "I've found that deep breathing exercises and mindfulness...",
        has_new_replies: true,
        is_locked: false,
      },
      {
        id: "2",
        title: "Work-life balance strategies after burnout",
        category: "Work & Burnout",
        category_slug: "work-burnout",
        replies: 8,
        created_at: "5 days ago",
        preview:
          "After experiencing severe burnout last year, I've implemented...",
        has_new_replies: false,
        is_locked: false,
      },
      {
        id: "3",
        title: "Navigating difficult family relationships",
        category: "Relationships",
        category_slug: "relationships",
        replies: 15,
        created_at: "1 week ago",
        preview:
          "Setting boundaries has been crucial for maintaining my mental health...",
        has_new_replies: true,
        is_locked: false,
      },
    ],
    recent_replies: [
      {
        thread_id: "101",
        thread_title: "Coping with social anxiety",
        category: "Anxiety",
        category_slug: "anxiety",
        replied_at: "3 hours ago",
        preview:
          "I've found that gradual exposure therapy has helped me tremendously...",
      },
      {
        thread_id: "102",
        thread_title: "First steps after depression diagnosis",
        category: "Depression",
        category_slug: "depression",
        replied_at: "1 day ago",
        preview:
          "Getting professional help was the most important first step for me...",
      },
      {
        thread_id: "103",
        thread_title: "Self-care routines that actually work",
        category: "Self-care",
        category_slug: "self-care",
        replied_at: "2 days ago",
        preview:
          "Consistency is key. Start with small habits that you can maintain...",
      },
    ],
    saved_threads: [
      {
        id: "201",
        title: "Resources for affordable therapy options",
        category: "Resources",
        category_slug: "resources",
        replies: 24,
        created_at: "2 weeks ago",
        preview:
          "Here's a comprehensive list of low-cost mental health resources...",
        has_new_replies: true,
        is_locked: false,
      },
      {
        id: "202",
        title: "How to support a loved one with depression",
        category: "Depression",
        category_slug: "depression",
        replies: 19,
        created_at: "3 weeks ago",
        preview: "Understanding that you can't 'fix' them is the first step...",
        has_new_replies: false,
        is_locked: false,
      },
    ],
  }
}

// Get user's subscribed categories
export async function getUserCategories(): Promise<CategorySubscription[]> {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.get("/user/categories")
  // return data

  // Mock data for now
  return [
    {
      id: "1",
      name: "Anxiety",
      slug: "anxiety",
      thread_count: 145,
      description: "Discussions about anxiety management and support",
    },
    {
      id: "2",
      name: "Depression",
      slug: "depression",
      thread_count: 132,
      description: "Support for those dealing with depression",
    },
    {
      id: "3",
      name: "Relationships",
      slug: "relationships",
      thread_count: 98,
      description: "Navigating personal and family relationships",
    },
    {
      id: "4",
      name: "Work & Burnout",
      slug: "work-burnout",
      thread_count: 76,
      description: "Managing stress and burnout in professional life",
    },
    {
      id: "5",
      name: "Self-care",
      slug: "self-care",
      thread_count: 112,
      description: "Practices for maintaining mental wellbeing",
    },
  ]
}

// Get user's notification preferences
export async function getUserNotificationPreferences() {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.get("/user/preferences/notifications")
  // return data

  // Mock data for now
  return {
    thread_replies: true,
    mentions: true,
    category_updates: false,
    community_announcements: true,
  }
}

// Update user notification preferences
export async function updateUserNotificationPreferences(preferences: any) {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.put("/user/preferences/notifications", preferences)
  // return data

  // Mock successful response
  return { success: true }
}

// Get user privacy settings
export async function getUserPrivacySettings() {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.get("/user/preferences/privacy")
  // return data

  // Mock data for now
  return {
    show_active_status: true,
    allow_direct_messages: true,
    content_visibility: "all", // all, categories, none
  }
}

// Update user privacy settings
export async function updateUserPrivacySettings(settings: any) {
  // This will be replaced with an actual API call when the backend is ready
  // const { data } = await api.put("/user/preferences/privacy", settings)
  // return data

  // Mock successful response
  return { success: true }
}
