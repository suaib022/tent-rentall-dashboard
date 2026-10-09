ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tent_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_inventory_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Helper to apply standard RLS
CREATE OR REPLACE PROCEDURE apply_standard_rls(table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE format('
        CREATE POLICY "Viewers can read %I" ON %I FOR SELECT TO authenticated USING (has_role(''viewer''));
        CREATE POLICY "Staff can insert %I" ON %I FOR INSERT TO authenticated WITH CHECK (has_role(''staff''));
        CREATE POLICY "Staff can update %I" ON %I FOR UPDATE TO authenticated USING (has_role(''staff''));
        CREATE POLICY "Staff can delete %I" ON %I FOR DELETE TO authenticated USING (has_role(''staff''));
    ', table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
END;
$$;

CALL apply_standard_rls('customers');
CALL apply_standard_rls('tent_styles');
CALL apply_standard_rls('packages');
CALL apply_standard_rls('addon_packages');
CALL apply_standard_rls('accessories');
CALL apply_standard_rls('inventory_items');
CALL apply_standard_rls('catalog_inventory_map');
CALL apply_standard_rls('availability_blocks');
CALL apply_standard_rls('conversations');
CALL apply_standard_rls('quote_requests');
CALL apply_standard_rls('quote_items');
CALL apply_standard_rls('bookings');
CALL apply_standard_rls('booking_items');
CALL apply_standard_rls('booking_tasks');
CALL apply_standard_rls('payments');
CALL apply_standard_rls('events');
CALL apply_standard_rls('change_requests');
CALL apply_standard_rls('review_items');
CALL apply_standard_rls('agent_requests');
CALL apply_standard_rls('notifications');
CALL apply_standard_rls('audit_log');
CALL apply_standard_rls('rate_limits');
CALL apply_standard_rls('settings');

-- Admin only tables
CREATE POLICY "Viewers can read allowed_emails" ON allowed_emails FOR SELECT TO authenticated USING (has_role('viewer'));
CREATE POLICY "Admins can manage allowed_emails" ON allowed_emails FOR ALL TO authenticated USING (has_role('admin'));

CREATE POLICY "Viewers can read user_roles" ON user_roles FOR SELECT TO authenticated USING (has_role('viewer'));
CREATE POLICY "Admins can manage user_roles" ON user_roles FOR ALL TO authenticated USING (has_role('admin'));

CREATE POLICY "Users can read profiles" ON profiles FOR SELECT TO authenticated USING (has_role('viewer'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
