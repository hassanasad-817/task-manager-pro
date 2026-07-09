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
    { label: 'Total Tasks', value: stats.total, color: 'bg-blue-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' },
    { label: 'Done', value: stats.done, color: 'bg-green-500' },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.h2 variants={item} className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </motion.h2>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${card.color}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{task.projectName}</p>
                  </div>
                  <span className={`shrink-0 ml-3 px-2 py-0.5 rounded text-xs font-medium ${
                    task.status === 'Todo' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                    task.status === 'InProgress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {statusLabels[task.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    a.action === 'created' ? 'bg-green-500' :
                    a.action === 'updated' ? 'bg-blue-500' :
                    a.action === 'deleted' ? 'bg-red-500' :
                    a.action === 'commented' ? 'bg-purple-500' : 'bg-gray-400'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-gray-700 dark:text-gray-300">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
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
