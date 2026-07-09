import axios from 'axios'
import type { Task, CreateTaskPayload, UpdateTaskPayload, Project, AuthResponse } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data),
  register: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, password }).then((r) => r.data),
}

export const tasksApi = {
  getAll: (params?: { projectId?: number; status?: string; priority?: string }) =>
    api.get<Task[]>('/tasks', { params }).then((r) => r.data),
  getById: (id: number) =>
    api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (data: CreateTaskPayload) =>
    api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: number, data: UpdateTaskPayload) =>
    api.put(`/tasks/${id}`, data),
  delete: (id: number) =>
    api.delete(`/tasks/${id}`),
}

export const projectsApi = {
  getAll: () =>
    api.get<Project[]>('/projects').then((r) => r.data),
}
