create or replace function public.fn_get_users_position_in_hierarchy(target_organization_id character varying, target_position_id character varying, search_text character varying DEFAULT NULL::character varying)
    returns TABLE(value character varying, label character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
        WITH RECURSIVE position_hierarchy AS (
            -- Start with the initial position
            SELECT id, name, position_id
            FROM positions
            WHERE id = target_position_id

            UNION ALL

            -- Recursive step: get parent positions
            SELECT p.id, p.name, p.position_id
            FROM positions p
                     INNER JOIN position_hierarchy ph ON p.id = ph.position_id
        ), users_in_hierarchy AS (
            -- Get all users for each position in the hierarchy and apply the search filter
            SELECT u.id::character varying as value, case when u.first_name is null then null else CONCAT(u.first_name, ' ', u.last_name, ' (', ph.name, ')') end::varchar as label
            FROM users u
                     INNER JOIN position_hierarchy ph ON u.position_id = ph.id
            WHERE (search_text IS NULL OR CONCAT(u.first_name, ' ', u.last_name) ILIKE '%' || search_text || '%')
              and u.organization_id = target_organization_id
        )

        -- Final result: all filtered users in the selected position hierarchy
        SELECT ui.value, ui.label FROM users_in_hierarchy ui;
END;
$$;

