'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'next/navigation'

interface UserInfo {
  id: number
  username: string
  createdAt: string
}

export default function MyPage() {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const [user, setUser] = useState<UserInfo | null>(null)
  const router = useRouter()
  const [clientRender, setClientRender] = useState(false)

  useEffect(() => {
    setClientRender(true)

    const fetchUser = async () => {
      if (!token) {
        logout()
        router.push('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:8080/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else if (res.status === 401) {
          logout()
          router.push('/login')
        } else {
          console.error('유저 정보를 불러오지 못했습니다.', res.status)
        }
      } catch (err) {
        console.error('서버 요청 중 오류 발생', err)
        logout()
        router.push('/login')
      }
    }

    fetchUser()
  }, [token, logout, router])

  if (!user) return <div className="p-4">불러오는 중...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">마이페이지</h1>
      <div className="space-y-2">
        <div>아이디: {user.id}</div>
        <div>이름: {user.username}</div>
        
        {clientRender && (
          <div>가입일: {new Date(user.createdAt).toLocaleString()}</div>
        )}
      </div>
    </div>
  )
}
