import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { tasksApi, projectsApi } from '../services/api'
import type { Task, Project, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '../types'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import ProjectSelector from '../components/ProjectSelector'
import ConfirmDialog from '../components/ConfirmDialog'
import KanbanColumn from '../components/KanbanColumn'
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const statusLabels: Record<TaskStatus, string> = {
  Todo: 'To Do',
  InProgress: 'In Progress',
  Done: 'Done',
}

const statusColors: Record<TaskStatus, string> = {
  Todo: '#6B7280',
  InProgress: '#3B82F6',
  Done: '#10B981',
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'due' | 'priority'>('newest')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [activeDrag, setActiveDrag] = useState<Task | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await tasksApi.getAll({
        projectId: selectedProject ?? undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
      })
      setTasks(data)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, statusFilter, priorityFilter, search])

  const fetchProjects = useCallback(async () => {
    try {
      setProjects(await projectsApi.getAll())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { fetchTasks() }, [fetchTasks])

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchTasks(), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const sortedTasks = useMemo(() => {
    const t = [...tasks]
    switch (sort) {
      case 'oldest': return t.reverse()
      case 'due': return t.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
      case 'priority': {
        const rank = { High: 0, Medium: 1, Low: 2 }
        return t.sort((a, b) => rank[a.priority] - rank[b.priority])
      }
      default: return t
    }
  }, [tasks, sort])

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { Todo: [], InProgress: [], Done: [] }
    for (const t of tasks) map[t.status].push(t)
    return map
  }, [tasks])

  const handleSave = async (data: CreateTaskPayload | UpdateTaskPayload) => {
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, data as UpdateTaskPayload)
        toast.success('Task updated')
      } else {
        await tasksApi.create(data as CreateTaskPayload)
        toast.success('Task created')
      }
      setFormOpen(false)
      setEditingTask(null)
      fetchTasks()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) setError(err.response.data.error)
      else if (err instanceof Error) setError(err.message)
      else setError('Failed to save task')
      toast.error('Failed to save task')
    }
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    try {
      await tasksApi.delete(deletingTask.id)
      setDeletingTask(null)
      toast.success('Task deleted')
      fetchTasks()
    } catch {
      setError('Failed to delete task')
      toast.error('Failed to delete task')
    }
  }

  const handleQuickStatus = async (task: Task) => {
    const next: Record<TaskStatus, TaskStatus> = { Todo: 'InProgress', InProgress: 'Done', Done: 'Todo' }
    try {
      await tasksApi.update(task.id, { title: task.title, description: task.description ?? undefined, status: next[task.status], priority: task.priority, projectId: task.projectId })
      toast.success(`Moved to ${statusLabels[next[task.status]]}`)
      fetchTasks()
    } catch { toast.error('Failed to update') }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      await Promise.all([...selectedIds].map((id) => tasksApi.delete(id)))
      toast.success(`${selectedIds.size} tasks deleted`)
      setSelectedIds(new Set())
      fetchTasks()
    } catch { toast.error('Bulk delete failed') }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDrag(null)
    const { active, over } = event
    if (!over || !over.id) return
    const taskId = Number(active.id)
    const columnId = over.id as TaskStatus
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === columnId) return
    try {
      await tasksApi.update(taskId, { title: task.title, description: task.description ?? undefined, status: columnId, priority: task.priority, projectId: task.projectId })
      toast.success(`Moved to ${statusLabels[columnId]}`)
      fetchTasks()
    } catch { toast.error('Failed to move task') }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mr-auto">Tasks</h2>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >List</button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${view === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >Kanban</button>
        </div>
        <button
          onClick={() => { setEditingTask(null); setFormOpen(true) }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
        >+ New Task</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <ProjectSelector projects={projects} selectedId={selectedProject} onChange={setSelectedProject} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="due">Due Date</option>
          <option value="priority">Priority</option>
        </select>
        {selectedIds.size > 0 && (
          <button onClick={handleBulkDelete}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 cursor-pointer">
            Delete {selectedIds.size}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
          {error}
          <button onClick={fetchTasks} className="ml-2 underline cursor-pointer">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : view === 'list' ? (
        sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            <button onClick={() => { setEditingTask(null); setFormOpen(true) }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Create your first task</button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task: Task) => (
              <div key={task.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(task.id)}
                  onChange={() => toggleSelect(task.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shrink-0"
                />
                <Link to={`/tasks/${task.id}`} className="flex-1 min-w-0">
                  <TaskCard task={task} onEdit={(t) => { setEditingTask(t); setFormOpen(true) }} onDelete={setDeletingTask} />
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); handleQuickStatus(task) }}
                  className="shrink-0 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  title="Quick status change"
                >
                  {task.status === 'Todo' ? '→ In Progress' : task.status === 'InProgress' ? '→ Done' : '→ Todo'}
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <DndContext onDragStart={(e: DragStartEvent) => setActiveDrag(tasks.find((t) => t.id === Number(e.active.id)) || null)} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Todo', 'InProgress', 'Done'] as TaskStatus[]).map((status) => (
              <SortableContext key={status} items={grouped[status].map((t: Task) => t.id.toString())} strategy={verticalListSortingStrategy}>
                <KanbanColumn
                  status={status}
                  label={statusLabels[status]}
                  color={statusColors[status]}
                  tasks={grouped[status]}
                  onEdit={(t) => { setEditingTask(t); setFormOpen(true) }}
                  onDelete={setDeletingTask}
                />
              </SortableContext>
            ))}
          </div>
          <DragOverlay>
            {activeDrag ? <div className="opacity-80"><TaskCard task={activeDrag} onEdit={() => {}} onDelete={() => {}} /></div> : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskForm open={formOpen} task={editingTask} projects={projects} onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditingTask(null) }} />
      <ConfirmDialog open={!!deletingTask} title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        onConfirm={handleDelete} onCancel={() => setDeletingTask(null)} />
    </motion.div>
  )
}
