-- HesbornONE Gas Management Database Schema

-- 1. Shops / Branches
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cylinder Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Cylinder Sizes
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_kg NUMERIC NOT NULL UNIQUE,
  label TEXT, -- e.g., "6 KG", "13 KG"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Pricing Matrix (Shop + Brand + Size)
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, brand_id, size_id)
);

-- 5. Cylinder Stock (Daily Snapshot per Shop + Brand + Size)
CREATE TABLE cylinder_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  empty_count INTEGER NOT NULL DEFAULT 0,
  full_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, date, brand_id, size_id)
);

-- 6. Sales Log
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT,
  brand_id UUID NOT NULL REFERENCES brands(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'KCB')),
  final_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Accessories
CREATE TABLE accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Accessory Stock (Daily Movement per Shop)
CREATE TABLE accessory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  accessory_id UUID NOT NULL REFERENCES accessories(id) ON DELETE CASCADE,
  opening_stock INTEGER NOT NULL DEFAULT 0,
  units_added INTEGER NOT NULL DEFAULT 0,
  units_sold INTEGER NOT NULL DEFAULT 0,
  revenue_est NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, date, accessory_id)
);

-- 9. App Settings / Thresholds (Global or per Shop)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Initial Data (Accessories as requested)
INSERT INTO accessories (name) VALUES 
  ('Clips'), ('Hose Pipes'), ('6KG Grill'), ('HR Burner'), 
  ('Lite Gas Burner'), ('Orgaz/Primus'), ('6KG Regulator'), ('13KG Regulator');

-- Create Row Level Security (RLS) policies 
-- Optional: Let's assume the user accesses via Server Actions mainly, so we can disable RLS or just let them read/write everything if authenticated.
