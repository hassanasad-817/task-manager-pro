import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { projectsApi, tasksApi } from '../services/api'
import type { Project, Task } from '../types'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [p, t] = await Promise.all([projectsApi.getAll(), tasksApi.getAll()])
      setProjects(p)
      setTasks(t)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id)
          const done = projectTasks.filter((t) => t.status === 'Done').length
          const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0

          return (
            <motion.div key={project.id} variants={item}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{project.taskCount} tasks</span>
                <span>{done} done</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color }} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
