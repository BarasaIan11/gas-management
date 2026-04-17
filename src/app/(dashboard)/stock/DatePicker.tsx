'use client'

import { Calendar as CalendarIcon } from 'lucide-react'

export function DatePicker({ date, shopId }: { date: string; shopId?: string }) {
  return (
    <div className="bg-white border text-gray-600 rounded-lg flex items-center px-3 py-2 shadow-sm">
      <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
      <form>
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="bg-transparent border-none outline-none text-sm font-medium"
          onChange={(e) => {
            if (e.target.form) e.target.form.submit()
          }}
        />
        {shopId && <input type="hidden" name="shop" value={shopId} />}
      </form>
    </div>
  )
}
