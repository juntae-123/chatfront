'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">🗨️ 실시간 채팅앱</h1>
      <p className="mb-12 text-center max-w-md">
        Next.js + Spring Boot 기반 실시간 채팅앱~~~
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-300 transition"
        >
          로그인
        </button>
        <button
          onClick={() => router.push('/register')}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          회원가입
        </button>
      </div>
    </div>
  )
}
