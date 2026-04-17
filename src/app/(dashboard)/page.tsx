import { getDashboardData } from './actions'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SalesTrendChart } from './SalesTrendChart'
import { ExportButton } from './ExportButton'
import Link from 'next/link'
import {
  Archive,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Plus,
} from 'lucide-react'

export default async function DashboardPage(props: { searchParams: Promise<{ shop?: string }> }) {
  const params = await props.searchParams

  const supabase = await createClient()
  const { data: allShops } = await supabase.from('shops').select('id, name').order('created_at')
  const shops = allShops || []

  const shopId = params.shop
  let shopName = 'All Shops'
  const activeShop = shops.find(s => s.id === shopId)
  if (activeShop) {
    shopName = activeShop.name
  }

  const data = await getDashboardData(shopId)

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Performance Overview</h2>
          <p className="text-gray-500 mt-1">Real-time metrics for your shop network.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* New Pill Style Shop Switcher */}
          <div className="flex items-center bg-white border border-gray-100 rounded-full p-1 shadow-sm overflow-hidden">
            <Link
              href="/"
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                !shopId 
                ? 'bg-gray-100 text-gray-900 shadow-inner' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              All Shops
            </Link>
            {shops.map((s) => (
              <Link
                key={s.id}
                href={`?shop=${s.id}`}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  shopId === s.id 
                  ? 'bg-gray-100 text-gray-900 shadow-inner' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s.name.split(' ')[0]}
              </Link>
            ))}
          </div>
          <ExportButton data={data?.inventoryTable || []} shopName={shopName} />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Banknote className="w-6 h-6 text-gray-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-none font-bold text-[10px] tracking-wider">TODAY</Badge>
            </div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">
              KES {(data?.totalRevenue || 0).toLocaleString()}
            </p>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">KCB Bank</p>
                <p className="text-lg font-bold text-blue-900">{((data?.kcbRevenue || 0) / 1000).toFixed(1)}k</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cash</p>
                <p className="text-lg font-bold text-gray-700">{((data?.cashRevenue || 0) / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Cylinders */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Archive className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
              </span>
            </div>
            <p className="text-sm text-gray-500">Full Cylinders</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{data?.fullCylinders || 0}</p>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{data?.capacityPct || 0}% of total storage capacity utilized</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${data?.capacityPct || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Accessories */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Wrench className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Total Accessories</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{data?.totalAccessories || 0}</p>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Value Estimated</p>
                <p className="text-lg font-bold text-gray-700">
                  KES {(data?.stockValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend + Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Trend (7 days) */}
        <Card className="md:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Sales Trend (KGs)</h3>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px]">7D</Badge>
                <Badge variant="secondary" className="text-[10px] font-bold cursor-pointer">30D</Badge>
              </div>
            </div>
            <SalesTrendChart data={data?.trend || []} />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alerts
            </h3>
            <div className="space-y-3">
              {(data?.lowStockItems || []).slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border-l-4 border-red-400 pl-3 pr-4 py-3 rounded-r-xl shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-[10px] text-gray-400">
                      Threshold: {item.threshold} | Current: {item.full_count}
                    </p>
                  </div>
                  <span className="font-extrabold text-red-500">-{item.deficit}</span>
                </div>
              ))}
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm flex items-center justify-center gap-2">
                    All stock levels are healthy! <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </p>
                </div>
            </div>
              {(data?.lowStockItems || []).length > 0 && (
                <Link 
                  href={`/stock?shop=${shopId}`}
                  className="inline-flex w-full mt-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold h-10 items-center justify-center transition-colors"
                >
                  Restock Selected
                </Link>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status Table */}
      <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Inventory Status</h3>
            <a href="/stock" className="text-sm font-semibold text-blue-900 flex items-center gap-1 hover:underline">
              Full Inventory &rsaquo;
            </a>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                <th className="px-6 py-3">Product Brand</th>
                <th className="px-6 py-3">Cylinder Size</th>
                <th className="px-6 py-3 text-center">Full Stock</th>
                <th className="px-6 py-3 text-center">Empty Stock</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.inventoryTable || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{row.brand_name}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{row.size_label}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-extrabold ${row.full_count >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {row.full_count.toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 font-medium">
                    {row.empty_count.toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    KES {row.unit_price.toLocaleString()}
                  </td>
                </tr>
              ))}
              {(data?.inventoryTable || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No stock data recorded today. Go to <a href="/stock" className="text-blue-900 font-bold underline">Cylinder Stock</a> to set opening stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* FAB Button */}
      <a
        href="/sales"
        className="fixed right-6 bottom-20 md:bottom-6 bg-blue-900 hover:bg-blue-800 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors z-50"
      >
        <Plus className="w-6 h-6" />
      </a>

      <div className="h-16" />
    </div>
  )
}
