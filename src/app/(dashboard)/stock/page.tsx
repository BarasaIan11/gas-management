import { getStockData } from './actions'
import { StockClient } from './StockClient'

export default async function StockPage(props: { searchParams: Promise<{ shop?: string, date?: string }> }) {
  const params = await props.searchParams
  const date = params.date || new Date().toISOString().split('T')[0]
  
  const shopId = params.shop || 'ALL'

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
        key={`${shopId}-${date}`}
        shopId={shopId} 
        date={date} 
        initialData={stockData} 
      />
      
      <div className="h-16" />
    </div>
  )
}
