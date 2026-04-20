import { getAccessoriesData } from './actions'
import { AccessoriesClient } from './AccessoriesClient'
import { createClient } from '@/utils/supabase/server'

export default async function AccessoriesPage(props: { searchParams: Promise<{ shop?: string, date?: string }> }) {
  const params = await props.searchParams
  const date = params.date || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  const shopId = params.shop || 'ALL'
  let shopName = 'All Shops (Overview)'

  if (shopId !== 'ALL') {
    const { data: shop } = await supabase.from('shops').select('name').eq('id', shopId).single()
    if (shop) shopName = shop.name
  }

  const accessories = await getAccessoriesData(shopId, date)

  return (
    <AccessoriesClient
      key={`${shopId}-${date}`}
      shopId={shopId || ''}
      shopName={shopName}
      date={date}
      accessories={accessories}
    />
  )
}
