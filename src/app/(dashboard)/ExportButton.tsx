'use client'

import React from 'react'
import { Download, FileText, Table as TableIcon, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type InventoryItem = {
  brand_name: string
  size_label: string
  full_count: number
  empty_count: number
  unit_price: number
}

type Props = {
  data: InventoryItem[]
  shopName: string
}

export function ExportButton({ data, shopName }: Props) {
  const exportToExcel = () => {
    if (!data || data.length === 0) return

    const worksheetData = data.map(item => ({
      'Brand': item.brand_name,
      'Size': item.size_label,
      'Full Stock': item.full_count,
      'Empty Stock': item.empty_count,
      'Unit Price (KES)': item.unit_price,
      'Total Value (KES)': item.full_count * item.unit_price
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
    XLSX.writeFile(wb, `Inventory_Report_${shopName}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    if (!data || data.length === 0) return

    const doc = new jsPDF()
    const timestamp = new Date().toLocaleString()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(23, 37, 84) // blue-900
    doc.text('HesbornONE Investment Ltd', 14, 20)
    
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text(`Inventory Status Report: ${shopName}`, 14, 30)
    
    doc.setFontSize(10)
    doc.text(`Generated on: ${timestamp}`, 14, 38)
    doc.line(14, 42, 196, 42)

    // Table
    const tableHeaders = [['Brand', 'Size', 'Full', 'Empty', 'Price', 'Value']]
    const tableRows = data.map(item => [
      item.brand_name,
      item.size_label,
      item.full_count,
      item.empty_count,
      `KES ${item.unit_price.toLocaleString()}`,
      `KES ${(item.full_count * item.unit_price).toLocaleString()}`
    ])

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [23, 37, 84] },
      styles: { fontSize: 9 }
    })

    doc.save(`Inventory_Report_${shopName}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 text-sm rounded-xl border border-gray-200 shadow-sm font-bold bg-white hover:bg-gray-50 text-blue-900 px-4 py-2 transition-colors cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Export Report
        <ChevronDown className="w-3 h-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-lg border-gray-100 bg-white min-w-[160px]">
        <DropdownMenuItem 
          onClick={exportToExcel}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-900 outline-none"
        >
          <TableIcon className="w-4 h-4 text-green-600" />
          <span className="font-semibold">Export as Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportToPDF}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-900 outline-none"
        >
          <FileText className="w-4 h-4 text-red-600" />
          <span className="font-semibold">Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
