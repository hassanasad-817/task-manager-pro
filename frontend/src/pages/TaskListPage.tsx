import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { tasksApi, projectsApi } from '../services/api'
import type { Task, Project, CreateTaskPayload, UpdateTaskPayload } from '../types'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import ProjectSelector from '../components/ProjectSelector'
import ConfirmDialog from '../components/ConfirmDialog'

export default function TaskListPage() {
  const { username, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await tasksApi.getAll({
        projectId: selectedProject ?? undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      })
      setTasks(data)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, statusFilter, priorityFilter])

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch {
      console.error('Failed to load projects')
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleSave = async (data: CreateTaskPayload | UpdateTaskPayload) => {
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, data as UpdateTaskPayload)
      } else {
        await tasksApi.create(data as CreateTaskPayload)
      }
      setFormOpen(false)
      setEditingTask(null)
      fetchTasks()
    } catch {
      setError('Failed to save task')
    }
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    try {
      await tasksApi.delete(deletingTask.id)
      setDeletingTask(null)
      fetchTasks()
    } catch {
      setError('Failed to delete task')
    }
  }

  const openEditForm = (task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const openCreateForm = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Task Manager Pro</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{username}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-600 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <ProjectSelector
            projects={projects}
            selectedId={selectedProject}
            onChange={setSelectedProject}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button
            onClick={openCreateForm}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            + New Task
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
            <button onClick={fetchTasks} className="ml-2 underline cursor-pointer">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found</p>
            <button
              onClick={openCreateForm}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditForm}
                onDelete={setDeletingTask}
              />
            ))}
          </div>
        )}

        <TaskForm
          open={formOpen}
          task={editingTask}
          projects={projects}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditingTask(null) }}
        />

        <ConfirmDialog
          open={!!deletingTask}
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
        />
      </main>
    </div>
  )
}
