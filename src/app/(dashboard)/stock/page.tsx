import { getStockData } from './actions'
import { createClient } from '@/utils/supabase/server'
import { StockClient } from './StockClient'

export default async function StockPage(props: { searchParams: Promise<{ shop?: string, date?: string }> }) {
  const params = await props.searchParams
  const date = params.date || new Date().toISOString().split('T')[0]
  
  // Need to get the first shop if none is selected
  let shopId = params.shop
  if (!shopId) {
    const supabase = await createClient()
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    if (shops && shops.length > 0) {
      shopId = shops[0].id
    }
  }

  if (!shopId) {
    return (
      <div className="p-8 text-center text-gray-500">
        No shop selected. Please select a shop from the sidebar.
      </div>
    )
  }

  const stockData = await getStockData(shopId, date)

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <StockClient 
        shopId={shopId} 
        date={date} 
        initialData={stockData} 
      />
      
      <div className="h-16" />
    </div>
  )
}
