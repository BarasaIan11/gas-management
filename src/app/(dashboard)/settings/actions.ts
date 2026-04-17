'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Shop, Brand, Size, PriceMatrixEntry } from '@/types/database'

export async function getSettingsData(shopId?: string) {
  const supabase = await createClient()

  const [shopsRes, brandsRes, sizesRes] = await Promise.all([
    supabase.from('shops').select('*').order('created_at'),
    supabase.from('brands').select('*').order('name'),
    supabase.from('sizes').select('*').order('size_kg'),
  ])

  let pricesRes = null
  if (shopId) {
    pricesRes = await supabase
      .from('prices')
      .select('*, brands(name), sizes(size_kg, label)')
      .eq('shop_id', shopId)
  } else if (shopsRes.data && shopsRes.data.length > 0) {
    pricesRes = await supabase
      .from('prices')
      .select('*, brands(name), sizes(size_kg, label)')
      .eq('shop_id', shopsRes.data[0].id)
  }

  // Format the prices to PriceMatrixEntry for UI easier consumption
  let matrices: PriceMatrixEntry[] = []
  if (pricesRes?.data) {
    matrices = pricesRes.data.map((p: any) => ({
      id: p.id,
      shop_id: p.shop_id,
      brand_id: p.brand_id,
      brand_name: p.brands?.name || 'Unknown',
      size_id: p.size_id,
      size_kg: p.sizes?.size_kg || 0,
      label: p.sizes?.label || null,
      price: p.price,
    }))
  }

  return {
    shops: (shopsRes.data as Shop[]) || [],
    brands: (brandsRes.data as Brand[]) || [],
    sizes: (sizesRes.data as Size[]) || [],
    prices: matrices,
  }
}

export async function addShop(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const location = formData.get('location') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase.from('shops').insert([{ name, location }])
  if (error) return { error: error.message }
  
  revalidatePath('/settings')
  return { success: true }
}

export async function addBrand(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase.from('brands').insert([{ name }])
  if (error) return { error: error.message }
  
  revalidatePath('/settings')
  return { success: true }
}

export async function updatePrice(priceId: string, newPrice: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('prices').update({ price: newPrice }).eq('id', priceId)
  
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}
