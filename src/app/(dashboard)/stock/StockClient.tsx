'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Archive, Save, Loader2 } from 'lucide-react'
import { DatePicker } from './DatePicker'
import { CylinderStockEntry, updateBulkStock } from './actions'

type Props = {
  shopId: string
  date: string
  initialData: CylinderStockEntry[]
}

export function StockClient({ shopId, date, initialData }: Props) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleUpdate = (index: number, field: 'empty_count' | 'full_count', value: string) => {
    const val = parseInt(value, 10) || 0
    const newData = [...data]
    newData[index] = { ...newData[index], [field]: val }
    setData(newData)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setLoading(true)
    const updates = data.map(item => ({
      brandId: item.brand_id,
      sizeId: item.size_id,
      emptyCount: item.empty_count,
      fullCount: item.full_count
    }))
    
    await updateBulkStock(shopId, date, updates)
    setLoading(false)
    setHasChanges(false)
  }

  // Group by Brand
  const groupedStock = data.reduce((acc, current) => {
    if (!acc[current.brand_name]) acc[current.brand_name] = []
    acc[current.brand_name].push(current)
    return acc
  }, {} as Record<string, typeof data>)

  const totalEmpty = data.reduce((sum, item) => sum + item.empty_count, 0)
  const totalFull = data.reduce((sum, item) => sum + item.full_count, 0)

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Stock Management</span>
            <span>›</span>
            <span className="font-medium text-gray-900">Cylinder Inventory</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Cylinder Stock</h2>
          <p className="text-gray-500 mt-2">
            Manage opening stock and monitor daily cylinder levels across brands.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DatePicker date={date} shopId={shopId} />
          <Button 
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="bg-blue-900 hover:bg-blue-800 text-white shadow-md rounded-xl px-6 min-w-[180px]"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {hasChanges ? 'Save Changes' : 'Update Opening Stock'}
          </Button>
        </div>
      </header>

      <div className="space-y-12">
        {Object.entries(groupedStock).map(([brandName, cylinders]) => (
          <div key={brandName}>
            <div className="flex items-center justify-center mb-6 relative">
              <hr className="w-full absolute border-gray-200" />
              <span className="bg-gray-100 flex items-center gap-2 text-gray-700 font-bold px-4 py-1 rounded-full text-xs tracking-widest z-10">
                <Archive className="w-3 h-3" />
                {brandName.toUpperCase()}
              </span>
            </div>

            <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4 w-1/4">Cylinder Size</th>
                      <th className="px-6 py-4 text-center w-1/4">Empty (Returnable)</th>
                      <th className="px-6 py-4 text-center w-1/4">Full (Sellable)</th>
                      <th className="px-6 py-4 text-right w-1/4">Total Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cylinders.map((cyl) => {
                        const originalIndex = data.findIndex(d => d.brand_id === cyl.brand_id && d.size_id === cyl.size_id)
                        return (
                      <tr key={cyl.size_id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-6 font-bold text-gray-900 flex items-center gap-3">
                          <div className="bg-gray-100 p-2 text-gray-400 rounded-lg">
                            <Archive className="w-4 h-4" />
                          </div>
                          {cyl.label || `${cyl.size_kg} KG`}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="flex flex-col items-center gap-2">
                             <Input 
                                type="number" 
                                value={cyl.empty_count} 
                                onChange={(e) => handleUpdate(originalIndex, 'empty_count', e.target.value)}
                                className="w-20 text-center font-bold text-lg bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100"
                             />
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Reserved</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="flex flex-col items-center gap-2">
                             <Input 
                                type="number" 
                                value={cyl.full_count} 
                                onChange={(e) => handleUpdate(originalIndex, 'full_count', e.target.value)}
                                className="w-24 text-center font-bold text-xl bg-green-50 text-green-700 border-none rounded-xl focus:ring-2 focus:ring-green-100 py-6"
                             />
                            <span className="text-[10px] text-green-600 font-bold tracking-widest uppercase">Ready For Sale</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <div className="flex flex-col items-end">
                            <span className="text-xl font-bold text-gray-900">{cyl.empty_count + cyl.full_count}</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Combined Units</span>
                           </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="bg-gray-100 border-none shadow-none rounded-2xl mt-8">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-200/50 p-4 rounded-xl text-blue-900">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Inventory Snapshot</h4>
              <p className="text-sm text-gray-500">Combined values across all listed brands and sizes.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Empty</p>
              <p className="text-3xl font-bold text-gray-900">{totalEmpty}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Total Full</p>
              <p className="text-3xl font-bold text-green-600">{totalFull}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
