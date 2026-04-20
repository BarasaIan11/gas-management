"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RefreshCw,
  ShoppingCart,
  MapPin,
  Flame,
  Settings2,
  Link,
  Wrench,
  Package,
  Paperclip,
  Cog,
} from "lucide-react";
import { logAccessoryAction } from "./actions";

type AccessoryRow = {
  id: string;
  name: string;
  stock_id?: string;
  opening_stock: number;
  units_added: number;
  units_sold: number;
  revenue_est: number;
  remaining: number;
};

type Props = {
  shopId: string;
  shopName: string;
  date: string;
  accessories: AccessoryRow[];
};

const ICON_MAP: Record<string, React.ReactNode> = {
  "Hose Pipes": <Link className="w-full h-full text-blue-600" />,
  Clips: <Paperclip className="w-full h-full text-gray-500" />,
  Regulators: <Settings2 className="w-full h-full text-blue-900" />,
  Burners: <Flame className="w-full h-full text-orange-500" />,
  "HR Burner": <Flame className="w-full h-full text-orange-600" />,
  "Lite Gas Burner": <Flame className="w-full h-full text-orange-400" />,
  "6KG Grill": <Settings2 className="w-full h-full text-red-600" />,
  "Orgaz/Primus": <Wrench className="w-full h-full text-gray-700" />,
  "6KG Regulator": <Cog className="w-full h-full text-blue-800" />,
  "13KG Regulator": <Cog className="w-full h-full text-blue-900" />,
};

export function AccessoriesClient({
  shopId,
  shopName,
  date,
  accessories,
}: Props) {
  const [actionType, setActionType] = useState<"SALE" | "RESTOCK">("SALE");
  const [selectedId, setSelectedId] = useState(accessories[0]?.id || "");
  const [quantity, setQuantity] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Primary/Feature accessories for cards
  const featured = accessories.slice(0, 4);
  const secondary = accessories.slice(4);

  const getLowStockBadge = (remaining: number) => {
    if (remaining <= 5)
      return (
        <Badge className="bg-red-100 text-red-700 border-none font-bold text-[10px] tracking-wider">
          LOW STOCK
        </Badge>
      );
    return (
      <Badge className="bg-green-100 text-green-700 border-none font-bold text-[10px] tracking-wider">
        IN STOCK
      </Badge>
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("shop_id", shopId);
    formData.append("date", date);
    formData.append("accessory_id", selectedId);
    formData.append("action_type", actionType);
    formData.append("quantity", quantity.toString());
    formData.append("revenue", revenue.toString());

    const res = await logAccessoryAction(formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setQuantity(0);
      setRevenue(0);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Inventory Management
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900">Accessories</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            Track non-cylinder hardware inventory, log sales transactions, and
            monitor real-time stock levels for all shop accessories.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          {shopId !== 'ALL' && (
            <>
              <Button 
                variant="outline" 
                className="gap-2 rounded-xl border-2 font-semibold"
                onClick={() => {
                  setActionType('SALE')
                  document.getElementById('stock-action-form')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                Log Sale
              </Button>
              <Button 
                className="bg-blue-900 hover:bg-blue-800 text-white gap-2 rounded-xl font-semibold shadow-md"
                onClick={() => {
                  setActionType('RESTOCK')
                  document.getElementById('stock-action-form')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Restock Items
              </Button>
            </>
          )}
        </div>
      </header>

      <div className={`grid grid-cols-1 ${shopId === 'ALL' ? '' : 'md:grid-cols-3'} gap-6`}>
        {/* Left: Accessory Cards */}
        <div className={`${shopId === 'ALL' ? '' : 'md:col-span-2'} space-y-6`}>
          {/* Featured 4 in 2x2 grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${shopId === 'ALL' ? 'md:grid-cols-4' : ''} gap-6`}>
            {featured.map((acc) => (
              <Card
                key={acc.id}
                className="bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="bg-gray-100 p-4 rounded-xl w-14 h-14 flex items-center justify-center">
                      {ICON_MAP[acc.name] || (
                        <Package className="w-full h-full text-gray-400" />
                      )}
                    </div>
                    {getLowStockBadge(acc.remaining)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {acc.name}
                  </h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Open
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {acc.opening_stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Add
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        +{acc.units_added}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Sold
                      </p>
                      <p className="text-xl font-bold text-red-500">
                        {acc.units_sold}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Rem
                      </p>
                      <p
                        className={`text-xl font-bold ${acc.remaining <= 5 ? "text-red-600" : "text-blue-900"}`}
                      >
                        {acc.remaining}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary stock table */}
          {secondary.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Secondary Stock
                </h3>
                <span className="text-xs text-gray-400">
                  Last updated:{" "}
                  {new Date().toLocaleTimeString("en-KE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  today
                </span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                    <th className="px-6 py-3">Item Name</th>
                    <th className="px-6 py-3 text-center">Opening</th>
                    <th className="px-6 py-3 text-center">Units Added</th>
                    <th className="px-6 py-3 text-center">Units Sold</th>
                    <th className="px-6 py-3 text-center">Revenue Est.</th>
                    <th className="px-6 py-3 text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {secondary.map((acc) => (
                    <tr
                      key={acc.id}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg text-gray-500 w-8 h-8 flex items-center justify-center">
                            {ICON_MAP[acc.name] || (
                              <Package className="w-full h-full" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {acc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-600">
                        {acc.opening_stock}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">
                        +{acc.units_added}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-red-500">
                        {acc.units_sold}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        KES {acc.revenue_est.toLocaleString()}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-extrabold text-lg ${acc.remaining <= 5 ? "text-red-600" : "text-gray-900"}`}
                      >
                        {acc.remaining}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Stock Action Panel */}
        <div className="space-y-4">
          {shopId !== 'ALL' && (
            <Card id="stock-action-form" className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden scroll-mt-20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Stock Action
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Action Type
                    </Label>
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${actionType === "SALE" ? "bg-blue-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                        onClick={() => setActionType("SALE")}
                      >
                        Sale
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${actionType === "RESTOCK" ? "bg-blue-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                        onClick={() => setActionType("RESTOCK")}
                      >
                        Restock
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Select Accessory
                    </Label>
                    <select
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                    >
                      {accessories.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  {actionType === "SALE" && (
                    <div>
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        Revenue (KES)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={revenue}
                        onChange={(e) =>
                          setRevenue(parseFloat(e.target.value) || 0)
                        }
                        className="rounded-xl"
                      />
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={loading || quantity <= 0}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl"
                  >
                    {loading ? "Processing..." : "Update Inventory"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Shop Card */}
          <div className="relative bg-blue-900 rounded-2xl overflow-hidden h-48">
            <div className="absolute inset-0 bg-linear-to-br from-blue-800 to-blue-950 opacity-90" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                Current Location
              </p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" />
                <p className="text-white text-lg font-bold">{shopName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}
