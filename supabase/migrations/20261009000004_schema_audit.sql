CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
DECLARE
    actor_id uuid;
    actor_label text;
    diff jsonb;
    row_id uuid;
BEGIN
    actor_id := auth.uid();
    IF actor_id IS NULL THEN
        actor_label := 'agent or system';
    ELSE
        SELECT email INTO actor_label FROM auth.users WHERE id = actor_id;
    END IF;

    IF TG_OP = 'INSERT' THEN
        row_id := NEW.id;
        diff := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        row_id := NEW.id;
        diff := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        row_id := OLD.id;
        diff := to_jsonb(OLD);
    END IF;

    INSERT INTO audit_log (actor_id, actor_label, table_name, row_id, action, diff)
    VALUES (actor_id, actor_label, TG_TABLE_NAME, row_id, TG_OP, diff);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_quote_requests AFTER INSERT OR UPDATE OR DELETE ON quote_requests FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_events AFTER INSERT OR UPDATE OR DELETE ON events FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_change_requests AFTER INSERT OR UPDATE OR DELETE ON change_requests FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_review_items AFTER INSERT OR UPDATE OR DELETE ON review_items FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
