export interface Task {
  id: number
  title: string
  description: string | null
  status: 'Todo' | 'InProgress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  projectId: number
  projectName: string
  projectColor: string
  userId: string
  createdAt: string
  dueDate: string | null
  comments?: Comment[]
}

export interface Comment {
  id: number
  text: string
  author: string
  createdAt: string
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
  description: string | null
  color: string
  taskCount: number
}

export interface AuthResponse {
  token: string
  username: string
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  done: number
  overdue: number
  highPriority: number
}

export interface Activity {
  id: number
  action: string
  description: string | null
  taskId: number | null
  username: string
  createdAt: string
}

export type TaskStatus = 'Todo' | 'InProgress' | 'Done'
export type Priority = 'Low' | 'Medium' | 'High'
