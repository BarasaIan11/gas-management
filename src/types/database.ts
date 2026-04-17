export type Shop = {
  id: string
  name: string
  location: string | null
  created_at: string
}

export type Brand = {
  id: string
  name: string
  created_at: string
}

export type Size = {
  id: string
  size_kg: number
  label: string | null
  created_at: string
}

export type Price = {
  id: string
  shop_id: string
  brand_id: string
  size_id: string
  price: number
  created_at: string
  updated_at: string
}

export type Accessory = {
  id: string
  name: string
  created_at: string
}

// Joined representation for UI purposes
export type PriceMatrixEntry = {
  id: string
  shop_id: string
  brand_id: string
  brand_name: string
  size_id: string
  size_kg: number
  label: string | null
  price: number
}
