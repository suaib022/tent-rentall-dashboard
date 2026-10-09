-- Updated At Triggers
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tent_styles_updated_at BEFORE UPDATE ON tent_styles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_addon_packages_updated_at BEFORE UPDATE ON addon_packages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accessories_updated_at BEFORE UPDATE ON accessories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_availability_blocks_updated_at BEFORE UPDATE ON availability_blocks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_quote_items_updated_at BEFORE UPDATE ON quote_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_booking_items_updated_at BEFORE UPDATE ON booking_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_booking_tasks_updated_at BEFORE UPDATE ON booking_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON change_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_review_items_updated_at BEFORE UPDATE ON review_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agent_requests_updated_at BEFORE UPDATE ON agent_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auth Trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_first_user boolean;
    is_allowed boolean;
BEGIN
    SELECT count(*) = 0 INTO is_first_user FROM user_roles;
    SELECT count(*) > 0 INTO is_allowed FROM allowed_emails WHERE email = NEW.email;

    IF is_first_user THEN
        INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
    ELSIF is_allowed THEN
        INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'viewer');
    ELSE
        RAISE EXCEPTION 'Signup not allowed. Email not in allowed_emails list.';
    END IF;

    INSERT INTO profiles (id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- References Triggers
CREATE OR REPLACE FUNCTION set_quote_reference()
RETURNS trigger AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := next_reference('Q');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quote_reference BEFORE INSERT ON quote_requests FOR EACH ROW EXECUTE PROCEDURE set_quote_reference();

CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS trigger AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := next_reference('B');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference BEFORE INSERT ON bookings FOR EACH ROW EXECUTE PROCEDURE set_booking_reference();

CREATE OR REPLACE FUNCTION set_change_request_reference()
RETURNS trigger AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := next_reference('C');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_change_request_reference BEFORE INSERT ON change_requests FOR EACH ROW EXECUTE PROCEDURE set_change_request_reference();

-- Check Role Function
CREATE OR REPLACE FUNCTION has_role(required_role role_type)
RETURNS boolean AS $$
DECLARE
    user_role role_type;
BEGIN
    SELECT role INTO user_role FROM user_roles WHERE user_id = auth.uid();
    IF required_role = 'admin' THEN
        RETURN user_role = 'admin';
    ELSIF required_role = 'staff' THEN
        RETURN user_role IN ('admin', 'staff');
    ELSIF required_role = 'viewer' THEN
        RETURN user_role IN ('admin', 'staff', 'viewer');
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
