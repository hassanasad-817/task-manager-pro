import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import { tasksApi } from '../services/api'
import type { Task } from '../types'

const statusColors: Record<string, string> = {
  Todo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  InProgress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const priorityColors: Record<string, string> = {
  Low: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  Medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  High: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const fetchTask = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      setTask(await tasksApi.getById(Number(id)))
    } catch {
      toast.error('Failed to load task')
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchTask() }, [fetchTask])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !commentText.trim()) return
    setSendingComment(true)
    try {
      const updated = await tasksApi.addComment(Number(id), commentText.trim())
      setTask(updated)
      setCommentText('')
      toast.success('Comment added')
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) toast.error(err.response.data.error)
      else toast.error('Failed to add comment')
    } finally {
      setSendingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!task) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer">
        ← Back to Tasks
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
            {task.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{task.description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status: </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status === 'InProgress' ? 'In Progress' : task.status}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Priority: </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Project: </span>
            <span className="font-medium text-gray-900 dark:text-white">{task.projectName}</span>
          </div>
          {task.dueDate && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Due: </span>
              <span className={`font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500 dark:text-gray-400">Created: </span>
            <span className="text-gray-900 dark:text-white">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments</h3>

        <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || sendingComment}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {sendingComment ? '...' : 'Send'}
          </button>
        </form>

        {(!task.comments || task.comments.length === 0) ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-semibold shrink-0">
                  {c.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{c.author}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-0.5 text-gray-600 dark:text-gray-400">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
