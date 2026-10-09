-- Drafting agent_dispatch

CREATE OR REPLACE FUNCTION agent_dispatch(
    p_tool text,
    p_payload jsonb,
    p_idempotency_key text,
    p_channel text,
    p_client_ip text
) RETURNS jsonb AS $$
DECLARE
    v_response jsonb;
    v_status integer;
    v_linked_type text;
    v_linked_id uuid;
    v_req_status request_status := 'processed';
    v_err_msg text;
    v_start_time timestamp := clock_timestamp();
    v_duration_ms integer;
    v_conversation_id text := p_payload->>'conversation_id';
    v_rate_limit_key text := 'agent_ip_' || p_client_ip;
    v_rate_limit record;
BEGIN
    -- Rate limiting check
    SELECT * INTO v_rate_limit FROM rate_limits WHERE key = v_rate_limit_key FOR UPDATE;
    IF NOT FOUND THEN
        INSERT INTO rate_limits (key, points, reset_at) VALUES (v_rate_limit_key, 1, now() + interval '1 minute');
    ELSE
        IF v_rate_limit.reset_at < now() THEN
            UPDATE rate_limits SET points = 1, reset_at = now() + interval '1 minute' WHERE key = v_rate_limit_key;
        ELSE
            IF v_rate_limit.points >= 60 THEN
                RETURN jsonb_build_object('http_status', 429, 'body', jsonb_build_object('ok', false, 'status', 'error', 'message', 'Too many requests.', 'reference', null, 'data', null));
            ELSE
                UPDATE rate_limits SET points = points + 1 WHERE key = v_rate_limit_key;
            END IF;
        END IF;
    END IF;

    -- Idempotency check
    SELECT * INTO v_rate_limit FROM agent_requests WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        IF v_rate_limit.created_at > now() - interval '10 minutes' THEN
            RETURN jsonb_build_object('http_status', COALESCE(v_rate_limit.http_status, 200), 'body', v_rate_limit.response);
        END IF;
    END IF;

    BEGIN
        PERFORM set_config('app.actor', 'agent', true);

        IF p_tool = 'availability' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_availability(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'change-availability' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_change_availability(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'quote-request' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_quote_request(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'booking-request' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_booking_request(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'change-request' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_change_request(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'owner-consultation' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_owner_consultation(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'human-review' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_human_review(p_payload, v_conversation_id, p_channel);
        ELSIF p_tool = 'conversation-log' THEN
            SELECT response, status, linked_type, linked_id INTO v_response, v_status, v_linked_type, v_linked_id FROM agent_conversation_log(p_payload, v_conversation_id, p_channel);
        ELSE
            v_status := 422;
            v_response := jsonb_build_object('ok', false, 'status', 'error', 'message', 'Unknown tool.', 'reference', null, 'data', null);
        END IF;

    EXCEPTION WHEN OTHERS THEN
        v_err_msg := SQLERRM;
        v_status := 500;
        v_req_status := 'failed';
        v_response := jsonb_build_object('ok', false, 'status', 'error', 'message', 'I''m having trouble right now. The team will follow up.', 'reference', null, 'data', null);
        
        -- Create review item for agent error
        INSERT INTO review_items (kind, priority, reason, summary, conversation_id, channel, related_type, related_id)
        VALUES ('agent_error', 'high', 'SQL Error in agent_dispatch', v_err_msg, v_conversation_id, p_channel, 'tool', NULL)
        RETURNING id INTO v_linked_id;
        v_linked_type := 'review_items';
    END;

    v_duration_ms := extract(epoch from (clock_timestamp() - v_start_time)) * 1000;
    
    INSERT INTO agent_requests (idempotency_key, tool, channel, conversation_id, request, response, http_status, status, error, linked_type, linked_id, duration_ms)
    VALUES (p_idempotency_key, p_tool, p_channel, v_conversation_id, p_payload, v_response, v_status, v_req_status, v_err_msg, v_linked_type, v_linked_id, v_duration_ms);

    RETURN jsonb_build_object('http_status', v_status, 'body', v_response);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE ALL ON FUNCTION agent_dispatch(text, jsonb, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION agent_dispatch(text, jsonb, text, text, text) TO service_role;
