import { useState, useEffect } from 'react'
import type { Task, CreateTaskPayload, UpdateTaskPayload, Project } from '../types'

interface TaskFormProps {
  open: boolean
  task: Task | null
  projects: Project[]
  onSave: (data: CreateTaskPayload | UpdateTaskPayload) => void
  onClose: () => void
}

type FormData = {
  title: string
  description: string
  status: 'Todo' | 'InProgress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  projectId: number
  dueDate: string
}

const emptyForm: FormData = {
  title: '',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  projectId: 0,
  dueDate: '',
}

export default function TaskForm({ open, task, projects, onSave, onClose }: TaskFormProps) {
  const [form, setForm] = useState<FormData>(emptyForm)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      })
    } else {
      setForm({ ...emptyForm, projectId: projects[0]?.id ?? 0 })
    }
  }, [task, projects])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
      dueDate: form.dueDate || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-xl border border-[#DADCE0] dark:border-[#3C4043] p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED]">
          {task ? 'Edit Task' : 'New Task'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FormData['status'] })}
                className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
              >
                <option value="Todo">Todo</option>
                <option value="InProgress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as FormData['priority'] })}
                className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Project</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: Number(e.target.value) })}
              className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#5F6368] bg-[#F1F3F4] dark:bg-[#3C4043]/30 dark:text-[#9AA0A6] rounded-lg hover:bg-[#E8EAED] dark:hover:bg-[#3C4043]/50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#1A73E8] rounded-lg hover:bg-[#1557B0] cursor-pointer"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
