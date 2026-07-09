export interface Task {
  id: number
  title: string
  description: string | null
  status: 'Todo' | 'InProgress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  projectId: number
  projectName: string
  createdAt: string
  dueDate: string | null
}

export interface CreateTaskPayload {
  title: string
  description?: string
  status: 'Todo' | 'InProgress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  projectId: number
  dueDate?: string | null
}

export interface UpdateTaskPayload {
  title: string
  description?: string
  status: 'Todo' | 'InProgress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  projectId: number
  dueDate?: string | null
}

export interface Project {
  id: number
  name: string
}

export interface AuthResponse {
  token: string
  username: string
}
