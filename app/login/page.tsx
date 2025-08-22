'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../stores/authStore'
import { requestFirebaseToken } from '../firebase/initFirebase' // FCM 토큰 요청 함수

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const token = useAuthStore((state) => state.token)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      if (token && username) {
        setAuth({ token, username })
      }
      setHydrated(true)
    }
  }, [setAuth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('로그인 실패. 아이디와 비밀번호를 확인해주세요.')
      }

      const data = await response.json()
      setAuth({ token: data.token, username: data.username })

      
      try {
        const fcmToken = await requestFirebaseToken()
        if (fcmToken) {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/fcm-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({ fcmToken }),
          })
          console.log('FCM 토큰 등록 완료')
        }
      } catch (err) {
        console.error('FCM 토큰 등록 실패', err)
      }

      router.push('/chatrooms')
    } catch (err: any) {
      setError(err.message || '로그인 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) return <div>로딩 중...</div>

  if (token) {
    router.push('/chatrooms')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="bg-white text-black p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <p className="text-sm text-center mt-4">
          계정이 없으신가요?{' '}
          <span
            className="text-blue-500 cursor-pointer underline"
            onClick={() => router.push('/register')}
          >
            회원가입
          </span>
        </p>
      </form>
    </div>
  )
}
