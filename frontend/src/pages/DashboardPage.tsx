import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tasksApi, activityApi } from '../services/api'
import type { TaskStats, Activity, Task } from '../types'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const statusLabels: Record<string, string> = { Todo: 'Todo', InProgress: 'In Progress', Done: 'Done' }

export default function DashboardPage() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [s, a, t] = await Promise.all([
        tasksApi.getStats(),
        activityApi.getRecent(10),
        tasksApi.getAll(),
      ])
      setStats(s)
      setActivities(a)
      setRecentTasks(t.slice(0, 5))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const cards = stats ? [
    { label: 'Total Tasks', value: stats.total, color: '#1A73E8' },
    { label: 'In Progress', value: stats.inProgress, color: '#F9AB00' },
    { label: 'Overdue', value: stats.overdue, color: '#D93025' },
    { label: 'Done', value: stats.done, color: '#1E8E3E' },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#E8EAED] dark:bg-[#3C4043]/30 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#E8EAED] dark:bg-[#3C4043]/30 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-6">
        <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">Welcome back</h2>
        <p className="mt-1 text-sm text-[#5F6368] dark:text-[#9AA0A6]">Here's your project overview</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
              <span className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{card.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-[#202124] dark:text-[#E8EAED]">{card.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-5">
          <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] mb-4">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#202124] dark:text-[#E8EAED] truncate">{task.title}</p>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">{task.projectName}</p>
                  </div>
                  <span className={`shrink-0 ml-3 px-2 py-0.5 rounded text-xs font-medium ${
                    task.status === 'Todo' ? 'bg-[#F1F3F4] text-[#5F6368] dark:bg-[#3C4043]/50 dark:text-[#9AA0A6]' :
                    task.status === 'InProgress' ? 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]' :
                    'bg-[#E6F4EA] text-[#1E8E3E] dark:bg-[#1E8E3E]/20 dark:text-[#81C995]'
                  }`}>
                    {statusLabels[task.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-5">
          <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] mb-4">Recent Activity</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    a.action === 'created' ? 'bg-[#1E8E3E]' :
                    a.action === 'updated' ? 'bg-[#1A73E8]' :
                    a.action === 'deleted' ? 'bg-[#D93025]' :
                    a.action === 'commented' ? 'bg-[#9334E6]' : 'bg-[#9AA0A6]'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-[#202124] dark:text-[#E8EAED]">{a.description}</p>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
                      {a.username} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
