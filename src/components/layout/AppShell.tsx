'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShopSwitcher } from './ShopSwitcher'
import {
  LayoutDashboard,
  ReceiptText,
  Archive,
  Wrench,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'

import { Shop } from '@/types/database'
import { useSearchParams } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sales', href: '/sales', icon: ReceiptText },
  { name: 'Stock', href: '/stock', icon: Archive },
  { name: 'Accessories', href: '/accessories', icon: Wrench },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppShell({ children, shops }: { children: React.ReactNode, shops: Shop[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentShopId = searchParams.get('shop') || shops[0]?.id
  const currentShop = shops.find(s => s.id === currentShopId) || shops[0]

  return (
    <div className="flex h-screen w-full bg-gray-50 border-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-gray-50">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-900">HesbornONE</h1>
          <p className="text-xs text-gray-500">Investment Limited</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-blue-900 shadow-sm border border-gray-100 border-l-4 border-l-blue-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-900' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="mb-6 px-2">
            <ShopSwitcher shops={shops} />
          </div>

          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              Support
            </button>
            <form action={logout} className="w-full">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                Logout
              </button>
            </form>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-2 py-2 flex justify-between items-center z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
                isActive ? 'text-blue-900 bg-blue-50' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
