'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'

export default function NewChatRoomPage() {
  const [title, setTitle] = useState('')
  const router = useRouter()
  const { token } = useAuthStore()

  const handleCreateRoom = async () => {
    if (!title.trim()) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) throw new Error('채팅방 생성 실패')

      router.push('/chatrooms')
    } catch (err) {
      alert('채팅방 생성 중 오류 발생')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-6">새 채팅방 만들기</h1>

      <input
        type="text"
        placeholder="채팅방 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full max-w-md p-3 mb-4 rounded bg-gray-800 text-white border border-gray-600"
      />

      <button
        onClick={handleCreateRoom}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded"
      >
        생성하기
      </button>
    </div>
  )
}
