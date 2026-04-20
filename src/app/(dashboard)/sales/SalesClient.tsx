"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Archive,
  Plus,
  Banknote,
  Building2,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import { addSale } from "./actions";

type AvailableStock = {
  stock_id: string;
  brand_id: string;
  brand_name: string;
  size_id: string;
  size_kg: number;
  label: string | null;
  full_count: number;
  empty_count: number;
  unit_price: number;
};

type Sale = {
  id: string;
  customer_name: string;
  brand_name: string;
  size_label: string;
  quantity: number;
  unit_price: number;
  discount: number;
  final_amount: number;
  payment_method: string;
};

export function SalesClient({
  shopId,
  date,
  availableStock,
  sales,
}: {
  shopId: string;
  date: string;
  availableStock: AvailableStock[];
  sales: Sale[];
}) {
  const [isAdding, setIsAdding] = useState(false);

  const totalCash = sales
    .filter((s) => s.payment_method === "CASH")
    .reduce((sum, s) => sum + s.final_amount, 0);
  const totalKcb = sales
    .filter((s) => s.payment_method === "KCB")
    .reduce((sum, s) => sum + s.final_amount, 0);
  const grandTotal = totalCash + totalKcb;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Daily Sales Log</h2>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <input
              type="date"
              className="bg-transparent border-none font-medium text-gray-900 cursor-pointer"
              value={date}
              onChange={(e) => {
                const searchParams = new URLSearchParams(
                  window.location.search,
                );
                searchParams.set("date", e.target.value);
                window.location.search = searchParams.toString();
              }}
            />
          </p>
        </div>

        <div className="flex items-center gap-3">
          {shopId !== 'ALL' && (
            <Button
              className="bg-green-700 hover:bg-green-800 text-white shadow-md text-lg px-6 py-6 rounded-xl"
              onClick={() => setIsAdding(!isAdding)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Sale
            </Button>
          )}
        </div>
      </header>

      {/* Expandable Add Sale Form */}
      {isAdding && (
        <Card className="bg-white border-2 border-green-100 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Log Transaction
            </h3>
            <form
              action={async (formData) => {
                formData.append("shop_id", shopId);
                formData.append("date", date);
                const res = await addSale(formData);
                if (res.success) {
                  setIsAdding(false);
                } else {
                  alert(res.error);
                }
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Select Cylinder (Full Only)
                </Label>
                <div className="flex overflow-x-auto gap-4 pb-2">
                  {availableStock.map((stock) => (
                    <label
                      key={stock.stock_id}
                      className={`shrink-0 relative flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${stock.full_count === 0 ? "opacity-50 border-gray-100 bg-gray-50 cursor-not-allowed" : "hover:border-green-500 border-gray-200 bg-white hover:shadow-md"}`}
                    >
                      <input
                        type="radio"
                        name="selected_stock"
                        value={stock.stock_id}
                        disabled={stock.full_count === 0}
                        className="sr-only peer"
                        required
                        onChange={(e) => {
                          const container = e.target.closest("form");
                          if (container) {
                            (
                              container.querySelector(
                                "[name=unit_price]",
                              ) as HTMLInputElement
                            ).value = stock.unit_price.toString();
                            (
                              container.querySelector(
                                "[name=brand_id]",
                              ) as HTMLInputElement
                            ).value = stock.brand_id;
                            (
                              container.querySelector(
                                "[name=size_id]",
                              ) as HTMLInputElement
                            ).value = stock.size_id;
                            (
                              container.querySelector(
                                "[name=stock_id]",
                              ) as HTMLInputElement
                            ).value = stock.stock_id;
                            (
                              container.querySelector(
                                "[name=current_full]",
                              ) as HTMLInputElement
                            ).value = stock.full_count.toString();
                            (
                              container.querySelector(
                                "[name=current_empty]",
                              ) as HTMLInputElement
                            ).value = stock.empty_count.toString();
                          }
                        }}
                      />
                      <div className="peer-checked:ring-2 peer-checked:ring-green-500 absolute inset-0 rounded-xl" />
                      <Archive className="w-6 h-6 mb-2 text-blue-900" />
                      <span className="text-sm font-bold text-gray-900">
                        {stock.brand_name} {stock.label || `${stock.size_kg}kg`}
                      </span>
                      {stock.full_count === 0 ? (
                        <span className="text-xs text-red-500 font-bold mt-1">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium mt-1">
                          {stock.full_count} Units
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Hidden inputs to capture selected stock data */}
              <input type="hidden" name="brand_id" />
              <input type="hidden" name="size_id" />
              <input type="hidden" name="stock_id" />
              <input type="hidden" name="current_full" />
              <input type="hidden" name="current_empty" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Input name="customer_name" placeholder="Walk-in" />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    name="quantity"
                    type="number"
                    defaultValue="1"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price (KES)</Label>
                  <Input name="unit_price" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label>Discount (KES)</Label>
                  <Input
                    name="discount"
                    type="number"
                    step="0.01"
                    defaultValue="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Payment Method
                </Label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="payment_method"
                      value="CASH"
                      className="peer sr-only"
                      required
                    />
                    <div className="p-4 border border-gray-200 rounded-xl text-center peer-checked:border-green-500 peer-checked:bg-green-50 font-bold text-gray-700 cursor-pointer transition-colors">
                      <Banknote className="w-5 h-5 mx-auto mb-1 text-green-600" />
                      CASH
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="payment_method"
                      value="KCB"
                      className="peer sr-only"
                      required
                    />
                    <div className="p-4 border border-gray-200 rounded-xl text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 font-bold text-gray-700 cursor-pointer transition-colors">
                      <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      KCB TRANSFER
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-900 text-white hover:bg-blue-800"
                >
                  Complete Sale
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Top Banner section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-[#FCF8F3] p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Available Cylinders (Full Only)
            </h3>
            <Badge className="bg-green-200 text-green-800 hover:bg-green-300 font-bold border-none tracking-wider text-[10px]">
              LIVE STOCK
            </Badge>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2">
            {availableStock.map((stock) => (
              <div
                key={stock.stock_id}
                className="shrink-0 bg-white p-4 rounded-xl flex flex-col items-center justify-center min-w-[100px] shadow-sm border border-gray-100/50"
              >
                <div className="bg-blue-900 p-2 rounded-lg text-white mb-2">
                  <Archive className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-900 text-center leading-tight">
                  {stock.brand_name}
                  <br />
                  {stock.label || `${stock.size_kg}kg`}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {stock.full_count} Units
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-1 bg-blue-900 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-white" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1 relative z-10">
            Today&apos;s Transactions
          </p>
          <p className="text-white text-5xl font-bold relative z-10">
            {sales.length}
          </p>
          <p className="text-green-300 text-xs font-medium mt-4 flex items-center gap-1 relative z-10">
            <TrendingUp className="w-3 h-3" />
            Active Sales Day
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="bg-gray-50 border-none shadow-none rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white">
              <thead className="bg-[#F8F7F5]">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Brand/Size</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-blue-50/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {sale.customer_name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        #{sale.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="bg-gray-100 p-1.5 rounded text-gray-500 font-bold text-[10px]">
                        {sale.brand_name?.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {sale.brand_name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          ({sale.size_label})
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">
                        {sale.quantity.toString().padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {sale.unit_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500">
                      {sale.discount > 0
                        ? `- ${sale.discount.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {sale.final_amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={`border-none font-bold text-[10px] uppercase tracking-wide gap-1 ${
                          sale.payment_method === "KCB"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {sale.payment_method === "KCB" ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <Banknote className="w-3 h-3" />
                        )}
                        {sale.payment_method}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Footer */}
          <div className="bg-[#F8F7F5] p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between">
            <div className="flex gap-12">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-green-600 shadow-sm">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total Cash Today
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    KSh{" "}
                    {totalCash.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total KCB Today
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    KSh{" "}
                    {totalKcb.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                Grand Total
              </p>
              <p className="text-4xl font-bold text-blue-900 tracking-tight">
                <span className="text-xl text-blue-800/60 mr-1">KSh</span>
                {grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="h-16" />
    </div>
  );
}
