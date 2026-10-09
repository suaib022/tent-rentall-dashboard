-- Migration for Agent RPCs
-- 1. Schema Updates
ALTER TABLE change_requests ADD COLUMN IF NOT EXISTS before_snapshot jsonb;
ALTER TABLE change_requests ADD COLUMN IF NOT EXISTS availability_result jsonb;
ALTER TABLE change_requests ADD COLUMN IF NOT EXISTS availability_flag availability_flag_enum;

-- 2. check_availability
CREATE OR REPLACE FUNCTION check_availability(
    p_start date,
    p_end date,
    p_items jsonb,
    p_exclude_event uuid DEFAULT NULL,
    p_exclude_booking uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_conflicts text[] := ARRAY[]::text[];
    v_alternatives date[] := ARRAY[]::date[];
    v_result text := 'tentatively_available';
    v_lead_days integer;
    v_min_lead integer;
    v_max_installs integer;
    v_install_count integer;
    v_block_count integer;
    v_end date := COALESCE(p_end, p_start);
    
    v_inv_record record;
    v_requested_qty integer;
    v_used_qty integer;
    v_pool_qty integer;
BEGIN
    -- Check lead time
    v_lead_days := p_start - current_date;
    SELECT (value->>0)::integer INTO v_min_lead FROM settings WHERE key = 'min_lead_time_days';
    IF v_lead_days < COALESCE(v_min_lead, 7) THEN
        v_result := 'needs_review';
        v_conflicts := array_append(v_conflicts, 'Lead time is below minimum required.');
    END IF;

    -- Check availability blocks
    SELECT count(*) INTO v_block_count
    FROM availability_blocks
    WHERE start_date <= v_end AND end_date >= p_start;
    
    IF v_block_count > 0 THEN
        v_result := 'not_available';
        v_conflicts := array_append(v_conflicts, 'Dates are blocked by management.');
    END IF;

    -- Check installs per day
    SELECT (value->>0)::integer INTO v_max_installs FROM settings WHERE key = 'max_installs_per_day';
    
    -- Count installs on the start date
    SELECT count(DISTINCT b.id) INTO v_install_count
    FROM bookings b
    JOIN events e ON b.id = e.booking_id
    WHERE e.kind = 'rental' AND e.status != 'cancelled' AND e.deleted_at IS NULL
    AND e.start_at::date = p_start 
    AND (p_exclude_event IS NULL OR e.id != p_exclude_event)
    AND (p_exclude_booking IS NULL OR b.id != p_exclude_booking);
    
    IF v_install_count >= COALESCE(v_max_installs, 3) THEN
        IF v_result = 'tentatively_available' THEN
            v_result := 'needs_review';
        END IF;
        v_conflicts := array_append(v_conflicts, 'Maximum installs per day reached.');
    END IF;

    -- Check inventory constraints if items are provided
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        -- We loop over the requested inventory needs based on the catalog mapping
        FOR v_inv_record IN 
            SELECT i.id, i.name, i.quantity, SUM((req->>'qty')::integer * cim.qty_per_unit) as req_qty
            FROM jsonb_array_elements(p_items) req
            JOIN catalog_inventory_map cim ON cim.item_type::text = (req->>'item_type') AND cim.ref_id = (req->>'ref_id')::uuid
            JOIN inventory_items i ON i.id = cim.inventory_item_id
            GROUP BY i.id, i.name, i.quantity
        LOOP
            v_pool_qty := v_inv_record.quantity;
            v_requested_qty := v_inv_record.req_qty;
            
            -- Calculate currently used quantity from active bookings/events overlapping this period
            SELECT COALESCE(SUM(bi.qty * cim.qty_per_unit), 0) INTO v_used_qty
            FROM booking_items bi
            JOIN bookings b ON bi.booking_id = b.id
            JOIN events e ON b.id = e.booking_id
            JOIN catalog_inventory_map cim ON cim.item_type = bi.item_type AND cim.ref_id = bi.ref_id
            WHERE cim.inventory_item_id = v_inv_record.id
            AND e.kind = 'rental' AND e.status != 'cancelled' AND e.deleted_at IS NULL
            AND b.status != 'cancelled'
            AND (e.start_at::date <= v_end AND e.end_at::date >= p_start)
            AND (p_exclude_booking IS NULL OR b.id != p_exclude_booking)
            AND (p_exclude_event IS NULL OR e.id != p_exclude_event)
            -- include active holds
            AND (b.status IN ('confirmed', 'completed', 'pending_approval') OR (b.status = 'tentative' AND b.hold_expires_at > now()));

            IF (v_used_qty + v_requested_qty) > v_pool_qty THEN
                IF v_result = 'tentatively_available' THEN
                    v_result := 'not_available';
                END IF;
                v_conflicts := array_append(v_conflicts, 'Insufficient inventory for some items.');
            END IF;
        END LOOP;
    END IF;

    -- Find alternatives if blocked
    IF v_result = 'not_available' THEN
        -- Dummy alternatives for now (next 3 days)
        v_alternatives := ARRAY[p_start + 1, p_start + 2, p_start + 3];
    END IF;

    RETURN jsonb_build_object(
        'result', v_result,
        'conflicts', COALESCE(to_jsonb(v_conflicts), '[]'::jsonb),
        'alternative_dates', COALESCE(to_jsonb(v_alternatives), '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE ALL ON FUNCTION check_availability(date, date, jsonb, uuid, uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_availability(date, date, jsonb, uuid, uuid) TO service_role;

