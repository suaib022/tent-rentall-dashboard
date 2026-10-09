CREATE OR REPLACE FUNCTION check_availability(
    p_start date,
    p_end date,
    p_items jsonb,
    p_exclude_event uuid DEFAULT NULL
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
    WHERE start_date <= p_end AND end_date >= p_start;
    
    IF v_block_count > 0 THEN
        v_result := 'not_available';
        v_conflicts := array_append(v_conflicts, 'Dates are blocked by management.');
    END IF;

    -- Check installs per day
    SELECT (value->>0)::integer INTO v_max_installs FROM settings WHERE key = 'max_installs_per_day';
    SELECT count(*) INTO v_install_count
    FROM events
    WHERE kind = 'rental' AND status != 'cancelled' AND deleted_at IS NULL
    AND start_at::date = p_start AND (p_exclude_event IS NULL OR id != p_exclude_event);
    
    IF v_install_count >= COALESCE(v_max_installs, 3) THEN
        v_result := 'needs_review';
        v_conflicts := array_append(v_conflicts, 'Maximum installs per day reached.');
    END IF;

    -- Find alternatives if blocked
    IF v_result = 'not_available' THEN
        v_alternatives := ARRAY[p_start + 7, p_start + 14];
    END IF;

    RETURN jsonb_build_object(
        'result', v_result,
        'conflicts', COALESCE(to_jsonb(v_conflicts), '[]'::jsonb),
        'alternative_dates', COALESCE(to_jsonb(v_alternatives), '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_change_request(p_cr_id uuid)
RETURNS boolean AS $$
BEGIN
    UPDATE change_requests SET status = 'applied', applied_at = now() WHERE id = p_cr_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql;
