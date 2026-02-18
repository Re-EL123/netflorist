-- ============================================================
-- NETFLORIST DRIVER MANAGEMENT SYSTEM
-- Complete Supabase Database Schema
-- Safe for fresh install AND re-runs
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. SAFE CLEANUP (only drops if exists)
-- ============================================================

-- Drop triggers first (they depend on functions and tables)
DO $$ BEGIN
    -- Drivers triggers
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_drivers_updated_at') THEN
        DROP TRIGGER update_drivers_updated_at ON drivers;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_driver_status_trigger') THEN
        DROP TRIGGER handle_driver_status_trigger ON drivers;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'check_temp_activation_trigger') THEN
        DROP TRIGGER check_temp_activation_trigger ON drivers;
    END IF;
    -- Deliveries triggers
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deliveries_updated_at') THEN
        DROP TRIGGER update_deliveries_updated_at ON deliveries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_delivery_grouped_units') THEN
        DROP TRIGGER calculate_delivery_grouped_units ON deliveries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_delivery_fee_trigger') THEN
        DROP TRIGGER calculate_delivery_fee_trigger ON deliveries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_driver_stats_trigger') THEN
        DROP TRIGGER update_driver_stats_trigger ON deliveries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_driver_rating_trigger') THEN
        DROP TRIGGER update_driver_rating_trigger ON deliveries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'record_status_change_trigger') THEN
        DROP TRIGGER record_status_change_trigger ON deliveries;
    END IF;
    -- Earnings triggers
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_earnings_updated_at') THEN
        DROP TRIGGER update_earnings_updated_at ON earnings;
    END IF;
    -- Temp activation triggers
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_temp_activation_updated_at') THEN
        DROP TRIGGER update_temp_activation_updated_at ON temporary_activation;
    END IF;
EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist yet, safe to ignore
    NULL;
END $$;

-- Drop views
DROP VIEW IF EXISTS driver_earnings_summary;
DROP VIEW IF EXISTS todays_delivery_stats;
DROP VIEW IF EXISTS online_drivers_view;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_grouped_units() CASCADE;
DROP FUNCTION IF EXISTS calculate_delivery_fee() CASCADE;
DROP FUNCTION IF EXISTS update_driver_stats_on_delivery() CASCADE;
DROP FUNCTION IF EXISTS update_driver_rating() CASCADE;
DROP FUNCTION IF EXISTS record_delivery_status_change() CASCADE;
DROP FUNCTION IF EXISTS handle_driver_status_change() CASCADE;
DROP FUNCTION IF EXISTS check_temp_driver_activation() CASCADE;

-- Drop tables in correct dependency order (children first)
DROP TABLE IF EXISTS delivery_status_history;
DROP TABLE IF EXISTS driver_location_history;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS earnings;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS temporary_activation;
DROP TABLE IF EXISTS admin_settings;
DROP TABLE IF EXISTS drivers;

-- ============================================================
-- 2. DRIVERS TABLE
-- ============================================================
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'Car',
    vehicle_registration TEXT,
    driver_type TEXT NOT NULL DEFAULT 'permanent'
        CHECK (driver_type IN ('permanent', 'old', 'temporary')),
    residential_area TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'suspended')),
    online_status TEXT NOT NULL DEFAULT 'offline'
        CHECK (online_status IN ('online', 'offline')),
    profile_image_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    last_seen TIMESTAMP WITH TIME ZONE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_branch_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_online_status ON drivers(online_status);
CREATE INDEX idx_drivers_driver_type ON drivers(driver_type);
CREATE INDEX idx_drivers_location ON drivers(latitude, longitude);
CREATE INDEX idx_drivers_last_seen ON drivers(last_seen);

-- ============================================================
-- 3. DELIVERIES TABLE
-- ============================================================
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    order_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    items_count INTEGER NOT NULL DEFAULT 1,
    grouped_units INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'assigned', 'accepted', 'picked_up',
            'in_transit', 'delivered', 'cancelled', 'failed'
        )),
    delivery_value DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    distance_km DECIMAL(10, 2),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    accepted_time TIMESTAMP WITH TIME ZONE,
    picked_up_time TIMESTAMP WITH TIME ZONE,
    delivered_time TIMESTAMP WITH TIME ZONE,
    cancelled_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    proof_of_delivery_url TEXT,
    signature_url TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);
CREATE INDEX idx_deliveries_delivered_time ON deliveries(delivered_time);

-- ============================================================
-- 4. EARNINGS TABLE
-- ============================================================
CREATE TABLE earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL DEFAULT 'delivery'
        CHECK (type IN ('delivery', 'bonus', 'adjustment', 'withdrawal', 'commission')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'cancelled', 'processing')),
    paid_at TIMESTAMP WITH TIME ZONE,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_earnings_driver_id ON earnings(driver_id);
CREATE INDEX idx_earnings_status ON earnings(status);
CREATE INDEX idx_earnings_type ON earnings(type);
CREATE INDEX idx_earnings_created_at ON earnings(created_at);

-- ============================================================
-- 5. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL DEFAULT 'system'
        CHECK (type IN (
            'delivery_request', 'delivery_completed', 'delivery_cancelled',
            'earnings', 'system', 'warning', 'activation', 'rating'
        )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_driver_id ON notifications(driver_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================
-- 6. TEMPORARY ACTIVATION TABLE
-- ============================================================
CREATE TABLE temporary_activation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMP WITH TIME ZONE,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    activated_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. DRIVER LOCATION HISTORY TABLE
-- ============================================================
CREATE TABLE driver_location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(6, 2),
    speed DECIMAL(6, 2),
    heading DECIMAL(5, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loc_hist_driver ON driver_location_history(driver_id);
CREATE INDEX idx_loc_hist_time ON driver_location_history(recorded_at);

-- ============================================================
-- 8. DELIVERY STATUS HISTORY TABLE
-- ============================================================
CREATE TABLE delivery_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_status_hist_del ON delivery_status_history(delivery_id);
CREATE INDEX idx_status_hist_time ON delivery_status_history(created_at);

-- ============================================================
-- 9. ADMIN SETTINGS TABLE
-- ============================================================
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO admin_settings (key, value, description) VALUES
    ('permanent_commission_rate', '0.05', 'Commission rate for permanent drivers (decimal)'),
    ('old_driver_rate_per_unit', '30', 'Rate per delivery unit for old drivers (ZAR)'),
    ('temporary_driver_rate_per_unit', '50', 'Rate per delivery unit for temporary drivers (ZAR)'),
    ('items_per_delivery_unit', '2', 'Number of items per delivery unit'),
    ('gps_update_interval', '30', 'GPS location update interval in seconds'),
    ('support_phone', '087 240 1200', 'Support phone number'),
    ('support_email', 'support@netflorist.co.za', 'Support email address'),
    ('support_hours', 'Mon-Fri: 8am-5pm, Sat: 8am-1pm', 'Support operating hours'),
    ('auto_assign_radius_km', '15', 'Maximum radius for auto driver assignment (km)'),
    ('max_active_deliveries', '5', 'Maximum concurrent deliveries per driver');

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_activation ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ===== DRIVERS POLICIES =====

-- Driver reads own profile
CREATE POLICY "drivers_select_own" ON drivers
    FOR SELECT
    USING (auth.uid() = user_id);

-- Driver updates own profile
CREATE POLICY "drivers_update_own" ON drivers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Driver creates own profile during registration
CREATE POLICY "drivers_insert_own" ON drivers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can read drivers (needed for admin panel)
CREATE POLICY "drivers_authenticated_read" ON drivers
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Any authenticated user can update drivers (admin operations)
CREATE POLICY "drivers_authenticated_update" ON drivers
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Any authenticated user can insert drivers (admin creates drivers)
CREATE POLICY "drivers_authenticated_insert" ON drivers
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ===== DELIVERIES POLICIES =====

-- Driver sees own deliveries
CREATE POLICY "deliveries_select_own" ON deliveries
    FOR SELECT
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Driver updates own deliveries
CREATE POLICY "deliveries_update_own" ON deliveries
    FOR UPDATE
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Authenticated read all (admin)
CREATE POLICY "deliveries_authenticated_read" ON deliveries
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated insert (admin creates loads)
CREATE POLICY "deliveries_authenticated_insert" ON deliveries
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated update (admin manages)
CREATE POLICY "deliveries_authenticated_update" ON deliveries
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ===== EARNINGS POLICIES =====

-- Driver sees own earnings
CREATE POLICY "earnings_select_own" ON earnings
    FOR SELECT
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Authenticated read all (admin)
CREATE POLICY "earnings_authenticated_read" ON earnings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated insert (system creates earnings records)
CREATE POLICY "earnings_authenticated_insert" ON earnings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated update (admin marks as paid)
CREATE POLICY "earnings_authenticated_update" ON earnings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ===== NOTIFICATIONS POLICIES =====

-- Driver sees own notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Driver marks own notifications as read
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Driver deletes own notifications
CREATE POLICY "notifications_delete_own" ON notifications
    FOR DELETE
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Authenticated insert (admin/system sends notifications)
CREATE POLICY "notifications_authenticated_insert" ON notifications
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated read all (admin)
CREATE POLICY "notifications_authenticated_read" ON notifications
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ===== TEMPORARY ACTIVATION POLICIES =====

-- Anyone authenticated can read activation status
CREATE POLICY "temp_activation_select" ON temporary_activation
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated can insert
CREATE POLICY "temp_activation_insert" ON temporary_activation
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated can update
CREATE POLICY "temp_activation_update" ON temporary_activation
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ===== LOCATION HISTORY POLICIES =====

-- Driver inserts own location
CREATE POLICY "location_insert_own" ON driver_location_history
    FOR INSERT
    WITH CHECK (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Driver reads own location history
CREATE POLICY "location_select_own" ON driver_location_history
    FOR SELECT
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

-- Authenticated read all (admin tracking)
CREATE POLICY "location_authenticated_read" ON driver_location_history
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ===== STATUS HISTORY POLICIES =====

-- Authenticated full access
CREATE POLICY "status_history_select" ON delivery_status_history
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "status_history_insert" ON delivery_status_history
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ===== ADMIN SETTINGS POLICIES =====

-- Authenticated can read
CREATE POLICY "settings_select" ON admin_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated can update
CREATE POLICY "settings_update" ON admin_settings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================================
-- 11. FUNCTIONS
-- ============================================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-calculate grouped_units from items_count
CREATE OR REPLACE FUNCTION calculate_grouped_units()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grouped_units = CEIL(NEW.items_count::DECIMAL / 2);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-calculate delivery_fee based on assigned driver type
CREATE OR REPLACE FUNCTION calculate_delivery_fee()
RETURNS TRIGGER AS $$
DECLARE
    v_driver_type TEXT;
    v_grouped_units INTEGER;
    v_perm_rate DECIMAL;
    v_old_rate DECIMAL;
    v_temp_rate DECIMAL;
BEGIN
    IF NEW.driver_id IS NOT NULL THEN
        -- Get driver type
        SELECT driver_type INTO v_driver_type
        FROM drivers
        WHERE id = NEW.driver_id;

        -- Get configurable rates from settings
        SELECT COALESCE(
            (SELECT value::DECIMAL FROM admin_settings WHERE key = 'permanent_commission_rate'),
            0.05
        ) INTO v_perm_rate;

        SELECT COALESCE(
            (SELECT value::DECIMAL FROM admin_settings WHERE key = 'old_driver_rate_per_unit'),
            30
        ) INTO v_old_rate;

        SELECT COALESCE(
            (SELECT value::DECIMAL FROM admin_settings WHERE key = 'temporary_driver_rate_per_unit'),
            50
        ) INTO v_temp_rate;

        v_grouped_units := CEIL(NEW.items_count::DECIMAL / 2);

        IF v_driver_type = 'permanent' THEN
            NEW.delivery_fee = COALESCE(NEW.delivery_value, 0) * v_perm_rate;
        ELSIF v_driver_type = 'old' THEN
            NEW.delivery_fee = v_grouped_units * v_old_rate;
        ELSIF v_driver_type = 'temporary' THEN
            NEW.delivery_fee = v_grouped_units * v_temp_rate;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update driver stats + create earnings + notification on delivery completion
CREATE OR REPLACE FUNCTION update_driver_stats_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle delivered status
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        -- Increment driver delivery count
        UPDATE drivers
        SET total_deliveries = total_deliveries + 1,
            updated_at = NOW()
        WHERE id = NEW.driver_id;

        -- Create earnings record
        INSERT INTO earnings (driver_id, delivery_id, amount, type, description, status)
        VALUES (
            NEW.driver_id,
            NEW.id,
            COALESCE(NEW.delivery_fee, 0),
            'delivery',
            'Delivery fee for order ' || COALESCE(NEW.order_id, 'N/A'),
            'pending'
        );

        -- Notify driver
        INSERT INTO notifications (driver_id, type, title, message, data)
        VALUES (
            NEW.driver_id,
            'delivery_completed',
            'Delivery Completed',
            'Order ' || COALESCE(NEW.order_id, 'N/A') || ' delivered successfully. R' || COALESCE(NEW.delivery_fee, 0)::TEXT || ' earned.',
            jsonb_build_object('order_id', NEW.order_id, 'earnings', NEW.delivery_fee)
        );
    END IF;

    -- Handle cancelled status
    IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
        IF NEW.driver_id IS NOT NULL THEN
            INSERT INTO notifications (driver_id, type, title, message, data)
            VALUES (
                NEW.driver_id,
                'delivery_cancelled',
                'Delivery Cancelled',
                'Order ' || COALESCE(NEW.order_id, 'N/A') || ' has been cancelled.',
                jsonb_build_object('order_id', NEW.order_id, 'reason', NEW.cancellation_reason)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update driver average rating when customer rates
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_avg_rating DECIMAL;
BEGIN
    IF NEW.customer_rating IS NOT NULL
       AND (OLD.customer_rating IS NULL OR NEW.customer_rating != OLD.customer_rating) THEN

        SELECT AVG(customer_rating)::DECIMAL(2,1)
        INTO v_avg_rating
        FROM deliveries
        WHERE driver_id = NEW.driver_id
          AND customer_rating IS NOT NULL;

        UPDATE drivers
        SET rating = COALESCE(v_avg_rating, 0),
            updated_at = NOW()
        WHERE id = NEW.driver_id;

        -- Notify driver of new rating
        INSERT INTO notifications (driver_id, type, title, message, data)
        VALUES (
            NEW.driver_id,
            'rating',
            'New Customer Rating',
            'A customer rated your delivery ' || NEW.customer_rating || ' stars for order ' || COALESCE(NEW.order_id, 'N/A') || '.',
            jsonb_build_object('rating', NEW.customer_rating, 'order_id', NEW.order_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Record every delivery status change for audit trail
CREATE OR REPLACE FUNCTION record_delivery_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS NULL OR NEW.status != OLD.status THEN
        INSERT INTO delivery_status_history (delivery_id, status, notes)
        VALUES (
            NEW.id,
            NEW.status,
            'Status changed from ' || COALESCE(OLD.status, 'new') || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Force driver offline when suspended or inactive
CREATE OR REPLACE FUNCTION handle_driver_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('suspended', 'inactive') THEN
        NEW.online_status = 'offline';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Block temporary drivers from going online if hiring not activated
CREATE OR REPLACE FUNCTION check_temp_driver_activation()
RETURNS TRIGGER AS $$
DECLARE
    v_is_active BOOLEAN;
    v_driver_type TEXT;
BEGIN
    IF NEW.online_status = 'online'
       AND (OLD.online_status IS NULL OR OLD.online_status = 'offline') THEN

        SELECT driver_type INTO v_driver_type
        FROM drivers WHERE id = NEW.id;

        IF v_driver_type = 'temporary' THEN
            SELECT COALESCE(is_active, FALSE) INTO v_is_active
            FROM temporary_activation
            LIMIT 1;

            IF NOT COALESCE(v_is_active, FALSE) THEN
                RAISE EXCEPTION 'Temporary driver hiring is not currently active. You cannot go online.';
            END IF;
        END IF;
    END IF;

    -- Always update last_seen when going online
    IF NEW.online_status = 'online' THEN
        NEW.last_seen = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 12. TRIGGERS
-- ============================================================

-- updated_at auto-update triggers
CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_earnings_updated_at
    BEFORE UPDATE ON earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_temp_activation_updated_at
    BEFORE UPDATE ON temporary_activation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Delivery grouped_units auto-calculation
CREATE TRIGGER calculate_delivery_grouped_units
    BEFORE INSERT OR UPDATE OF items_count ON deliveries
    FOR EACH ROW EXECUTE FUNCTION calculate_grouped_units();

-- Delivery fee auto-calculation based on driver type
CREATE TRIGGER calculate_delivery_fee_trigger
    BEFORE INSERT OR UPDATE OF driver_id, items_count, delivery_value ON deliveries
    FOR EACH ROW EXECUTE FUNCTION calculate_delivery_fee();

-- Driver stats + earnings + notifications on delivery completion
CREATE TRIGGER update_driver_stats_trigger
    AFTER UPDATE OF status ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_driver_stats_on_delivery();

-- Driver rating auto-update on customer rating
CREATE TRIGGER update_driver_rating_trigger
    AFTER UPDATE OF customer_rating ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_driver_rating();

-- Delivery status audit trail
CREATE TRIGGER record_status_change_trigger
    AFTER INSERT OR UPDATE OF status ON deliveries
    FOR EACH ROW EXECUTE FUNCTION record_delivery_status_change();

-- Force offline on driver suspend/inactive
CREATE TRIGGER handle_driver_status_trigger
    BEFORE UPDATE OF status ON drivers
    FOR EACH ROW EXECUTE FUNCTION handle_driver_status_change();

-- Block temp drivers from going online if not activated
CREATE TRIGGER check_temp_activation_trigger
    BEFORE UPDATE OF online_status ON drivers
    FOR EACH ROW EXECUTE FUNCTION check_temp_driver_activation();

-- ============================================================
-- 13. VIEWS
-- ============================================================

-- Driver earnings summary (aggregated)
CREATE OR REPLACE VIEW driver_earnings_summary AS
SELECT
    d.id AS driver_id,
    d.full_name,
    d.driver_type,
    d.status,
    d.total_deliveries,
    d.rating,
    COALESCE(SUM(CASE WHEN e.status != 'cancelled' THEN e.amount ELSE 0 END), 0) AS total_earnings,
    COALESCE(SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END), 0) AS paid_earnings,
    COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) AS pending_earnings
FROM drivers d
LEFT JOIN earnings e ON e.driver_id = d.id
GROUP BY d.id, d.full_name, d.driver_type, d.status, d.total_deliveries, d.rating;

-- Today's delivery statistics
CREATE OR REPLACE VIEW todays_delivery_stats AS
SELECT
    COUNT(*) FILTER (WHERE status = 'delivered') AS completed_today,
    COUNT(*) FILTER (WHERE status IN ('assigned', 'accepted', 'picked_up', 'in_transit')) AS active_now,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_assignment,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_today,
    COALESCE(SUM(delivery_fee) FILTER (WHERE status = 'delivered'), 0) AS earnings_today
FROM deliveries
WHERE DATE(created_at) = CURRENT_DATE;

-- Currently online drivers with active delivery count
CREATE OR REPLACE VIEW online_drivers_view AS
SELECT
    d.id,
    d.full_name,
    d.phone,
    d.driver_type,
    d.vehicle_type,
    d.residential_area,
    d.latitude,
    d.longitude,
    d.last_seen,
    d.rating,
    d.total_deliveries,
    (
        SELECT COUNT(*)
        FROM deliveries del
        WHERE del.driver_id = d.id
          AND del.status IN ('assigned', 'accepted', 'picked_up', 'in_transit')
    ) AS active_delivery_count
FROM drivers d
WHERE d.online_status = 'online'
  AND d.status = 'active'
ORDER BY d.last_seen DESC;

-- ============================================================
-- 14. SEED DATA
-- ============================================================

-- Initial temporary activation record (inactive by default)
INSERT INTO temporary_activation (is_active, notes)
VALUES (FALSE, 'Initial setup - temporary hiring inactive');

-- ============================================================
-- 15. GRANTS
-- ============================================================

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON driver_earnings_summary TO authenticated;
GRANT SELECT ON todays_delivery_stats TO authenticated;
GRANT SELECT ON online_drivers_view TO authenticated;

-- ============================================================
-- 16. STORAGE BUCKET (run separately if needed)
-- ============================================================
-- Note: Storage buckets are created via Supabase dashboard or API
-- Go to Storage > New bucket > "profile-images" (public)
-- Go to Storage > New bucket > "proof-of-delivery" (public)

-- ============================================================
-- VERIFICATION - Run these after setup to confirm everything:
-- ============================================================
--
-- Check tables:
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- Expected:
--   admin_settings
--   deliveries
--   delivery_status_history
--   driver_location_history
--   drivers
--   earnings
--   notifications
--   temporary_activation
--
-- Check policies:
-- SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
--
-- Check functions:
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' ORDER BY routine_name;
--
-- Expected functions:
--   calculate_delivery_fee
--   calculate_grouped_units
--   check_temp_driver_activation
--   handle_driver_status_change
--   record_delivery_status_change
--   update_driver_rating
--   update_driver_stats_on_delivery
--   update_updated_at_column
--
-- Check triggers:
-- SELECT trigger_name, event_object_table
--   FROM information_schema.triggers
--   WHERE trigger_schema = 'public'
--   ORDER BY event_object_table, trigger_name;
--
-- ============================================================
-- SETUP COMPLETE ✅
-- ============================================================