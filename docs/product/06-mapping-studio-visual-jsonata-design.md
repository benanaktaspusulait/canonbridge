# CanonBridge Mapping Studio UI — comprehensive visual JSONata design

> This document describes the Mapping Studio user interface and how JSONata
> capabilities are exposed visually. Goal: users can design mappings without knowing JSONata;
> advanced users can still write JSONata with a custom formula mode when needed.
>
> Date: May 10, 2026

## Table of contents

1. [Core principle](#1-core-principle)
2. [Screen designs](#2-screen-designs)
3. [Transform types](#3-transform-types)
4. [Visual equivalents of JSONata capabilities](#4-visual-equivalents-of-jsonata-capabilities)
5. [JSONata Generator Service API](#5-jsonata-generator-service-api)
6. [User types and permissions](#6-user-types-and-permissions)
7. [Custom formula mode](#7-custom-formula-mode)
8. [Testing and validation](#8-testing-and-validation)
9. [Architecture impact](#9-architecture-impact)

## 1. Core principle

```text
The user does not know, write, or see JSONata (unless they want to).
All core JSONata capabilities are available through visual choices.
Advanced users can write JSONata in Custom Formula mode.
Every visual selection becomes a versioned visual_config and JSONata script in the background.
```

Mapping Studio offers a two-level product experience:

- **No-code mode**: Business analysts and operations users select fields, pick a transform type, and see preview/test results.
- **Advanced mode**: Integration developers and admins see the JSONata script, write custom formulas in the editor, and inspect helper usage.

### JSONata notation

This document uses two notations:

- **Native JSONata**: Expression that runs directly in the runtime.
- **Generator helper**: Intermediate concept in the UI for readability. It must compile to native JSONata before runtime, or be registered as a controlled custom function in the transformer runtime.

Example: the UI “Enum mapping” panel can be thought of like `$switch` in product language, but the generated script should use native JSONata lookup/conditional.

## 2. Screen designs

### 2.1 Main screen: mapping list

```text
+----------------------------------------------------------------------------+
| CanonBridge Mapping Studio                                   [Admin] [Exit] |
|                                                                            |
| Partner [CompanyA v]   Event [OrderCreated v]   Version [v3 active v]       |
|                                                                            |
| + Source Schema ----------------+  + Mapping List ------------------------+ |
| | order_header                  |  | # Target Field     Source       Act | |
| |   order_id: string            |  | 1 orderId          order_id      E  | |
| |   order_date: string          |  | 2 customerName     full_name     E  | |
| |   customer                    |  | 3 customerEmail    email         E  | |
| |     full_name                 |  | 4 orderDate        order_date    E  | |
| |     email                     |  | 5 status           status        E  | |
| |   items[]                     |  | 6 lines[]          items[]       E  | |
| |     item_id                   |  | 7 totalAmount      total         E  | |
| |     qty: string               |  |                                      | |
| +-------------------------------+  | [+ Add Mapping]                      | |
|                                    +--------------------------------------+ |
|                                                                            |
| + Target Schema: Canonical Order -----------------------------------------+ |
| | orderId: string required                                                | |
| | customerName: string required                                           | |
| | customerEmail: string optional                                          | |
| | orderDate: string ISO8601                                               | |
| | status: ACTIVE | INACTIVE | UNKNOWN                                     | |
| | lines[].lineId, productId, quantity, unitPrice                          | |
| +--------------------------------------------------------------------------+ |
|                                                                            |
| [Load Sample] [Test All] [Save Draft] [Submit Review] [Publish]             |
+----------------------------------------------------------------------------+
```

The main screen’s job is to show three things at once:

- Source JSON tree
- Canonical target schema
- Active mapping rules and validation state

### 2.2 Mapping edit screen

```text
+----------------------------------------------------------------------------+
| Edit Mapping: orderId                                                       |
|                                                                            |
| Source field                                                                |
| [order_header > order_id                                      Search v]     |
| or JSON path                                                                |
| [order_header.order_id                                                ]     |
|                                                                            |
| Transform type                                                              |
| [Direct Mapping                                                v]           |
|                                                                            |
| Dynamic configuration                                                       |
| Source value is copied to target without additional transformation.          |
|                                                                            |
| Target field                                                                |
| orderId: string required                                                    |
|                                                                            |
| Preview                                                                     |
| Input  { "order_header": { "order_id": "ORD-123" } }                        |
| Output { "orderId": "ORD-123" }                                             |
|                                                                            |
| [Cancel] [Test] [Save]                                                      |
+----------------------------------------------------------------------------+
```

The mapping editor defines how a single target field is produced. Every editor form emits the same contract:

```json
{
  "targetPath": "orderId",
  "sourcePath": "order_header.order_id",
  "transformType": "direct",
  "config": {}
}
```

### 2.3 Transform type picker

The transform type selector should support:

- Direct mapping
- Constant value
- Format conversion
- Enum mapping
- Default value
- Conditional value
- Concatenation
- Mathematical operation
- String operation
- Array operation
- Nested object
- Lookup
- Advanced JSONata formula

## 3. Transform types

### 3.1 Direct mapping

The source field is copied as-is to the target field.

```jsonata
order_header.order_id
```

Visual panel:

| Field | Control |
|------|---------|
| Source field | SourceFieldSelector |
| Target field | TargetFieldSelector |
| Null behavior | Optional: pass-through, null, error |

### 3.2 Format conversion

Format conversion covers date, number, text, and boolean categories.

#### Date conversion

Visual panel:

| Setting | Values |
|------|----------|
| Input format | ISO 8601, Unix ms, Unix seconds, custom picture |
| Output format | ISO 8601, Unix ms, custom picture |
| Timezone | Preserve, UTC, selected timezone |

Native JSONata example:

```jsonata
$fromMillis($toMillis(order_header.order_date, "[Y0001]-[M01]-[D01]"))
```

For Unix seconds input:

```jsonata
$fromMillis($number(order_header.created_at) * 1000)
```

#### Number conversion

Visual panel:

| Setting | Values |
|------|----------|
| Target type | number, integer, decimal string |
| Rounding | floor, ceil, round, none |
| Decimal places | integer input |

Native JSONata example:

```jsonata
$floor($number(item.qty))
```

For decimal output:

```jsonata
$round($number(item.price), 2)
```

### 3.3 Enum mapping

Source enum values are mapped to canonical enum values.

Visual panel:

| Field | Control |
|------|---------|
| Mapping table | from/to editable rows |
| Unmatched behavior | default value, error, pass-through, null |
| Case sensitivity | checkbox |

Native JSONata example:

```jsonata
(
  $mapped := $lookup({
    "A": "ACTIVE",
    "B": "INACTIVE",
    "C": "SUSPENDED"
  }, status);
  $exists($mapped) ? $mapped : "UNKNOWN"
)
```

When the outcome should land in DLQ, the generator may use a runtime helper:

```jsonata
(
  $mapped := $lookup({"A": "ACTIVE", "B": "INACTIVE"}, status);
  $exists($mapped) ? $mapped : $error("Unknown status: " & status)
)
```

### 3.4 Default value

When the source field is empty, null, or missing, an alternate value is produced.

Visual panel:

| Setting | Values |
|------|----------|
| Strategy | constant, fallback field, null, error |
| Nullish values | null, empty string, missing, zero, false |
| Constant value | typed input |

Native JSONata example:

```jsonata
($exists(customer.email) and customer.email != "") ? customer.email : "no-reply@test.com"
```

Fallback field example:

```jsonata
($exists(customer.email) and customer.email != "") ? customer.email : customer.backup_email
```

### 3.5 Conditional value

If/else, else-if chains, and compound conditions are supported.

Visual panel:

| Field | Control |
|------|---------|
| IF field | SourceFieldSelector |
| Operator | equals, notEquals, gt, gte, lt, lte, contains, exists, regex |
| Compare value | constant or field |
| THEN result | constant, field, formula |
| ELSE result | constant, field, formula |

Native JSONata example:

```jsonata
order_detail.total_amount > 1000 ? "HIGH" : "NORMAL"
```

Else-if example:

```jsonata
order_detail.total_amount > 10000 ? "CRITICAL" :
order_detail.total_amount > 1000 ? "HIGH" :
order_detail.total_amount > 100 ? "MEDIUM" :
"LOW"
```

### 3.6 Field concatenation

Multiple fields and literal text are combined into one string.

Visual panel:

| Field | Control |
|------|---------|
| Parts | ordered field/constant rows |
| Separator | none, space, comma, dash, custom |
| Skip empty | checkbox |
| Trim result | checkbox |

Native JSONata example:

```jsonata
customer.address_line1 & ", " & customer.city & ", " & customer.country
```

Example skipping empty fields:

```jsonata
$join(
  [
    customer.address_line1,
    customer.city,
    customer.country
  ][$exists($) and $ != ""],
  ", "
)
```

### 3.7 Mathematical operation

Addition, subtraction, multiplication, division, mod, rounding, and array aggregates are supported.

Visual panel:

| Setting | Values |
|------|----------|
| Operation | add, subtract, multiply, divide, mod, sum, min, max, average |
| Operands | field, constant, array field |
| Output rounding | none, floor, ceil, round |
| Decimal places | integer input |

Native JSONata example:

```jsonata
$round($number(item.qty) * $number(item.price), 2)
```

Array sum example:

```jsonata
$sum(order_detail.line_items.($number(price)))
```

### 3.8 String operation

Normalize, clean, split, and regex operations are supported.

Visual panel:

| Operation | Native JSONata pattern |
|-----------|------------------------|
| Uppercase | `$uppercase(customer.name)` |
| Lowercase | `$lowercase(customer.name)` |
| Trim | `$trim(customer.name)` |
| Replace | `$replace(customer.phone, "+90", "")` |
| Substring | `$substring(product_code, 0, 8)` |
| Split | `$split(tags, ",")` |
| Length | `$length(customer.name)` |
| Contains | `$contains(customer.email, "@")` |
| Regex match | `$match(customer.email, /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)` |

Title case is not a built-in in native JSONata. The generator should register a custom helper or expose a limited helper set under Advanced Formula.

### 3.9 Array operations

Array map, filter, sort, count, sum, distinct, first, last, and nth are supported.

#### Map

```jsonata
order_detail.line_items.{
  "lineId": item_identifier,
  "productId": product_code,
  "quantity": $number(qty),
  "unitPrice": $number(price),
  "lineTotal": $number(qty) * $number(price)
}
```

#### Filter + map

```jsonata
order_detail.line_items[status = "ACTIVE"].{
  "lineId": item_identifier,
  "productId": product_code,
  "quantity": $number(qty)
}
```

#### Sort

In JSONata order-by, `<` is ascending and `>` is descending.

```jsonata
order_detail.line_items^(<created_at)
```

Descending:

```jsonata
order_detail.line_items^(>created_at)
```

#### First, last, nth

```jsonata
order_detail.line_items[0].product_code
```

```jsonata
order_detail.line_items[-1].product_code
```

```jsonata
order_detail.line_items[3].product_code
```

### 3.10 Nested object

When the target field is an object, child field mappings use the same editor model.

```jsonata
{
  "shippingAddress": {
    "line1": delivery.address_line1,
    "city": delivery.city,
    "country": (
      $mapped := $lookup({"TR": "TURKEY", "DE": "GERMANY"}, delivery.country_code);
      $exists($mapped) ? $mapped : delivery.country_code
    )
  }
}
```

### 3.11 Lookup

Lookup can be offered in two ways:

- **Static lookup**: lookup table inside mapping config.
- **Managed lookup**: versioned reference data at runtime.

Static lookup example:

```jsonata
$lookup({
  "P100": "PRODUCT-100",
  "P200": "PRODUCT-200"
}, item.product_code)
```

Managed lookup requires a generator helper:

```jsonata
$lookupRef("product-catalog", item.product_code)
```

`$lookupRef` is not native JSONata; it must be added to the transformer runtime as a custom function.

## 4. Visual equivalents of JSONata capabilities

| # | JSONata capability | Visual equivalent | Transform type | Note |
|---|------------------|-----------------|--------------|-----|
| 1 | `field` | Source field selection | Direct mapping | Native |
| 2 | `"string"`, `123`, `true` | Constant value | Constant value | Native |
| 3 | `$number(value)` | Number conversion | Format conversion | Native |
| 4 | `$string(value)` | Text conversion | Format conversion | Native |
| 5 | `$boolean(value)` | Boolean conversion | Format conversion | Native |
| 6 | `$toMillis(date, picture)` | Date parse | Format conversion | Native |
| 7 | `$fromMillis(ms, picture, timezone)` | Date format | Format conversion | Native |
| 8 | `$now()` | Current time | Constant/date | Native |
| 9 | `$millis()` | Current time ms | Constant/date | Native |
| 10 | `$lookup(obj, key)` | Enum/lookup | Enum mapping | Native |
| 11 | `$exists(value)` | Missing/null check | Default/condition | Native |
| 12 | `condition ? then : else` | If/else | Conditional value | Native |
| 13 | `a & b` | Field concatenation | Concatenation | Native |
| 14 | `$join(array, sep)` | Array join | Concatenation | Native |
| 15 | `+ - * / %` | Math | Mathematical operation | Native |
| 16 | `$round`, `$floor`, `$ceil`, `$abs` | Rounding | Mathematical operation | Native |
| 17 | `$uppercase`, `$lowercase` | Case conversion | String operation | Native |
| 18 | `$trim`, `$pad` | Padding/whitespace | String operation | Native |
| 19 | `$replace` | Replace | String operation | Native |
| 20 | `$substring` | Substring | String operation | Native |
| 21 | `$split` | Split | String operation | Native |
| 22 | `$length` | Length | String operation | Native |
| 23 | `$match` | Regex match | String operation | Native |
| 24 | `$contains` | Contains | String operation | Native |
| 25 | `array.{...}` | Transform each element | Array map | Native |
| 26 | `array[condition]` | Filter | Array filter | Native |
| 27 | `array^(<field)` | Sort ascending | Array sort | Native |
| 28 | `array^(>field)` | Sort descending | Array sort | Native |
| 29 | `$count(array)` | Element count | Array count | Native |
| 30 | `$sum(array.field)` | Sum | Array sum | Native |
| 31 | `$max`, `$min` | Max/min | Array aggregate | Native |
| 32 | `$average` | Average | Array aggregate | Native |
| 33 | `$distinct` | Distinct | Array distinct | Native |
| 34 | `array[n]` | Specific index | Array nth | Native |
| 35 | `array[0]`, `array[-1]` | First/last element | Array first/last | Native |
| 36 | `{ "key": value }` | Nested object | Nested object | Native |
| 37 | `$merge([obj1, obj2])` | Merge objects | Nested object | Native |
| 38 | `$keys(obj)` | Field list | Advanced formula | Native |
| 39 | `$type(value)` | Type check | Advanced formula | Native |
| 40 | `$error(message)` | Raise error | Advanced formula | Native |
| 41 | `$assert(condition, message)` | Assertion | Advanced formula | Native |
| 42 | `$eval(expr)` | Dynamic evaluation | Advanced formula | Risky, default off |
| 43 | `$lookupRef(table, key)` | Managed reference lookup | Lookup | Custom helper |
| 44 | `$titlecase(value)` | Title case | String operation | Custom helper |

## 5. JSONata Generator Service API

### 5.1 Generate endpoint

```http
POST /api/mapping/generate
```

Request:

```json
{
  "partnerId": "companyA",
  "eventType": "OrderCreated",
  "schemaVersion": "v1",
  "mappings": [
    {
      "id": "mapping-001",
      "targetPath": "orderId",
      "sourcePath": "order_header.order_id",
      "transformType": "direct"
    },
    {
      "id": "mapping-002",
      "targetPath": "orderDate",
      "sourcePath": "order_header.order_date",
      "transformType": "formatConversion",
      "formatConfig": {
        "category": "date",
        "inputFormat": "custom:[Y0001]-[M01]-[D01]",
        "outputFormat": "iso8601",
        "timezone": "UTC"
      }
    },
    {
      "id": "mapping-003",
      "targetPath": "status",
      "sourcePath": "status",
      "transformType": "enumMapping",
      "enumConfig": {
        "mappings": [
          { "from": "A", "to": "ACTIVE" },
          { "from": "B", "to": "INACTIVE" },
          { "from": "C", "to": "SUSPENDED" }
        ],
        "unmatched": "defaultValue",
        "defaultValue": "UNKNOWN"
      }
    },
    {
      "id": "mapping-004",
      "targetPath": "customerEmail",
      "sourcePath": "customer.email",
      "transformType": "defaultValue",
      "defaultConfig": {
        "strategy": "constant",
        "constantValue": "no-reply@test.com",
        "nullishValues": ["null", "emptyString", "missing"]
      }
    },
    {
      "id": "mapping-005",
      "targetPath": "priority",
      "transformType": "conditional",
      "conditionalConfig": {
        "conditions": [
          {
            "field": "order_detail.total_amount",
            "operator": "gt",
            "value": 10000,
            "result": "CRITICAL",
            "resultType": "constant"
          },
          {
            "field": "order_detail.total_amount",
            "operator": "gt",
            "value": 1000,
            "result": "HIGH",
            "resultType": "constant"
          }
        ],
        "elseResult": "LOW",
        "elseResultType": "constant"
      }
    },
    {
      "id": "mapping-006",
      "targetPath": "fullAddress",
      "transformType": "concatenation",
      "concatConfig": {
        "parts": [
          { "type": "field", "value": "customer.address_line1" },
          { "type": "constant", "value": ", " },
          { "type": "field", "value": "customer.city" },
          { "type": "constant", "value": ", " },
          { "type": "field", "value": "customer.country" }
        ],
        "skipEmpty": true
      }
    },
    {
      "id": "mapping-007",
      "targetPath": "lines",
      "sourcePath": "order_detail.line_items",
      "transformType": "arrayMap",
      "arrayConfig": {
        "preFilter": {
          "field": "status",
          "operator": "equals",
          "value": "ACTIVE"
        },
        "sortBy": {
          "field": "created_at",
          "direction": "asc"
        },
        "childMappings": [
          {
            "targetPath": "lineId",
            "sourcePath": "item_identifier",
            "transformType": "direct"
          },
          {
            "targetPath": "quantity",
            "sourcePath": "qty",
            "transformType": "formatConversion",
            "formatConfig": {
              "category": "number",
              "targetType": "integer",
              "rounding": "floor"
            }
          },
          {
            "targetPath": "lineTotal",
            "transformType": "mathematical",
            "mathConfig": {
              "operation": "multiply",
              "operands": [
                { "type": "field", "value": "qty" },
                { "type": "field", "value": "price" }
              ],
              "decimalPlaces": 2
            }
          }
        ]
      }
    }
  ]
}
```

Response:

```json
{
  "jsonata": "{ ... }",
  "jsonataHash": "sha256:...",
  "testResult": {
    "success": true,
    "output": {},
    "validationPassed": true,
    "durationMs": 5,
    "warnings": []
  },
  "stats": {
    "totalMappings": 7,
    "directCount": 1,
    "formatCount": 1,
    "enumCount": 1,
    "defaultCount": 1,
    "conditionalCount": 1,
    "concatCount": 1,
    "arrayCount": 1
  }
}
```

### 5.2 Test endpoint

```http
POST /api/mapping/test
```

Request:

```json
{
  "jsonata": "{...}",
  "sampleInput": {
    "order_header": {
      "order_id": "ORD-123"
    }
  },
  "canonicalSchema": "schemas/canonical/order-created.v1.schema.json"
}
```

Response:

```json
{
  "success": true,
  "output": {},
  "validationPassed": true,
  "validationErrors": [],
  "durationMs": 3
}
```

### 5.3 Save draft endpoint

```http
POST /api/mapping-drafts
```

Request:

```json
{
  "partnerId": "companyA",
  "eventType": "OrderCreated",
  "canonicalSchemaVersion": "v1",
  "visualConfig": {},
  "jsonataScript": "{...}",
  "fixtures": []
}
```

### 5.4 Publish endpoint

```http
POST /api/mapping-drafts/{draftId}/publish
```

Before publish:

- JSONata syntax validation must pass.
- At least one valid fixture must pass.
- Required canonical fields must be mapped or explicitly waived.
- Generated artifacts must match the transformer service layout.
- Admin or lead developer approval must be recorded.

## 6. User types and permissions

| Role | Permissions |
|-----|----------|
| Business analyst | View mapping list, add/edit mappings, test, save draft. Cannot see JSONata. Cannot publish. |
| Integration developer | Business analyst permissions + Advanced Formula mode + view generated JSONata + delete mappings. |
| Lead developer / admin | Everything + publish approval + version management + user/permission management. |

## 7. Custom formula mode

Advanced Formula mode should only be enabled for authorized roles.

```text
+--------------------------------------------------------------------------+
| Transform type: Advanced JSONata Formula                                 |
|                                                                          |
| JSONata editor                                                           |
| 1 | order_detail.total_amount > 1000 ? "HIGH" : "NORMAL"                 |
|                                                                          |
| Source references                                                        |
| - order_detail.line_items                                                |
| - order_detail.total_amount                                              |
| - customer.email                                                         |
|                                                                          |
| [Test] [Save]                                                            |
+--------------------------------------------------------------------------+
```

Editor expectations:

- Syntax highlighting
- Autocomplete for source fields
- Autocomplete for approved JSONata functions
- Warnings for unsafe functions
- Read-only generated JSONata preview for no-code mappings
- Diff view between generated formula versions

`$eval` and similar dynamic functions should be off by default. If enabled, require feature flag, role permission, and audit logging.

## 8. Testing and validation

### 8.1 Test flow

```text
User edits mapping
        |
        v
Test button
        |
        v
POST /api/mapping/test
        |
        v
JSONata evaluate + canonical schema validation
        |
        v
UI shows result
```

Result states:

- **Pass**: Output conforms to canonical schema.
- **Warning**: Output is valid but has risky empty fields, fallbacks, or pass-through.
- **Fail**: JSONata syntax/runtime error or canonical validation error.

### 8.2 Sample data sources

| Source | Usage |
|--------|-----------|
| Manual JSON | User enters sample in the editor. |
| Uploaded sample | Partner payload file uploaded. |
| Recent messages | Last N partner messages used for testing. |
| DLQ messages | Failed payloads opened to fix mappings. |
| Saved fixtures | Stored as regression scenarios. |

### 8.3 Fixture types

- Happy path
- Missing optional fields
- Invalid format
- Empty array
- Null values
- Very long string
- Negative number
- Unknown enum
- Duplicate line item

### 8.4 Quality gates

Minimum gates before publish:

- JSONata syntax valid.
- Generated JSONata deterministic.
- Required canonical fields covered.
- At least one valid fixture passed.
- Invalid fixture cases fail as expected.
- Runtime duration under threshold.
- PII masking active in preview/test logs.
- Audit log entry created.

## 9. Architecture impact

### 9.1 New UI components

```text
canonbridge-ui/
  src/
    components/
      layouts/
        MappingStudioLayout.tsx
      mapping/
        MappingList.tsx
        MappingEditor.tsx
        MappingRow.tsx
      selectors/
        SourceFieldSelector.tsx
        TargetFieldSelector.tsx
        TransformTypeSelector.tsx
      transforms/
        DirectMapping.tsx
        FormatConversion.tsx
        EnumMapping.tsx
        DefaultValue.tsx
        ConditionalValue.tsx
        Concatenation.tsx
        MathematicalOp.tsx
        StringOperation.tsx
        ArrayOperations.tsx
        NestedObject.tsx
        LookupMapping.tsx
        AdvancedFormula.tsx
      test/
        TestPanel.tsx
        TestResultViewer.tsx
        DiffViewer.tsx
        SampleDataManager.tsx
      common/
        FieldTree.tsx
        JsonEditor.tsx
        JsonataEditor.tsx
        ValidationBadge.tsx
```

### 9.2 New backend components

```text
partner-transformer-service/
  src/
    services/
      jsonata-generator.ts
      mapping-studio-api.ts
      mapping-storage.ts
      mapping-validator.ts
    routes/
      mapping-studio.routes.ts
    types/
      mapping-studio.ts
```

### 9.3 Data flow

```text
User
  -> visual selections
Mapping Studio UI
  -> POST /api/mapping/generate
JSONata Generator Service
  -> generated JSONata
  -> POST /api/mapping/test
Test and Validation
  -> UI preview
User approval
  -> save draft
Admin approval
  -> publish immutable version
Transformer
  -> mapping cache refresh
```

### 9.4 Mapping storage

```sql
CREATE TABLE mapping_definitions (
    id UUID PRIMARY KEY,
    partner_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    visual_config JSONB NOT NULL,
    jsonata_script TEXT,
    jsonata_script_hash VARCHAR(64),
    author VARCHAR(100),
    published_by VARCHAR(100),
    published_at TIMESTAMP,
    git_commit_hash VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mapping_test_results (
    id UUID PRIMARY KEY,
    mapping_id UUID REFERENCES mapping_definitions(id),
    sample_input JSONB,
    sample_output JSONB,
    validation_passed BOOLEAN,
    validation_errors JSONB,
    duration_ms INTEGER,
    tested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tested_by VARCHAR(100)
);
```

### 9.5 Implementation order

1. Define the visual config type model.
2. Implement generators for direct, default, enum, conditional, string, and math.
3. Add array map/filter/sort generators.
4. Add nested object composition.
5. Wire the test endpoint to JSONata evaluate + schema validation.
6. Build source tree, target schema, and mapping editor panels in the UI.
7. Gate the Advanced Formula editor by role.
8. Add publish gates and audit logging.

## Closing note

The product promise of Mapping Studio is not to hide JSONata, but to channel JSONata’s power into a safe, repeatable product experience. For business analysts the system should feel as simple as “pick field, pick rule, test”; for integration developers, generated JSONata, fixtures, validation, and the publish pipeline must remain fully controllable.
