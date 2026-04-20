'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Accessory } from '@/types/database'

export async function getAccessoriesData(shopId: string | undefined, date: string) {
  const supabase = await createClient()

  if (!shopId) {
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    if (!shops || shops.length === 0) return []
    shopId = shops[0].id
  }

  const [accessoriesRes, stockRes] = await Promise.all([
    supabase.from('accessories').select('*').order('name'),
    shopId === 'ALL'
      ? supabase.from('accessory_stock').select('*').eq('date', date)
      : supabase.from('accessory_stock').select('*').eq('shop_id', shopId).eq('date', date)
  ])

  const accessories = (accessoriesRes.data as Accessory[]) || []
  const stock = stockRes.data || []

  // Combine into unified format
  return accessories.map(acc => {
    const accStocks = stock.filter(s => s.accessory_id === acc.id)
    const totalOpeningStock = accStocks.reduce((sum, s) => sum + (s.opening_stock || 0), 0)
    const totalUnitsAdded = accStocks.reduce((sum, s) => sum + (s.units_added || 0), 0)
    const totalUnitsSold = accStocks.reduce((sum, s) => sum + (s.units_sold || 0), 0)
    const totalRevenueEst = accStocks.reduce((sum, s) => sum + (s.revenue_est || 0), 0)

    return {
      id: acc.id,
      name: acc.name,
      stock_id: accStocks[0]?.id,
      opening_stock: totalOpeningStock,
      units_added: totalUnitsAdded,
      units_sold: totalUnitsSold,
      revenue_est: totalRevenueEst,
      remaining: totalOpeningStock + totalUnitsAdded - totalUnitsSold
    }
  })
}

export async function logAccessoryAction(formData: FormData) {
  const supabase = await createClient()
  
  const shopId = formData.get('shop_id') as string
  const date = formData.get('date') as string
  const accessoryId = formData.get('accessory_id') as string
  const actionType = formData.get('action_type') as string // 'SALE' or 'RESTOCK'
  const quantity = parseInt(formData.get('quantity') as string || '0', 10)
  const revenue = parseFloat(formData.get('revenue') as string || '0')

  if (!shopId || !accessoryId || quantity <= 0) return { error: 'Invalid input' }

  // Get current stock record
  const { data: existing } = await supabase
    .from('accessory_stock')
    .select('*')
    .eq('shop_id', shopId)
    .eq('date', date)
    .eq('accessory_id', accessoryId)
    .single()

  if (existing) {
    const updates: Record<string, string | number> = { updated_at: new Date().toISOString() }
    
    if (actionType === 'SALE') {
      const remaining = existing.opening_stock + existing.units_added - existing.units_sold
      if (quantity > remaining) return { error: 'Insufficient stock to sell' }
      
      updates.units_sold = existing.units_sold + quantity
      updates.revenue_est = existing.revenue_est + revenue
    } else {
      updates.units_added = existing.units_added + quantity
    }

    await supabase.from('accessory_stock').update(updates).eq('id', existing.id)
  } else {
    // If it doesn't exist, we assume 0 opening stock
    if (actionType === 'SALE') return { error: 'Cannot sell item with 0 stock' }
    
    await supabase.from('accessory_stock').insert([{
      shop_id: shopId,
      date,
      accessory_id: accessoryId,
      opening_stock: 0,
      units_added: quantity,
      units_sold: 0,
      revenue_est: 0
    }])
  }

  revalidatePath('/accessories')
  revalidatePath('/')
  return { success: true }
}
