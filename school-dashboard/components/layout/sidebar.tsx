"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign,
  Settings,
  LogOut
} from "lucide-react"

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "Parents", href: "/parents", icon: Users, badge: null },
  { name: "Students", href: "/students", icon: GraduationCap, badge: "12" },
  { name: "Classes", href: "/classes", icon: BookOpen, badge: null },
  { name: "Finance", href: "/finance", icon: DollarSign, badge: "3" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-emerald-900 to-slate-900 text-white">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Image src="/dugsi.svg" alt="Dugsi Logo" width={60} height={60} />
          <div>
            <span className="text-xl font-bold text-white">معهد دار الوحي</span>
            <p className="text-xs text-slate-400">Machad Darul Waxyi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-600 text-slate-300 group-hover:bg-slate-500"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <Link href="/settings" className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors">
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
