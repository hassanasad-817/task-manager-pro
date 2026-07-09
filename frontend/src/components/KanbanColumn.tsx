import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'

interface KanbanColumnProps {
  status: string
  label: string
  color: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function SortableTask({ task, onEdit, onDelete }: { task: Task; onEdit: (t: Task) => void; onDelete: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id.toString() })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const priorityBorder: Record<string, string> = { Low: 'border-l-[#1E8E3E]', Medium: 'border-l-[#F9AB00]', High: 'border-l-[#D93025]' }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`bg-white dark:bg-[#2D2D2D] rounded-lg border border-[#DADCE0] dark:border-[#3C4043] border-l-4 ${priorityBorder[task.priority] || 'border-l-[#DADCE0]'} p-3 shadow-sm cursor-grab active:cursor-grabbing`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[#202124] dark:text-[#E8EAED] truncate">{task.title}</p>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(task) }}
            className="p-1 text-[#9AA0A6] hover:text-[#1A73E8] rounded hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/20 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task) }}
            className="p-1 text-[#9AA0A6] hover:text-[#D93025] rounded hover:bg-[#FCE8E6] dark:hover:bg-[#D93025]/20 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {task.description && <p className="mt-1 text-xs text-[#5F6368] dark:text-[#9AA0A6] line-clamp-1">{task.description}</p>}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          task.priority === 'High' ? 'bg-[#FCE8E6] text-[#D93025] dark:bg-[#D93025]/20 dark:text-[#F28B82]' :
          task.priority === 'Medium' ? 'bg-[#FEF7E0] text-[#F9AB00] dark:bg-[#F9AB00]/20 dark:text-[#FDD663]' :
          'bg-[#E6F4EA] text-[#1E8E3E] dark:bg-[#1E8E3E]/20 dark:text-[#81C995]'
        }`}>{task.priority}</span>
        <span className="text-[10px] text-[#9AA0A6]">{task.projectName}</span>
      </div>
    </div>
  )
}

export default function KanbanColumn({ status, label, color, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div ref={setNodeRef} className={`bg-[#F1F3F4] dark:bg-[#1F1F1F] rounded-xl p-3 min-h-[300px] transition-colors ${isOver ? 'ring-2 ring-[#1A73E8]' : ''}`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold text-[#5F6368] dark:text-[#9AA0A6]">{label}</h3>
          <span className="text-xs text-[#9AA0A6] dark:text-[#5F6368]">({tasks.length})</span>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9AA0A6] dark:text-[#5F6368]">Drop tasks here</div>
        ) : (
          tasks.map((task) => (
            <SortableTask key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  )
}
