CREATE TABLE allowed_emails (
    email text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role role_type NOT NULL DEFAULT 'viewer',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE,
    phone text,
    company text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Catalog Tables
CREATE TABLE tent_styles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    price_type price_type_enum NOT NULL DEFAULT 'from',
    price_cents integer NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    sizes text,
    guest_min integer,
    guest_max integer,
    guest_max_plus boolean DEFAULT false,
    best_for text,
    includes text[],
    site_space text,
    tent_size text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    price_type price_type_enum NOT NULL DEFAULT 'from',
    price_cents integer NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    sizes text,
    guest_min integer,
    guest_max integer,
    guest_max_plus boolean DEFAULT false,
    best_for text,
    includes text[],
    site_space text,
    tent_size text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE addon_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    price_type price_type_enum NOT NULL DEFAULT 'from',
    price_cents integer NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    includes text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accessories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    price_type price_type_enum NOT NULL DEFAULT 'from',
    price_cents integer NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text,
    quantity integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE catalog_inventory_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type item_type_enum NOT NULL,
    ref_id uuid NOT NULL,
    inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    qty_per_unit integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE availability_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Business Tables
CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id text,
    channel text NOT NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    summary text,
    transcript jsonb,
    audio_url text,
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text UNIQUE,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
    source source_type NOT NULL,
    status quote_status NOT NULL DEFAULT 'new',
    event_type text,
    event_date date,
    guest_count integer,
    package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
    tent_style_id uuid REFERENCES tent_styles(id) ON DELETE SET NULL,
    venue_town text,
    venue_address text,
    message text,
    budget_range text,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    valid_until date,
    subtotal_cents integer NOT NULL DEFAULT 0,
    delivery_fee_cents integer NOT NULL DEFAULT 0,
    tax_cents integer NOT NULL DEFAULT 0,
    total_cents integer NOT NULL DEFAULT 0,
    converted_booking_id uuid, -- Reference added later
    conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    item_type item_type_enum NOT NULL,
    ref_id uuid,
    description text NOT NULL,
    qty integer NOT NULL DEFAULT 1,
    unit_price_cents integer NOT NULL DEFAULT 0,
    price_type price_type_enum NOT NULL DEFAULT 'fixed',
    line_total_cents integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text UNIQUE,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
    quote_request_id uuid REFERENCES quote_requests(id) ON DELETE SET NULL,
    source source_type NOT NULL,
    status booking_status NOT NULL DEFAULT 'tentative',
    package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
    tent_style_id uuid REFERENCES tent_styles(id) ON DELETE SET NULL,
    guest_count integer,
    subtotal_cents integer NOT NULL DEFAULT 0,
    delivery_fee_cents integer NOT NULL DEFAULT 0,
    tax_cents integer NOT NULL DEFAULT 0,
    total_cents integer NOT NULL DEFAULT 0,
    deposit_cents integer NOT NULL DEFAULT 0,
    payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
    hold_expires_at timestamptz,
    availability_flag availability_flag_enum NOT NULL DEFAULT 'unchecked',
    notes text,
    conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quote_requests ADD CONSTRAINT fk_quote_booking FOREIGN KEY (converted_booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

CREATE TABLE booking_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    item_type item_type_enum NOT NULL,
    ref_id uuid,
    description text NOT NULL,
    qty integer NOT NULL DEFAULT 1,
    unit_price_cents integer NOT NULL DEFAULT 0,
    price_type price_type_enum NOT NULL DEFAULT 'fixed',
    line_total_cents integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE booking_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    title text NOT NULL,
    due_date date,
    done boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    method text,
    paid_at timestamptz NOT NULL DEFAULT now(),
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
    kind event_kind NOT NULL,
    title text NOT NULL,
    status event_status NOT NULL DEFAULT 'scheduled',
    venue_name text,
    address_line1 text,
    town text,
    county county_enum,
    state text DEFAULT 'NY',
    zip text,
    setup_start timestamptz,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    teardown_by timestamptz,
    guest_count integer,
    onsite_contact_name text,
    onsite_contact_phone text,
    ground_surface ground_surface_enum DEFAULT 'unknown',
    access_notes text,
    crew_notes text,
    crew text[],
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE change_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text UNIQUE,
    booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
    source source_type NOT NULL,
    change_type change_type_enum NOT NULL,
    requested_changes jsonb NOT NULL,
    customer_note text,
    status change_status NOT NULL DEFAULT 'open',
    reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    resolution_note text,
    applied_at timestamptz,
    conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE review_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kind review_kind NOT NULL,
    priority priority_enum NOT NULL DEFAULT 'normal',
    reason text NOT NULL,
    summary text NOT NULL,
    customer_name text,
    customer_phone text,
    customer_email text,
    related_type text,
    related_id uuid,
    status review_status NOT NULL DEFAULT 'open',
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_note text,
    conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
    channel text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agent_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key text UNIQUE NOT NULL,
    tool text NOT NULL,
    channel text NOT NULL,
    conversation_id text,
    request jsonb NOT NULL,
    response jsonb,
    http_status integer,
    status request_status NOT NULL DEFAULT 'received',
    error text,
    linked_type text,
    linked_id uuid,
    duration_ms integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    link text,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid,
    actor_label text NOT NULL,
    table_name text NOT NULL,
    row_id uuid NOT NULL,
    action text NOT NULL,
    diff jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rate_limits (
    key text PRIMARY KEY,
    points integer NOT NULL DEFAULT 0,
    reset_at timestamptz NOT NULL
);

CREATE TABLE settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);
