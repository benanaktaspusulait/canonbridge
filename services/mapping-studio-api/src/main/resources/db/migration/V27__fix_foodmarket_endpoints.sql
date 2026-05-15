-- Fix FoodMarket Order API: add proper endpoints matching the mock service.
-- The mock has GET /api/foodmarket/orders/{orderId} and GET /api/foodmarket/orders

UPDATE etl_outbound_connections
SET known_endpoints = '[
    {"path": "/api/foodmarket/orders/{orderId}", "method": "GET", "description": "Get order by ID"},
    {"path": "/api/foodmarket/orders", "method": "GET", "description": "List orders"}
]'::jsonb,
    updated_at = NOW()
WHERE connection_id = 'f7777777-7777-7777-7777-777777777777';
