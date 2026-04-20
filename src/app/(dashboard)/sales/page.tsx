import { getSalesData } from './actions'
import { SalesClient } from './SalesClient'

export default async function SalesPage(props: { searchParams: Promise<{ shop?: string, date?: string }> }) {
  const params = await props.searchParams
  const date = params.date || new Date().toISOString().split('T')[0]
  
  const shopId = params.shop || 'ALL'

  const { sales, availableStock } = await getSalesData(shopId, date)

  return (
    <SalesClient 
      key={`${shopId}-${date}`}
      shopId={shopId || ''} 
      date={date} 
      sales={sales} 
      availableStock={availableStock} 
    />
  )
}
