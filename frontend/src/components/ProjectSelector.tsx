import type { Project } from '../types'

interface ProjectSelectorProps {
  projects: Project[]
  selectedId: number | null
  onChange: (projectId: number | null) => void
}

export default function ProjectSelector({ projects, selectedId, onChange }: ProjectSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] whitespace-nowrap">Project:</label>
      <select
        value={selectedId ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  )
}
