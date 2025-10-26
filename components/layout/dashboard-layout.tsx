'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { Bell, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BottomNav } from './bottom-nav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true
    const ensureAuthed = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login')
          return
        }
      } finally {
        if (mounted) setChecking(false)
      }
    }

    ensureAuthed()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/login')
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [router])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f9fb]">
        <div className="text-sm text-gray-500">Checking session…</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f6f9fb]">
      <aside className="hidden md:block h-full">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-100 h-14 md:h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center flex-1 md:max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 w-full border-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg"
              />
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="items-center space-x-3 pl-4 border-l border-gray-100 hidden md:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-transparent pb-20 md:pb-0">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      {/* Bottom navigation for mobile */}
      <BottomNav />
    </div>
  )
}
