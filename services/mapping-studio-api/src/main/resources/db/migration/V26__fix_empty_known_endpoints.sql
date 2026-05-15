-- Fix connections with empty known_endpoints: populate from their base URL.
-- Without known_endpoints, the wizard endpoint selector dropdown is empty.

UPDATE etl_outbound_connections
SET known_endpoints = jsonb_build_array(
    jsonb_build_object(
        'path', regexp_replace(url, '^https?://[^/]+', ''),
        'method', COALESCE(method, 'GET'),
        'description', name
    )
),
    updated_at = NOW()
WHERE (known_endpoints IS NULL OR known_endpoints = '[]'::jsonb OR known_endpoints::text = 'null')
  AND url IS NOT NULL
  AND url != '';
