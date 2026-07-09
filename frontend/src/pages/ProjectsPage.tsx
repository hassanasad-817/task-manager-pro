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
        <h2 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#E8EAED] dark:bg-[#3C4043]/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <h2 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">Projects</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id)
          const done = projectTasks.filter((t) => t.status === 'Done').length
          const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0

          return (
            <motion.div key={project.id} variants={item}
              className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                <div>
                  <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED]">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                <span>{project.taskCount} tasks</span>
                <span>{done} done</span>
                <span className="font-medium text-[#202124] dark:text-[#E8EAED]">{pct}%</span>
              </div>
              <div className="mt-2 h-2 bg-[#F1F3F4] dark:bg-[#3C4043]/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color }} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
