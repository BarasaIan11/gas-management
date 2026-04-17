import { getSettingsData } from './actions'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage(props: { searchParams: Promise<{ shop?: string }> }) {
  const params = await props.searchParams
  const data = await getSettingsData(params.shop)

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Settings & Configuration</h2>
        <p className="text-gray-500 mt-2">
          Manage your operational infrastructure, pricing models, and inventory thresholds across all shop locations.
        </p>
      </header>

      <SettingsClient initialData={data} currentShopId={params.shop} />
      
      <div className="h-20" /> {/* Spacer */}
    </div>
  )
}
