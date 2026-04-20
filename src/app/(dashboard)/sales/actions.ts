'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getSalesData(shopId: string | undefined, date: string) {
  const supabase = await createClient()

  if (!shopId) {
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    if (!shops || shops.length === 0) return { sales: [], availableStock: [] }
    shopId = shops[0].id
  }

  let salesQuery = supabase
    .from('sales')
    .select('*, brands(name), sizes(size_kg, label)')
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (shopId !== 'ALL') {
    salesQuery = salesQuery.eq('shop_id', shopId)
  }

  const { data: salesData } = await salesQuery

  let stockQuery = supabase
    .from('cylinder_stock')
    .select('*, brands(name), sizes(size_kg, label)')
    .eq('date', date)

  if (shopId !== 'ALL') {
    stockQuery = stockQuery.eq('shop_id', shopId)
  }

  let pricesQuery = supabase.from('prices').select('*')
  if (shopId !== 'ALL') {
    pricesQuery = pricesQuery.eq('shop_id', shopId)
  }

  const [stockRes, pricesRes] = await Promise.all([stockQuery, pricesQuery])

  const stock = stockRes.data || []
  const prices = pricesRes.data || []

  const mappedStock = stock.map((s: any) => {
    // If shopId is ALL, prices might vary by shop, but for the banner we just need count.
    const priceRecord = prices.find((p: any) => p.brand_id === s.brand_id && p.size_id === s.size_id && (shopId === 'ALL' ? true : p.shop_id === shopId))
    return {
      stock_id: s.id,
      brand_id: s.brand_id,
      brand_name: s.brands?.name || 'Unknown',
      size_id: s.size_id,
      size_kg: s.sizes?.size_kg || 0,
      label: s.sizes?.label || null,
      full_count: s.full_count as number,
      empty_count: s.empty_count as number,
      unit_price: priceRecord?.price || 0
    }
  })

  let availableStock = mappedStock
  if (shopId === 'ALL') {
    const aggregated = new Map()
    mappedStock.forEach(s => {
      const key = `${s.brand_id}_${s.size_id}`
      if (!aggregated.has(key)) {
        aggregated.set(key, { ...s, stock_id: `grouped_${s.brand_id}_${s.size_id}` })
      } else {
        const existing = aggregated.get(key)
        existing.full_count += s.full_count
        existing.empty_count += s.empty_count
      }
    })
    availableStock = Array.from(aggregated.values())
  }

  const sales = (salesData || []).map((s: any) => ({
    id: s.id,
    customer_name: s.customer_name || 'Walk-in',
    brand_name: s.brands?.name,
    size_label: s.sizes?.label || `${s.sizes?.size_kg} KG`,
    quantity: s.quantity,
    unit_price: s.unit_price,
    discount: s.discount,
    final_amount: s.final_amount,
    payment_method: s.payment_method
  }))

  return { sales, availableStock: availableStock.filter(s => s.full_count > 0 || s.full_count === 0) } 
  // We send all of them. The UI will disable those with full_count === 0.
}

export async function addSale(formData: FormData) {
  const supabase = await createClient()
  
  const shopId = formData.get('shop_id') as string
  const date = formData.get('date') as string
  const brandId = formData.get('brand_id') as string
  const sizeId = formData.get('size_id') as string
  const customerName = formData.get('customer_name') as string
  const quantity = parseInt(formData.get('quantity') as string || '1', 10)
  const unitPrice = parseFloat(formData.get('unit_price') as string || '0')
  const discount = parseFloat(formData.get('discount') as string || '0')
  const paymentMethod = formData.get('payment_method') as string
  const stockId = formData.get('stock_id') as string
  const currentFullCount = parseInt(formData.get('current_full') as string || '0', 10)
  const currentEmptyCount = parseInt(formData.get('current_empty') as string || '0', 10)

  if (quantity <= 0 || quantity > currentFullCount) {
    return { error: 'Invalid quantity or insufficient stock.' }
  }

  const finalAmount = (quantity * unitPrice) - discount

  // 1. Insert Sale record
  const { error: saleError } = await supabase.from('sales').insert([{
    shop_id: shopId,
    date,
    brand_id: brandId,
    size_id: sizeId,
    customer_name: customerName,
    quantity,
    unit_price: unitPrice,
    discount,
    payment_method: paymentMethod,
    final_amount: finalAmount
  }])

  if (saleError) return { error: saleError.message }

  // 2. Update stock (decrease full, increase empty)
  await supabase.from('cylinder_stock').update({
    full_count: currentFullCount - quantity,
    empty_count: currentEmptyCount + quantity,
    updated_at: new Date().toISOString()
  }).eq('id', stockId)

  revalidatePath('/sales')
  revalidatePath('/stock')
  revalidatePath('/')
  
  return { success: true }
}
