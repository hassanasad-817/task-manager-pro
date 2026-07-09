interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-xl border border-[#DADCE0] dark:border-[#3C4043] p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED]">{title}</h3>
        <p className="mt-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#5F6368] bg-[#F1F3F4] dark:bg-[#3C4043]/30 dark:text-[#9AA0A6] rounded-lg hover:bg-[#E8EAED] dark:hover:bg-[#3C4043]/50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#D93025] rounded-lg hover:bg-[#B3261E] cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
