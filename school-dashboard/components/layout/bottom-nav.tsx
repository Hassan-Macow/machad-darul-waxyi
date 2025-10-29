"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigation } from "./sidebar"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <ul className="grid grid-cols-5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.name} className="">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 text-xs font-medium",
                  isActive ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-gray-400")} />
                <span className="mt-1.5">{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
