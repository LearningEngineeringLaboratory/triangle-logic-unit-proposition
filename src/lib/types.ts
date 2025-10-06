export interface SessionData {
  session_id: string
  user_id: string
  created_at: string
  last_activity: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface RegisterRequestBody {
  name: string
  email: string
}

export interface RegisterResponse {
  user_id: string
  name: string
  email: string
  isNewUser: boolean
}

export interface CreateSessionRequestBody {
  user_id: string
}

export interface CreateSessionResponse {
  session: SessionData
}

export interface RestoreSessionResponse {
  session?: SessionData
  user?: { name: string; email: string; user_id: string }
  isReturningUser: boolean
}

export interface Problem {
  problem_id: string
  title: string
  argument: string
  total_steps: number
  completed_steps?: number
}

