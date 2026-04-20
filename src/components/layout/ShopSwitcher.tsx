'use client'

import { Shop } from '@/types/database'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

export function ShopSwitcher({ shops }: { shops: Shop[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const currentShopId = searchParams.get('shop') || 'ALL'

  const handleShopChange = (v: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (v === 'ALL' || !v) {
      params.set('shop', 'ALL')
    } else {
      params.set('shop', v)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const activeShop = shops.find(s => s.id === currentShopId)

  return (
    <Select value={currentShopId || 'ALL'} onValueChange={handleShopChange}>
      <SelectTrigger className="w-full bg-gray-100 border-none justify-between pl-3 pr-2 py-6 rounded-xl hover:bg-gray-200 transition-colors">
        <div className="flex items-center gap-2 max-w-[180px]">
          <div className="shrink-0 w-2 h-2 rounded-full bg-green-500" />
          <div className="truncate text-sm font-bold text-gray-900">
            {activeShop?.name || (currentShopId === 'ALL' ? 'All Shops' : 'Unknown')}
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Shops (Overview)</SelectItem>
        {shops.map((shop) => (
          <SelectItem key={shop.id} value={shop.id}>
            {shop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
