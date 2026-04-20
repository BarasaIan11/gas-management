'use client'

import React from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

type TrendPoint = {
  date: string
  kgs: number
}

type Props = {
  data: TrendPoint[]
}

export function SalesTrendChart({ data }: Props) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Format dates for X-axis (e.g., "Mon", "Tue")
  const chartData = data.map(item => ({
    ...item,
    name: new Date(item.date).toLocaleDateString('en-KE', { weekday: 'short' }).toUpperCase()
  }))

  if (!isMounted) {
    return (
      <div className="w-full h-48 mt-4 bg-gray-50/50 rounded-xl animate-pulse flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
        Loading Trend...
      </div>
    )
  }

  return (
    <div className="w-full h-48 mt-4" style={{ minHeight: '192px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorKgs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#172554" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#172554" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 outline-none">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {payload[0].payload.date}
                    </p>
                    <p className="text-sm font-extrabold text-blue-900">
                      {payload[0].value?.toLocaleString()} KG Sold
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="kgs"
            stroke="#172554"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorKgs)"
            dot={{ r: 4, fill: '#172554', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
