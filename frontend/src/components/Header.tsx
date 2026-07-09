import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

function Avatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  )
}

export default function Header() {
  const { username, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#DADCE0] dark:bg-[#2D2D2D]/80 dark:border-[#3C4043]">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="md:hidden">
          <h1 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">Task Manager</h1>
        </div>
        <div className="flex-1 md:flex-none" />
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]/30 cursor-pointer"
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="p-2 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]/30 cursor-pointer md:hidden"
            title="Tasks"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-[#DADCE0] dark:border-[#3C4043]">
            <Avatar name={username || 'U'} />
            <span className="text-sm font-medium text-[#202124] dark:text-[#E8EAED] hidden sm:block">{username}</span>
            <button
              onClick={logout}
              className="text-sm text-[#5F6368] hover:text-[#D93025] dark:text-[#9AA0A6] dark:hover:text-[#F28B82] cursor-pointer ml-1"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
