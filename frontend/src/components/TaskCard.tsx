import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const statusColors: Record<string, string> = {
  Todo: 'bg-[#F1F3F4] text-[#5F6368] dark:bg-[#3C4043]/50 dark:text-[#9AA0A6]',
  InProgress: 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]',
  Done: 'bg-[#E6F4EA] text-[#1E8E3E] dark:bg-[#1E8E3E]/20 dark:text-[#81C995]',
}

const priorityBorder: Record<string, string> = {
  Low: 'border-l-[#1E8E3E]',
  Medium: 'border-l-[#F9AB00]',
  High: 'border-l-[#D93025]',
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <div
      className={`bg-white dark:bg-[#2D2D2D] rounded-lg shadow-sm border border-[#DADCE0] dark:border-[#3C4043] border-l-4 ${
        priorityBorder[task.priority] || 'border-l-[#DADCE0]'
      } p-4 ${isOverdue ? 'bg-[#FCE8E6] dark:bg-[#D93025]/10' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED] truncate">{task.title}</h4>
          {task.description && (
            <p className="mt-1 text-xs text-[#5F6368] dark:text-[#9AA0A6] line-clamp-2">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
              {task.status === 'InProgress' ? 'In Progress' : task.status}
            </span>
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{task.projectName}</span>
            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? 'font-semibold text-[#D93025] dark:text-[#F28B82]' : 'text-[#5F6368] dark:text-[#9AA0A6]'}`}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue!)'}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4 flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
            className="p-1.5 text-[#9AA0A6] hover:text-[#1A73E8] rounded hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/20 cursor-pointer"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task) }}
            className="p-1.5 text-[#9AA0A6] hover:text-[#D93025] rounded hover:bg-[#FCE8E6] dark:hover:bg-[#D93025]/20 cursor-pointer"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
