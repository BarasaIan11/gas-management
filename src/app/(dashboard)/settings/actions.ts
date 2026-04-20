'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Shop, Brand, Size, PriceMatrixEntry, Accessory } from '@/types/database'

interface JoinedPrice {
  id: string
  shop_id: string
  brand_id: string
  size_id: string
  price: number
  brands: { name: string } | null
  sizes: { size_kg: number; label: string | null } | null
}

export async function getSettingsData(shopId?: string) {
  const supabase = await createClient()

  const [shopsRes, brandsRes, sizesRes, accessoriesRes] = await Promise.all([
    supabase.from('shops').select('*').order('created_at'),
    supabase.from('brands').select('*').order('name'),
    supabase.from('sizes').select('*').order('size_kg'),
    supabase.from('accessories').select('*').order('name'),
  ])

  let pricesRes = null
  if (shopId && shopId !== 'ALL') {
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
    matrices = (pricesRes.data as unknown as JoinedPrice[]).map((p) => ({
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
    accessories: (accessoriesRes.data as Accessory[]) || [],
    prices: matrices,
  }
}

// --- SHOPS ---
export async function addShop(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const location = formData.get('location') as string

  if (!name) return { error: 'Name is required' }

  const { data: newShop, error } = await supabase.from('shops').insert([{ name, location }]).select().single()
  if (error) return { error: error.message }
  
  // Initialize prices for this new shop
  const [brands, sizes] = await Promise.all([
    supabase.from('brands').select('id'),
    supabase.from('sizes').select('id')
  ])

  if (brands.data && sizes.data) {
    const priceEntries = []
    for (const b of brands.data) {
      for (const s of sizes.data) {
        priceEntries.push({
          shop_id: newShop.id,
          brand_id: b.id,
          size_id: s.id,
          price: 0
        })
      }
    }
    if (priceEntries.length > 0) {
      await supabase.from('prices').insert(priceEntries)
    }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function updateShop(id: string, name: string, location: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('shops').update({ name, location }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function deleteShop(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('shops').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

// --- BRANDS ---
export async function addBrand(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Name is required' }

  const { data: newBrand, error } = await supabase.from('brands').insert([{ name }]).select().single()
  if (error) return { error: error.message }
  
  // Initialize prices for this new brand across all shops and sizes
  const [shops, sizes] = await Promise.all([
    supabase.from('shops').select('id'),
    supabase.from('sizes').select('id')
  ])

  if (shops.data && sizes.data) {
    const priceEntries = []
    for (const shop of shops.data) {
      for (const size of sizes.data) {
        priceEntries.push({
          shop_id: shop.id,
          brand_id: newBrand.id,
          size_id: size.id,
          price: 0
        })
      }
    }
    if (priceEntries.length > 0) {
      await supabase.from('prices').insert(priceEntries)
    }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function deleteBrand(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('brands').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

// --- SIZES ---
export async function addSize(formData: FormData) {
  const supabase = await createClient()
  const size_kg = parseFloat(formData.get('size_kg') as string)
  const label = formData.get('label') as string

  if (isNaN(size_kg)) return { error: 'Valid Size (KG) is required' }

  const { data: newSize, error } = await supabase.from('sizes').insert([{ size_kg, label }]).select().single()
  if (error) return { error: error.message }
  
  // Initialize prices for this new size across all shops and brands
  const [shops, brands] = await Promise.all([
    supabase.from('shops').select('id'),
    supabase.from('brands').select('id')
  ])

  if (shops.data && brands.data) {
    const priceEntries = []
    for (const shop of shops.data) {
      for (const brand of brands.data) {
        priceEntries.push({
          shop_id: shop.id,
          brand_id: brand.id,
          size_id: newSize.id,
          price: 0
        })
      }
    }
    if (priceEntries.length > 0) {
      await supabase.from('prices').insert(priceEntries)
    }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function deleteSize(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sizes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

// --- ACCESSORIES ---
export async function addAccessory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase.from('accessories').insert([{ name }])
  if (error) return { error: error.message }
  
  revalidatePath('/settings')
  return { success: true }
}

export async function deleteAccessory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('accessories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function updateAccessory(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('accessories').update({ name }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

// --- PRICING ---
export async function updatePrice(priceId: string, newPrice: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('prices').update({ price: newPrice }).eq('id', priceId)
  
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function updateGlobalPrice(brandId: string, sizeId: string, newPrice: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('prices')
    .update({ price: newPrice })
    .eq('brand_id', brandId)
    .eq('size_id', sizeId)
  
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}
