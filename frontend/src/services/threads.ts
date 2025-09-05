import api from "@/lib/api"
import type {
  Thread,
  ThreadListResponse,
  CreateThreadRequest,
  UpdateThreadRequest,
  Reply,
  ReplyListResponse,
  CreateReplyRequest,
} from "@/types/api"

// Thread APIs
export async function createThread(data: CreateThreadRequest) {
  const res = await api.post<Thread>("/threads", data)
  return res.data
}

export async function getThread(id: string) {
  const res = await api.get<Thread>(`/threads/${id}`)
  return res.data
}

export async function updateThread(id: string, data: UpdateThreadRequest) {
  const res = await api.put<Thread>(`/threads/${id}`, data)
  return res.data
}

export async function deleteThread(id: string) {
  const res = await api.delete<{ success: boolean; message: string }>(
    `/threads/${id}`
  )
  return res.data
}

export async function listThreads(params?: {
  category_id?: string
  page?: number
  page_size?: number
  sort?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.category_id) searchParams.set("category_id", params.category_id)
  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.page_size)
    searchParams.set("page_size", params.page_size.toString())
  if (params?.sort) searchParams.set("sort", params.sort)

  const res = await api.get<ThreadListResponse>(
    `/threads${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
  )
  return res.data
}

// Reply APIs
export async function createReply(threadId: string, data: CreateReplyRequest) {
  const res = await api.post<Reply>(`/threads/${threadId}/replies`, data)
  return res.data
}

export async function listReplies(
  threadId: string,
  params?: {
    page?: number
    page_size?: number
    sort?: string
  }
) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.page_size)
    searchParams.set("page_size", params.page_size.toString())
  if (params?.sort) searchParams.set("sort", params.sort)

  const res = await api.get<ReplyListResponse>(
    `/threads/${threadId}/replies${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`
  )
  return res.data
}
