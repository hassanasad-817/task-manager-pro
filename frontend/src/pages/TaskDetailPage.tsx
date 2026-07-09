import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import { tasksApi } from '../services/api'
import type { Task } from '../types'

const statusStyles: Record<string, string> = {
  Todo: 'bg-[#F1F3F4] text-[#5F6368] dark:bg-[#3C4043]/50 dark:text-[#9AA0A6]',
  InProgress: 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]',
  Done: 'bg-[#E6F4EA] text-[#1E8E3E] dark:bg-[#1E8E3E]/20 dark:text-[#81C995]',
}

const priorityStyles: Record<string, string> = {
  Low: 'text-[#1E8E3E] bg-[#E6F4EA] dark:bg-[#1E8E3E]/20 dark:text-[#81C995]',
  Medium: 'text-[#F9AB00] bg-[#FEF7E0] dark:bg-[#F9AB00]/20 dark:text-[#FDD663]',
  High: 'text-[#D93025] bg-[#FCE8E6] dark:bg-[#D93025]/20 dark:text-[#F28B82]',
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
        <div className="h-8 w-48 bg-[#E8EAED] dark:bg-[#3C4043]/30 rounded animate-pulse" />
        <div className="h-32 bg-[#E8EAED] dark:bg-[#3C4043]/30 rounded-xl animate-pulse" />
        <div className="h-48 bg-[#E8EAED] dark:bg-[#3C4043]/30 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!task) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/tasks')} className="text-sm text-[#1A73E8] hover:text-[#1557B0] dark:text-[#8AB4F8] cursor-pointer">
        ← Back to Tasks
      </button>

      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">{task.title}</h2>
            {task.description && (
              <p className="mt-2 text-sm text-[#5F6368] dark:text-[#9AA0A6] whitespace-pre-wrap">{task.description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-[#5F6368] dark:text-[#9AA0A6]">Status: </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[task.status]}`}>
              {task.status === 'InProgress' ? 'In Progress' : task.status}
            </span>
          </div>
          <div>
            <span className="text-[#5F6368] dark:text-[#9AA0A6]">Priority: </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div>
            <span className="text-[#5F6368] dark:text-[#9AA0A6]">Project: </span>
            <span className="font-medium text-[#202124] dark:text-[#E8EAED]">{task.projectName}</span>
          </div>
          {task.dueDate && (
            <div>
              <span className="text-[#5F6368] dark:text-[#9AA0A6]">Due: </span>
              <span className={`font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-[#D93025] dark:text-[#F28B82]' : 'text-[#202124] dark:text-[#E8EAED]'}`}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div>
            <span className="text-[#5F6368] dark:text-[#9AA0A6]">Created: </span>
            <span className="text-[#202124] dark:text-[#E8EAED]">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-6">
        <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] mb-4">Comments</h3>

        <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-sm border border-[#DADCE0] dark:border-[#3C4043] rounded-lg bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || sendingComment}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1A73E8] rounded-lg hover:bg-[#1557B0] disabled:opacity-50 cursor-pointer"
          >
            {sendingComment ? '...' : 'Send'}
          </button>
        </form>

        {(!task.comments || task.comments.length === 0) ? (
          <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-[#E8F0FE] dark:bg-[#1A73E8]/20 flex items-center justify-center text-[#1A73E8] dark:text-[#8AB4F8] text-xs font-semibold shrink-0">
                  {c.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">{c.author}</span>
                    <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-0.5 text-[#5F6368] dark:text-[#9AA0A6]">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
