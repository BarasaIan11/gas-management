'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardData(shopId: string | undefined) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Build queries based on whether we have a shopId
  const salesQuery = supabase.from('sales').select('final_amount, payment_method, quantity, date, sizes(size_kg)')
  const stockQuery = supabase.from('cylinder_stock').select('full_count, empty_count, brand_id, size_id, brands(name), sizes(size_kg, label)')
  const accessoryQuery = supabase.from('accessory_stock').select('opening_stock, units_added, units_sold')
  const priceQuery = supabase.from('prices').select('brand_id, size_id, price')

  if (shopId) {
    salesQuery.eq('shop_id', shopId)
    stockQuery.eq('shop_id', shopId)
    accessoryQuery.eq('shop_id', shopId)
    priceQuery.eq('shop_id', shopId)
  }

  const [
    { data: salesData },
    { data: stockData },
    { data: accessoryData },
    { data: priceData },
    { data: trendData }
  ] = await Promise.all([
    salesQuery.eq('date', today),
    stockQuery.eq('date', today),
    accessoryQuery.eq('date', today),
    priceQuery, // We take prices for all/selected shop
    salesQuery.gte('date', sevenDaysAgo).lte('date', today)
  ])

  const todaySales = salesData || []
  const currentStock = stockData || []
  const accessoryStock = accessoryData || []
  const prices = priceData || []
  const weekSales = trendData || []

  const totalRevenue = todaySales.reduce((sum, s) => sum + s.final_amount, 0)
  const cashRevenue = todaySales.filter(s => s.payment_method === 'CASH').reduce((sum, s) => sum + s.final_amount, 0)
  const kcbRevenue = todaySales.filter(s => s.payment_method === 'KCB').reduce((sum, s) => sum + s.final_amount, 0)
  
  const fullCylinders = currentStock.reduce((sum, s) => sum + s.full_count, 0)
  const totalCylinders = currentStock.reduce((sum, s) => sum + s.full_count + s.empty_count, 0)
  const capacityPct = totalCylinders > 0 ? Math.round((fullCylinders / totalCylinders) * 100) : 0

  const totalAccessories = accessoryStock.reduce((sum, s: any) => {
    return sum + (s.opening_stock + s.units_added - s.units_sold)
  }, 0)

  // Aggregated Stock Value
  const stockValue = currentStock.reduce((sum, s: any) => {
    // For global view, we might have multiple shops. We find the price for this item.
    const priceRec = prices.find(p => p.brand_id === s.brand_id && p.size_id === s.size_id)
    return sum + (s.full_count * (priceRec?.price || 0))
  }, 0)

  // Aggregated Inventory Table
  const aggregatedInventory: Record<string, any> = {}
  currentStock.forEach((s: any) => {
    const key = `${s.brand_id}-${s.size_id}`
    if (!aggregatedInventory[key]) {
      const priceRec = prices.find(p => p.brand_id === s.brand_id && p.size_id === s.size_id)
      aggregatedInventory[key] = {
        brand_name: s.brands?.name || 'Unknown',
        size_label: s.sizes?.label || `${s.sizes?.size_kg} KG`,
        full_count: 0,
        empty_count: 0,
        unit_price: priceRec?.price || 0
      }
    }
    aggregatedInventory[key].full_count += s.full_count
    aggregatedInventory[key].empty_count += s.empty_count
  })

  const inventoryTable = Object.values(aggregatedInventory)

  // Aggregated Low Stock Alerts
  const LOW_STOCK_THRESHOLD = 10
  const lowStockItems = inventoryTable
    .filter(item => item.full_count < LOW_STOCK_THRESHOLD)
    .map(item => ({
      name: `${item.brand_name} - ${item.size_label}`,
      full_count: item.full_count,
      threshold: LOW_STOCK_THRESHOLD,
      deficit: LOW_STOCK_THRESHOLD - item.full_count
    }))

  // 7-day KG trend
  const trendDays: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    trendDays[d] = 0
  }
  for (const sale of weekSales) {
    const d = sale.date
    if (trendDays[d] !== undefined) {
      trendDays[d] += sale.quantity * ((sale.sizes as any)?.size_kg || 0)
    }
  }

  return {
    totalRevenue,
    cashRevenue,
    kcbRevenue,
    fullCylinders,
    capacityPct,
    totalAccessories,
    stockValue,
    lowStockItems,
    inventoryTable,
    trend: Object.entries(trendDays).map(([date, kgs]) => ({ date, kgs }))
  }
}
