-- HesbornONE Seed Data Script
-- This script populates the database with 7 days of historical data for testing.
-- Run this in the Supabase SQL Editor.

DO $$
DECLARE
    shop_main_id UUID;
    shop_pipeline_id UUID;
    brand_total_id UUID;
    brand_rubis_id UUID;
    brand_shell_id UUID;
    brand_lake_id UUID;
    size_6kg_id UUID;
    size_13kg_id UUID;
    size_22kg_id UUID;
BEGIN
    -- 1. Insert Shops
    INSERT INTO shops (name, location) VALUES 
        ('Hesborn Main', 'Central Business District'),
        ('Hesborn Pipeline', 'Pipeline Area')
    ON CONFLICT DO NOTHING;

    SELECT id INTO shop_main_id FROM shops WHERE name = 'Hesborn Main';
    SELECT id INTO shop_pipeline_id FROM shops WHERE name = 'Hesborn Pipeline';

    -- 2. Insert Brands
    INSERT INTO brands (name) VALUES 
        ('TotalEnergies'), ('Rubis'), ('Shell (Afrigas)'), ('Lake Gas')
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO brand_total_id FROM brands WHERE name = 'TotalEnergies';
    SELECT id INTO brand_rubis_id FROM brands WHERE name = 'Rubis';
    SELECT id INTO brand_shell_id FROM brands WHERE name = 'Shell (Afrigas)';
    SELECT id INTO brand_lake_id FROM brands WHERE name = 'Lake Gas';

    -- 3. Insert Sizes
    INSERT INTO sizes (size_kg, label) VALUES 
        (6, '6 KG'), (13, '13 KG'), (22.5, '22.5 KG')
    ON CONFLICT (size_kg) DO NOTHING;

    SELECT id INTO size_6kg_id FROM sizes WHERE size_kg = 6;
    SELECT id INTO size_13kg_id FROM sizes WHERE size_kg = 13;
    SELECT id INTO size_22kg_id FROM sizes WHERE size_kg = 22.5;

    -- 4. Insert Prices (Pricing Matrix)
    -- Total
    INSERT INTO prices (shop_id, brand_id, size_id, price) VALUES 
        (shop_main_id, brand_total_id, size_6kg_id, 1250),
        (shop_main_id, brand_total_id, size_13kg_id, 2950),
        (shop_main_id, brand_total_id, size_22kg_id, 5500),
        (shop_pipeline_id, brand_total_id, size_6kg_id, 1200),
        (shop_pipeline_id, brand_total_id, size_13kg_id, 2850),
        (shop_pipeline_id, brand_total_id, size_22kg_id, 5300)
    ON CONFLICT (shop_id, brand_id, size_id) DO UPDATE SET price = EXCLUDED.price;

    -- Rubis
    INSERT INTO prices (shop_id, brand_id, size_id, price) VALUES 
        (shop_main_id, brand_rubis_id, size_6kg_id, 1150),
        (shop_main_id, brand_rubis_id, size_13kg_id, 2750),
        (shop_main_id, brand_rubis_id, size_22kg_id, 5100),
        (shop_pipeline_id, brand_rubis_id, size_6kg_id, 1100),
        (shop_pipeline_id, brand_rubis_id, size_13kg_id, 2650),
        (shop_pipeline_id, brand_rubis_id, size_22kg_id, 4900)
    ON CONFLICT (shop_id, brand_id, size_id) DO UPDATE SET price = EXCLUDED.price;

    -- Shell
    INSERT INTO prices (shop_id, brand_id, size_id, price) VALUES 
        (shop_main_id, brand_shell_id, size_6kg_id, 1300),
        (shop_main_id, brand_shell_id, size_13kg_id, 3050),
        (shop_main_id, brand_shell_id, size_22kg_id, 5700)
    ON CONFLICT (shop_id, brand_id, size_id) DO UPDATE SET price = EXCLUDED.price;

    -- 5. Insert Cylinder Stock for the last 7 days
    FOR i IN 0..7 LOOP
        INSERT INTO cylinder_stock (shop_id, date, brand_id, size_id, empty_count, full_count)
        SELECT 
            s.id, CURRENT_DATE - i, b.id, sz.id, 
            FLOOR(RANDOM() * 20 + 5)::INT, -- 5 to 25 empty
            FLOOR(RANDOM() * 30 + 10)::INT -- 10 to 40 full
        FROM shops s
        CROSS JOIN brands b
        CROSS JOIN sizes sz
        ON CONFLICT (shop_id, date, brand_id, size_id) DO NOTHING;
    END LOOP;

    -- 6. Insert Sales for the last 7 days
    FOR i IN 0..7 LOOP
        -- Generate 3-8 sales per day for each shop
        FOR j IN 1..(FLOOR(RANDOM() * 6 + 3)::INT) LOOP
            INSERT INTO sales (shop_id, date, brand_id, size_id, quantity, unit_price, payment_method, final_amount)
            SELECT 
                s.id, CURRENT_DATE - i, b.id, sz.id, 
                (FLOOR(RANDOM() * 2 + 1)::INT), -- 1-2 quantity
                p.price,
                CASE WHEN RANDOM() > 0.5 THEN 'CASH' ELSE 'KCB' END,
                p.price * (FLOOR(RANDOM() * 2 + 1)::INT)
            FROM shops s
            CROSS JOIN brands b
            CROSS JOIN sizes sz
            JOIN prices p ON p.shop_id = s.id AND p.brand_id = b.id AND p.size_id = sz.id
            ORDER BY RANDOM() LIMIT 1;
        END LOOP;
    END LOOP;

    -- 7. Insert Accessory Stock for the last 7 days
    INSERT INTO accessories (name) VALUES 
      ('Clips'), ('Hose Pipes'), ('6KG Grill'), ('HR Burner'), 
      ('Lite Gas Burner'), ('Orgaz/Primus'), ('6KG Regulator'), ('13KG Regulator')
    ON CONFLICT (name) DO NOTHING;

    FOR i IN 0..7 LOOP
        INSERT INTO accessory_stock (shop_id, date, accessory_id, opening_stock, units_added, units_sold, revenue_est)
        SELECT 
            s.id, CURRENT_DATE - i, a.id,
            FLOOR(RANDOM() * 50 + 20)::INT, -- 20 to 70 opening
            FLOOR(RANDOM() * 10)::INT,      -- 0 to 10 added
            FLOOR(RANDOM() * 5)::INT,       -- 0 to 5 sold
            0 -- Placeholder for revenue_est update if needed
        FROM shops s
        CROSS JOIN accessories a
        ON CONFLICT (shop_id, date, accessory_id) DO NOTHING;
    END LOOP;

END $$;
