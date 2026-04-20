'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Brand, Size } from '@/types/database'

export type CylinderStockEntry = {
  id?: string
  brand_id: string
  size_id: string
  empty_count: number
  full_count: number
  brand_name: string
  size_kg: number
  label?: string | null
}

export async function getStockData(shopId: string | undefined, date: string) {
  const supabase = await createClient()

  const [brandsRes, sizesRes, stockRes] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase.from('sizes').select('*').order('size_kg'),
    shopId === 'ALL'
      ? supabase.from('cylinder_stock').select('*').eq('date', date)
      : (shopId
          ? supabase.from('cylinder_stock').select('*').eq('shop_id', shopId).eq('date', date)
          : Promise.resolve({ data: [] }))
  ])

  const brands = (brandsRes.data as Brand[]) || []
  const sizes = (sizesRes.data as Size[]) || []
  const stockRecords = stockRes.data || []

  // Combine into a full matrix
  const matrix: CylinderStockEntry[] = []
  
  for (const brand of brands) {
    for (const size of sizes) {
      const existingRecords = stockRecords.filter(s => s.brand_id === brand.id && s.size_id === size.id)
      
      const emptyCount = existingRecords.reduce((sum, r) => sum + (r.empty_count || 0), 0)
      const fullCount = existingRecords.reduce((sum, r) => sum + (r.full_count || 0), 0)
      // ID uses the first one found, though for 'ALL', updating isn't allowed anyway
      const existingId = existingRecords[0]?.id

      matrix.push({
        id: existingId,
        brand_id: brand.id,
        size_id: size.id,
        empty_count: emptyCount,
        full_count: fullCount,
        brand_name: brand.name,
        size_kg: size.size_kg,
        label: size.label
      })
    }
  }

  return matrix
}

export async function updateStock(shopId: string, date: string, brandId: string, sizeId: string, emptyCount: number, fullCount: number) {
  const supabase = await createClient()
  
  // Try to find if it exists
  const { data: existing } = await supabase
    .from('cylinder_stock')
    .select('id')
    .eq('shop_id', shopId)
    .eq('date', date)
    .eq('brand_id', brandId)
    .eq('size_id', sizeId)
    .single()

  if (existing) {
    // Update
    await supabase
      .from('cylinder_stock')
      .update({ empty_count: emptyCount, full_count: fullCount, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    // Insert
    await supabase
      .from('cylinder_stock')
      .insert([
        {
          shop_id: shopId,
          date,
          brand_id: brandId,
          size_id: sizeId,
          empty_count: emptyCount,
          full_count: fullCount
        }
      ])
  }

  revalidatePath('/stock')
  return { success: true }
}
export async function updateBulkStock(shopId: string, date: string, updates: { brandId: string, sizeId: string, emptyCount: number, fullCount: number }[]) {
  const supabase = await createClient()

  const { data: existingRecords } = await supabase
    .from('cylinder_stock')
    .select('id, brand_id, size_id')
    .eq('shop_id', shopId)
    .eq('date', date)

  const promises = updates.map(update => {
    const existing = existingRecords?.find(r => r.brand_id === update.brandId && r.size_id === update.sizeId)
    
    if (existing) {
      return supabase
        .from('cylinder_stock')
        .update({
          empty_count: update.emptyCount,
          full_count: update.fullCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      return supabase
        .from('cylinder_stock')
        .insert([{
          shop_id: shopId,
          date,
          brand_id: update.brandId,
          size_id: update.sizeId,
          empty_count: update.emptyCount,
          full_count: update.fullCount
        }])
    }
  })

  await Promise.all(promises)
  revalidatePath('/stock')
  revalidatePath('/')
  return { success: true }
}
