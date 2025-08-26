'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useState, useRef, useEffect } from 'react'
import { useChatWebSocket, ChatRedisMsg } from '../../hooks/useChatWebSocket'
import { requestFirebaseToken, onFirebaseMessage } from '../../firebase/initFirebase'

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()

  const rawId = params?.id
  const id: string = Array.isArray(rawId) ? rawId[0] : rawId || ''
  if (!id) return <div>잘못된 방 ID</div>

  const username = useAuthStore((s) => s.username)
  const token = useAuthStore((s) => s.token)

  const { messages, users, connected, sendMessage } = useChatWebSocket(
    id,
    username,
    {
      getToken: () => token,
      refreshToken: async () => {
        const success = await useAuthStore.getState().refreshAuth()
        return success ? useAuthStore.getState().token : null
      },
    }
  )

  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

 
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  
  useEffect(() => {
    const registerFcm = async () => {
      if (!token || typeof window === 'undefined') return

      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }

      if (Notification.permission !== 'granted') {
        console.warn('FCM: 알림 권한이 거부됨')
        return
      }

      const fcmToken = await requestFirebaseToken()
      if (fcmToken) {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fcm-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fcmToken }),
        })
      }
    }

    registerFcm()

    onFirebaseMessage((payload) => {
      const { title, body } = payload.notification || {}
      if (title && body && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/chat-icon.png' })
      }
    })
  }, [token])

  
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    let iso = timestamp
    if (!timestamp.includes('T')) {
      iso = timestamp.replace(' ', 'T')
    }
    const date = new Date(iso)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
     
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            ← 뒤로가기
          </button>
          <button
            onClick={() => router.push('/chatrooms')}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            목록으로
          </button>
        </div>
        <div>
          참여자 {users.length} {connected ? '(연결됨)' : '(연결중...)'}
        </div>
      </header>

     
      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m: ChatRedisMsg, i: number) => {
          const time = formatTime(m.timestamp)
          const isMine =
            m.type === 'TALK' &&
            m.sender?.trim().toLowerCase() === username?.trim().toLowerCase()

          const prev = i > 0 ? messages[i - 1] : null

         
          const showTime = m.type === 'TALK'

          return (
            <div
              key={i}
              className={`flex w-full ${
                m.type === 'TALK'
                  ? isMine
                    ? 'justify-end'
                    : 'justify-start'
                  : 'justify-center'
              }`}
            >
              <div
                className={`p-3 max-w-[70%] break-words rounded ${
                  m.type === 'TALK'
                    ? isMine
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-800 text-white'
                    : 'text-center italic text-gray-400'
                }`}
              >
                {m.type === 'TALK' ? (
                  <>
                    {!prev || prev.sender !== m.sender ? (
                      <div className="text-sm font-semibold mb-1">{m.sender}</div>
                    ) : null}
                    <div className="flex items-end gap-2">
                      <span>{m.message}</span>
                      {showTime && time && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center gap-2 text-xs italic text-gray-400">
                    <span>{m.message}</span>
                    {time && <span className="text-gray-400">{time}</span>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </main>

      
      <footer className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim() !== '') {
              sendMessage(input)
              setInput('')
            }
          }}
          className="flex-1 p-2 rounded bg-gray-800 text-white"
          placeholder="메시지..."
        />
        <button
          onClick={() => {
            if (input.trim() !== '') {
              sendMessage(input)
              setInput('')
            }
          }}
          className="ml-4 bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
        >
          전송
        </button>
      </footer>
    </div>
  )
}
