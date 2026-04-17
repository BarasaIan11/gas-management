'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Store, Plus, Edit, X, Save, Loader2 } from 'lucide-react'
import { Shop, Brand, PriceMatrixEntry } from '@/types/database'
import { addShop, addBrand, updatePrice } from './actions'

type Props = {
  initialData: {
    shops: Shop[]
    brands: Brand[]
    prices: PriceMatrixEntry[]
  }
  currentShopId?: string
}

export function SettingsClient({ initialData, currentShopId }: Props) {
  const data = initialData
  const [showAddShop, setShowAddShop] = useState(false)
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  async function handleAddShop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addShop(formData)
    if (res.success) {
      setShowAddShop(false)
      // We rely on revalidatePath, but locally we could refresh or just wait for server
      window.location.reload()
    }
    setLoading(false)
  }

  async function handleAddBrand(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addBrand(formData)
    if (res.success) {
      setShowAddBrand(false)
      window.location.reload()
    }
    setLoading(false)
  }

  async function handleUpdatePrice(priceId: string) {
    setLoading(true)
    const res = await updatePrice(priceId, tempPrice)
    if (res.success) {
      setEditingPriceId(null)
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shops Section */}
        <Card className="bg-gray-50 border-none shadow-none rounded-2xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Shops & Outlets</CardTitle>
              <CardDescription>Configure physical storefronts</CardDescription>
            </div>
            <Button 
                onClick={() => setShowAddShop(!showAddShop)}
                className="bg-blue-900 hover:bg-blue-800 text-white gap-2 rounded-lg"
            >
              {showAddShop ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddShop ? 'Cancel' : 'Add Shop'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddShop && (
                <form onSubmit={handleAddShop} className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm space-y-3 mb-4 animate-in fade-in slide-in-from-top-2">
                    <Input name="name" placeholder="Shop Name (e.g. Garden City)" required />
                    <Input name="location" placeholder="Location/Street" />
                    <Button type="submit" disabled={loading} className="w-full bg-blue-900">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save New Shop'}
                    </Button>
                </form>
            )}

            {data.shops.map((shop) => (
              <div key={shop.id} className="bg-white p-4 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-900">
                        <Store className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{shop.name}</h4>
                        <p className="text-xs text-gray-500">{shop.location || 'No location provided'}</p>
                    </div>
                </div>
                <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    ID: {shop.id.slice(0,4)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Brands Section */}
        <Card className="bg-gray-50 border-none shadow-none rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Product Brands</CardTitle>
            <Button 
                variant="ghost" 
                onClick={() => setShowAddBrand(!showAddBrand)}
                className="bg-white hover:bg-gray-100 shadow-sm px-3 rounded-lg"
            >
              {showAddBrand ? <X className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4 text-gray-600" />}
            </Button>
          </CardHeader>
          <CardContent>
            {showAddBrand && (
                <form onSubmit={handleAddBrand} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3 mb-6">
                    <Input name="name" placeholder="Brand Name (e.g. TotalEnergies)" required />
                    <Button type="submit" disabled={loading} className="w-full bg-blue-900">
                        Add Brand
                    </Button>
                </form>
            )}
            <div className="flex flex-wrap gap-3">
              {data.brands.map((brand) => (
                <Badge 
                  key={brand.id} 
                  variant="secondary" 
                  className="bg-white text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-full font-medium border border-gray-100 shadow-sm"
                >
                  {brand.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Matrix */}
      <Card className="bg-gray-50 border-none shadow-none rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100/50 pb-6 mb-6">
          <div>
            <CardTitle className="text-xl">Pricing Matrix</CardTitle>
            <CardDescription>Global Brand + Size definitions per Shop outlet</CardDescription>
          </div>
          <div className="flex items-center gap-4">
             <select 
                className="bg-white border border-gray-200 text-sm px-4 py-2 rounded-lg font-medium text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
                value={currentShopId}
                onChange={(e) => {
                    const params = new URLSearchParams(window.location.search)
                    params.set('shop', e.target.value)
                    window.location.search = params.toString()
                }}
             >
                {data.shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Sale Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.prices.map((price) => (
                  <tr key={price.id} className="bg-white hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-4 font-semibold text-gray-900 rounded-l-xl">{price.brand_name}</td>
                    <td className="px-4 py-4">
                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {price.label || `${price.size_kg} KG`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                        {editingPriceId === price.id ? (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">KES</span>
                                <Input 
                                    type="number" 
                                    className="w-24 h-8 text-sm font-bold" 
                                    value={tempPrice} 
                                    onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                    autoFocus
                                />
                                <Button size="sm" onClick={() => handleUpdatePrice(price.id)} className="h-8 w-8 p-0 bg-green-600">
                                    <Save className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingPriceId(null)} className="h-8 w-8 p-0">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <p className="font-bold text-blue-900 text-lg">
                                {price.price > 0 ? `KES ${price.price.toLocaleString()}` : 'Not Set'}
                            </p>
                        )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-0.5 rounded-full text-xs font-bold">
                        {price.price > 0 ? 'ACTIVE' : 'INCOMPLETE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right rounded-r-xl">
                      <button 
                        onClick={() => {
                            setEditingPriceId(price.id)
                            setTempPrice(price.price)
                        }}
                        className="text-gray-300 hover:text-blue-900 transition-colors p-2"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
