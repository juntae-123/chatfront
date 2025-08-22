'use client'

import './globals.css' // ✅ Tailwind 적용
import Link from 'next/link'
import { useAuthStore } from './stores/authStore'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <html lang="ko">
      <body className="bg-black text-white min-h-screen">
        {token && (
          <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
            <Link href="/chatrooms" className="text-xl font-bold">
              🗨️ ChatApp
            </Link>
            <div className="flex gap-4">
              <Link href="/mypage" className="hover:underline">
                마이페이지
              </Link>
              <button onClick={handleLogout} className="hover:underline">
                로그아웃
              </button>
            </div>
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
