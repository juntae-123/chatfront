'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../stores/authStore'

type ChatRoomResponse = { id: number; name: string; participantCount: number }

export default function ChatRoomsPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const [rooms, setRooms] = useState<ChatRoomResponse[]>([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatrooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Error ${res.status}: ${text || res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        setRooms(data)
        setError(null)
      })
      .catch((e) => {
        console.error('Failed to fetch chat rooms:', e)
        setError('채팅방 목록을 불러오는데 실패했습니다.')
      })
  }, [token])

  const createRoom = async () => {
    if (!newName.trim() || !token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Error ${res.status}: ${text || res.statusText}`)
      }

      const room = await res.json()
      setRooms((prev) => [...prev, room])
      setNewName('')
      setError(null)
    } catch (e) {
      console.error('Failed to create chat room:', e)
      setError('채팅방 생성에 실패했습니다.')
    }
  }

  const deleteRoom = async (id: number) => {
    if (!token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatrooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Error ${res.status}: ${text || res.statusText}`)
      }

      setRooms((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      console.error('Failed to delete chat room:', e)
      setError('채팅방 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-4">채팅방</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="p-2 rounded text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring focus:ring-gray-500"
          placeholder="새 방 이름"
        />
        <button
          onClick={createRoom}
          className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          생성
        </button>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <ul className="space-y-2">
        {rooms.map((r) => (
          <li
            key={r.id}
            className="flex justify-between items-center p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition"
          >
            <div onClick={() => router.push(`/chatrooms/${r.id}`)}>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-gray-400">참여자: {r.participantCount}</div>
            </div>
            <button
              onClick={() => deleteRoom(r.id)}
              className="ml-4 !bg-gray-700 text-white px-2 py-1 rounded hover:!bg-gray-600 transition"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
