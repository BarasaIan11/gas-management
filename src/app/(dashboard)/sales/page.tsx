import { getSalesData } from './actions'
import { SalesClient } from './SalesClient'
import { createClient } from '@/utils/supabase/server'

export default async function SalesPage(props: { searchParams: Promise<{ shop?: string, date?: string }> }) {
  const params = await props.searchParams
  const date = params.date || new Date().toISOString().split('T')[0]
  
  let shopId = params.shop
  if (!shopId) {
    const supabase = await createClient()
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    if (shops && shops.length > 0) {
      shopId = shops[0].id
    }
  }

  const { sales, availableStock } = await getSalesData(shopId, date)

  return (
    <SalesClient 
      shopId={shopId || ''} 
      date={date} 
      sales={sales} 
      availableStock={availableStock} 
    />
  )
}
