'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Store, Plus, Edit, X, Save, Loader2, Trash2, Globe, Scale, Package } from 'lucide-react'
import { Shop, Brand, Size, PriceMatrixEntry, Accessory } from '@/types/database'
import { 
  addShop, updateShop, deleteShop,
  addBrand, deleteBrand,
  addSize, deleteSize,
  addAccessory, deleteAccessory, updateAccessory,
  updatePrice, updateGlobalPrice 
} from './actions'
import { toast } from 'sonner'

type Props = {
  initialData: {
    shops: Shop[]
    brands: Brand[]
    sizes: Size[]
    accessories: Accessory[]
    prices: PriceMatrixEntry[]
  }
  currentShopId?: string
}

export function SettingsClient({ initialData, currentShopId }: Props) {
  const data = initialData
  const [showAddShop, setShowAddShop] = useState(false)
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [showAddSize, setShowAddSize] = useState(false)
  const [showAddAccessory, setShowAddAccessory] = useState(false)
  
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [editingAccessoryId, setEditingAccessoryId] = useState<string | null>(null)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<number>(0)
  const [applyGlobal, setApplyGlobal] = useState(false)
  const [loading, setLoading] = useState(false)

  // --- Handlers ---
  async function handleAddShop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addShop(formData)
    if (res.success) {
      toast.success('Shop added successfully')
      setShowAddShop(false)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to add shop')
    }
    setLoading(false)
  }

  async function handleUpdateShop(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const res = await updateShop(id, name, location)
    if (res.success) {
      toast.success('Shop updated successfully')
      setEditingShopId(null)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to update shop')
    }
    setLoading(false)
  }

  async function handleDeleteShop(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all associated data.`)) return
    setLoading(true)
    const res = await deleteShop(id)
    if (res.success) {
      toast.success('Shop deleted')
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to delete shop')
    }
    setLoading(false)
  }

  async function handleAddBrand(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addBrand(formData)
    if (res.success) {
      toast.success('Brand added')
      setShowAddBrand(false)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to add brand')
    }
    setLoading(false)
  }

  async function handleDeleteBrand(id: string, name: string) {
    if (!confirm(`Delete brand ${name}?`)) return
    const res = await deleteBrand(id)
    if (res.success) {
      toast.success('Brand deleted')
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to delete brand')
    }
  }

  async function handleAddSize(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addSize(formData)
    if (res.success) {
      toast.success('Size added')
      setShowAddSize(false)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to add size')
    }
    setLoading(false)
  }

  async function handleDeleteSize(id: string, label: string) {
    if (!confirm(`Delete size ${label}?`)) return
    const res = await deleteSize(id)
    if (res.success) {
      toast.success('Size deleted')
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to delete size')
    }
  }

  async function handleAddAccessory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addAccessory(formData)
    if (res.success) {
      toast.success('Accessory added')
      setShowAddAccessory(false)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to add accessory')
    }
    setLoading(false)
  }

  async function handleDeleteAccessory(id: string, name: string) {
    if (!confirm(`Delete accessory ${name}?`)) return
    const res = await deleteAccessory(id)
    if (res.success) {
      toast.success('Accessory deleted')
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to delete accessory')
    }
  }

  async function handleUpdateAccessory(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const res = await updateAccessory(id, name)
    if (res.success) {
      toast.success('Accessory updated')
      setEditingAccessoryId(null)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to update accessory')
    }
    setLoading(false)
  }

  async function handleUpdatePrice(price: PriceMatrixEntry) {
    setLoading(true)
    let res
    if (applyGlobal) {
      res = await updateGlobalPrice(price.brand_id, price.size_id, tempPrice)
    } else {
      res = await updatePrice(price.id, tempPrice)
    }
    
    if (res.success) {
      toast.success(applyGlobal ? 'Price updated globally' : 'Price updated')
      setEditingPriceId(null)
      setApplyGlobal(false)
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to update price')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Shops Section */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                Shops & Branches
              </CardTitle>
              <CardDescription>Manage your storefront locations</CardDescription>
            </div>
            <Button 
                onClick={() => setShowAddShop(!showAddShop)}
                className="bg-blue-900 hover:bg-blue-800 text-white gap-2 rounded-xl h-9 px-4"
                disabled={loading}
            >
              {showAddShop ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddShop ? 'Cancel' : 'Add Shop'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {showAddShop && (
                <form onSubmit={handleAddShop} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3 mb-4 animate-in slide-in-from-top-2">
                    <Input name="name" placeholder="Shop Name (e.g. Garden City)" required className="bg-white" />
                    <Input name="location" placeholder="Location/Street" className="bg-white" />
                    <Button type="submit" disabled={loading} className="w-full bg-blue-900 h-10">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Shop'}
                    </Button>
                </form>
            )}

            <div className="space-y-3">
              {data.shops.map((shop) => (
                <div key={shop.id} className="bg-gray-50/50 p-4 rounded-xl flex items-center justify-between group border border-transparent hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                  {editingShopId === shop.id ? (
                    <form onSubmit={(e) => handleUpdateShop(shop.id, e)} className="flex-1 flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Input name="name" defaultValue={shop.name} required className="h-8 text-sm" />
                        <Input name="location" defaultValue={shop.location || ''} className="h-8 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button type="submit" size="sm" className="bg-green-600 h-8"><Save className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingShopId(null)} className="h-8"><X className="w-3 h-3" /></Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-lg shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{shop.name}</h4>
                            <p className="text-xs text-gray-500">{shop.location || 'No location set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setEditingShopId(shop.id)} className="h-8 w-8 text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShop(shop.id, shop.name)} className="h-8 w-8 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Entities (Brands, Sizes, Accessories) */}
        <div className="space-y-8">
          {/* Brands */}
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  Product Brands
                </CardTitle>
                <CardDescription>Cylinder brands available in inventory</CardDescription>
              </div>
              <Button 
                  variant="ghost" 
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className="bg-gray-50 hover:bg-gray-100 h-9 px-3 rounded-xl"
              >
                {showAddBrand ? <X className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4 text-gray-600" />}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddBrand && (
                  <form onSubmit={handleAddBrand} className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6 border border-gray-100 animate-in slide-in-from-top-2">
                      <Input name="name" placeholder="Brand Name (e.g. TotalEnergies)" required className="bg-white" />
                      <Button type="submit" disabled={loading} className="w-full bg-blue-900 h-10">Add Brand</Button>
                  </form>
              )}
              <div className="flex flex-wrap gap-2">
                {data.brands.map((brand) => (
                  <Badge 
                    key={brand.id} 
                    variant="secondary" 
                    className="bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none py-2 px-3 pl-4 rounded-full font-semibold transition-colors group cursor-default"
                  >
                    {brand.name}
                    <button onClick={() => handleDeleteBrand(brand.id, brand.name)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  Cylinder Sizes
                </CardTitle>
                <CardDescription>Weight variants for gas cylinders</CardDescription>
              </div>
              <Button 
                  variant="ghost" 
                  onClick={() => setShowAddSize(!showAddSize)}
                  className="bg-gray-50 hover:bg-gray-100 h-9 px-3 rounded-xl"
              >
                {showAddSize ? <X className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4 text-gray-600" />}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddSize && (
                  <form onSubmit={handleAddSize} className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6 border border-gray-100 animate-in slide-in-from-top-2">
                      <div className="flex gap-2">
                        <Input name="size_kg" type="number" step="0.1" placeholder="Size (KG)" required className="bg-white" />
                        <Input name="label" placeholder="Label (optional)" className="bg-white" />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-blue-900 h-10">Add Size</Button>
                  </form>
              )}
              <div className="flex flex-wrap gap-2">
                {data.sizes.map((size) => (
                  <Badge 
                    key={size.id} 
                    variant="secondary" 
                    className="bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-none py-2 px-3 pl-4 rounded-full font-semibold transition-colors group cursor-default"
                  >
                    {size.label || `${size.size_kg} KG`}
                    <button onClick={() => handleDeleteSize(size.id, size.label || `${size.size_kg} KG`)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accessories */}
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  Accessories
                </CardTitle>
                <CardDescription>Support hardware and equipment</CardDescription>
              </div>
              <Button 
                  variant="ghost" 
                  onClick={() => setShowAddAccessory(!showAddAccessory)}
                  className="bg-gray-50 hover:bg-gray-100 h-9 px-3 rounded-xl"
              >
                {showAddAccessory ? <X className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4 text-gray-600" />}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddAccessory && (
                  <form onSubmit={handleAddAccessory} className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6 border border-gray-100 animate-in slide-in-from-top-2">
                      <Input name="name" placeholder="Accessory Name (e.g. Regulator)" required className="bg-white" />
                      <Button type="submit" disabled={loading} className="w-full bg-blue-900 h-10">Add Accessory</Button>
                  </form>
              )}
              <div className="flex flex-wrap gap-2">
                {data.accessories.map((acc) => (
                  <div key={acc.id} className="relative group">
                    {editingAccessoryId === acc.id ? (
                      <form onSubmit={(e) => handleUpdateAccessory(acc.id, e)} className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-blue-200">
                        <Input name="name" defaultValue={acc.name} required className="h-7 text-xs bg-white w-32 rounded-full px-3" />
                        <Button type="submit" size="icon" className="h-6 w-6 bg-green-600 rounded-full"><Save className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setEditingAccessoryId(null)} className="h-6 w-6 rounded-full"><X className="w-3 h-3" /></Button>
                      </form>
                    ) : (
                      <Badge 
                        variant="secondary" 
                        className="bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border-none py-2 px-3 pl-4 rounded-full font-semibold transition-colors group cursor-default flex items-center"
                      >
                        {acc.name}
                        <div className="flex items-center ml-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingAccessoryId(acc.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteAccessory(acc.id, acc.name)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Matrix */}
      <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-6 mb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 font-bold">
              <Globe className="w-5 h-5 text-blue-900 " />
              Pricing Matrix
            </CardTitle>
            <CardDescription>Configure cylinder sales prices per outlet</CardDescription>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
               <span>Select Outlet:</span>
               <select 
                  className="bg-gray-50 border border-gray-200 text-sm px-4 py-2 rounded-xl font-bold text-gray-900 outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
                  value={currentShopId || (data.shops[0]?.id || '')}
                  onChange={(e) => {
                      const params = new URLSearchParams(window.location.search)
                      params.set('shop', e.target.value)
                      window.location.search = params.toString()
                  }}
               >
                  {data.shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Size Variant</th>
                  <th className="px-6 py-4">Unit Price (KES)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.prices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No pricing combinations found for this outlet. Add brands and sizes to populate this matrix.
                    </td>
                  </tr>
                ) : data.prices.map((price) => (
                  <tr key={price.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{price.brand_name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                        {price.label || `${price.size_kg} KG`}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                        {editingPriceId === price.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                  <Input 
                                      type="number" 
                                      className="w-32 h-10 text-sm font-bold bg-white border-blue-200" 
                                      value={tempPrice} 
                                      onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                      autoFocus
                                  />
                                  <Button size="icon" onClick={() => handleUpdatePrice(price)} className="h-10 w-10 bg-blue-900 hover:bg-blue-800">
                                      <Save className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="outline" onClick={() => setEditingPriceId(null)} className="h-10 w-10">
                                      <X className="w-4 h-4" />
                                  </Button>
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer group/global">
                                <input 
                                  type="checkbox" 
                                  checked={applyGlobal} 
                                  onChange={(e) => setApplyGlobal(e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                                />
                                <span className="text-xs font-bold text-gray-500 group-hover/global:text-blue-900 transition-colors">Apply price to all branches</span>
                              </label>
                            </div>
                        ) : (
                            <div>
                                <p className="font-extrabold text-blue-900 text-lg">
                                    {price.price > 0 ? `KES ${price.price.toLocaleString()}` : <span className="text-gray-300">Not Set</span>}
                                </p>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-5">
                      {price.price > 0 ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider">
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-50 text-orange-600 border-none px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider">
                          INCOMPLETE
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => {
                            setEditingPriceId(price.id)
                            setTempPrice(price.price)
                            setApplyGlobal(false)
                        }}
                        className="text-gray-300 hover:text-blue-900 hover:bg-blue-50 transition-all p-2.5 rounded-xl"
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
