CREATE PROCEDURE hris.sp_get_users_position_in_hierarchy(
    IN target_organization_id VARCHAR(255),
    IN target_position_id VARCHAR(255),
    IN search_text VARCHAR(255)
)
BEGIN
    -- temp table here
    CREATE TEMPORARY TABLE tmp_users (value VARCHAR(255), label VARCHAR(255));

    INSERT INTO tmp_users(value, label)
    SELECT * FROM (
        WITH RECURSIVE position_hierarchy AS (
            SELECT id, name, position_id
            FROM positions
            WHERE id = target_position_id
            UNION ALL
            SELECT p.id, p.name, p.position_id
            FROM positions p
            INNER JOIN position_hierarchy ph ON p.id = ph.position_id
        )
        SELECT 
            u.id,
            CASE WHEN u.first_name IS NULL THEN NULL 
                 ELSE CONCAT(u.first_name, ' ', u.last_name, ' (', ph.name, ')') 
            END
        FROM users u
        INNER JOIN position_hierarchy ph ON u.position_id = ph.id
        WHERE (search_text IS NULL OR CONCAT(u.first_name, ' ', u.last_name) LIKE CONCAT('%', search_text, '%'))
        AND u.organization_id = target_organization_id
    ) AS derived_table;

    SELECT * FROM tmp_users;

    DROP TEMPORARY TABLE tmp_users;
END
