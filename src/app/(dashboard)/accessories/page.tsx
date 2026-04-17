import { getAccessoriesData } from './actions'
import { AccessoriesClient } from './AccessoriesClient'
import { createClient } from '@/utils/supabase/server'

export default async function AccessoriesPage(props: { searchParams: Promise<{ shop?: string, date?: string }> }) {
  const params = await props.searchParams
  const date = params.date || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  let shopId = params.shop
  let shopName = 'Main Branch'

  if (!shopId) {
    const { data: shops } = await supabase.from('shops').select('id, name').limit(1)
    if (shops && shops.length > 0) {
      shopId = shops[0].id
      shopName = shops[0].name
    }
  } else {
    const { data: shop } = await supabase.from('shops').select('name').eq('id', shopId).single()
    if (shop) shopName = shop.name
  }

  const accessories = await getAccessoriesData(shopId, date)

  return (
    <AccessoriesClient
      shopId={shopId || ''}
      shopName={shopName}
      date={date}
      accessories={accessories}
    />
  )
}
