import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const statusColors: Record<string, string> = {
  Todo: 'bg-gray-100 text-gray-800',
  InProgress: 'bg-blue-100 text-blue-800',
  Done: 'bg-green-100 text-green-800',
}

const priorityColors: Record<string, string> = {
  Low: 'border-l-green-500',
  Medium: 'border-l-yellow-500',
  High: 'border-l-red-500',
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${
        priorityColors[task.priority] || 'border-l-gray-300'
      } p-4 ${isOverdue ? 'bg-red-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h4>
          {task.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
              {task.status === 'InProgress' ? 'In Progress' : task.status}
            </span>
            <span className="text-xs text-gray-500">{task.projectName}</span>
            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue!)'}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4 flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 cursor-pointer"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
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
