CREATE TYPE role_type AS ENUM ('admin', 'staff', 'viewer');
CREATE TYPE source_type AS ENUM ('website', 'ai_voice', 'ai_chat', 'manual');
CREATE TYPE price_type_enum AS ENUM ('from', 'fixed', 'custom_quote');
CREATE TYPE quote_status AS ENUM ('new', 'in_review', 'quoted', 'accepted', 'declined', 'expired', 'converted');
CREATE TYPE booking_status AS ENUM ('tentative', 'pending_approval', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'deposit_paid', 'paid', 'refunded');
CREATE TYPE availability_flag_enum AS ENUM ('ok', 'conflict', 'unchecked');
CREATE TYPE event_kind AS ENUM ('rental', 'delivery', 'pickup', 'site_visit', 'blocked', 'internal');
CREATE TYPE event_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE ground_surface_enum AS ENUM ('grass', 'pavement', 'gravel', 'other', 'unknown');
CREATE TYPE change_type_enum AS ENUM ('reschedule', 'change_guest_count', 'change_location', 'add_items', 'remove_items', 'change_package', 'cancel', 'other');
CREATE TYPE change_status AS ENUM ('open', 'under_review', 'approved', 'rejected', 'applied', 'withdrawn');
CREATE TYPE review_kind AS ENUM ('human_review', 'owner_consultation', 'agent_error', 'unverified_change');
CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE review_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE request_status AS ENUM ('received', 'processed', 'needs_review', 'failed');
CREATE TYPE county_enum AS ENUM ('Nassau', 'Suffolk', 'Other');
CREATE TYPE item_type_enum AS ENUM ('package', 'tent_style', 'accessory', 'custom');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION next_reference(prefix text)
RETURNS text AS $$
DECLARE
    seq_name text := 'ref_seq_' || prefix || '_' || to_char(now(), 'YYYY');
    next_val int;
BEGIN
    EXECUTE 'CREATE SEQUENCE IF NOT EXISTS ' || seq_name;
    EXECUTE 'SELECT nextval(''' || seq_name || ''')' INTO next_val;
    RETURN prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(next_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;
