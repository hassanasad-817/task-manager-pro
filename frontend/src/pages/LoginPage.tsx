import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(username, password)
      } else {
        await login(username, password)
      }
      navigate('/')
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(isRegister ? 'Registration failed' : 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#1F1F1F]">
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043] p-8 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-[#1A73E8]" />
          <h2 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
            Task Manager
          </h2>
        </div>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] text-center">
          {isRegister ? 'Create an account' : 'Sign in to continue'}
        </p>
        {error && (
          <div className="mt-4 p-3 text-sm text-[#D93025] bg-[#FCE8E6] dark:bg-[#D93025]/20 dark:text-[#F28B82] rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#DADCE0] dark:border-[#3C4043] px-3 py-2 text-sm bg-white dark:bg-[#1F1F1F] text-[#202124] dark:text-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-[#1A73E8] rounded-lg hover:bg-[#1557B0] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#5F6368] dark:text-[#9AA0A6]">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-[#1A73E8] hover:text-[#1557B0] font-medium cursor-pointer"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
