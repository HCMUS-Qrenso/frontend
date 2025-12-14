# Tables Management API Documentation

## Overview

API documentation for managing restaurant tables, including CRUD operations, floor plan layout management, statistics, and QR code generation. All endpoints require authentication and enforce multi-tenant isolation.

**Base URL:** `/api/tables`  
**Authentication:** Bearer JWT Token (tenant context extracted from token)  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Tables List & Statistics](#1-tables-list--statistics-apis)
3. [Table CRUD Operations](#2-table-crud-apis)
4. [Floor Plan Layout Management](#3-floor-plan-layout-apis)
5. [QR Code Management](#4-qr-code-management-apis)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Database Operations Reference](#database-operations-reference)

---

## Authentication & Authorization

All endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The JWT token must contain:

- `tenant_id`: UUID of the restaurant/tenant
- `user_id`: UUID of the authenticated user
- `role`: User role (admin, owner, waiter, etc.)

**Required Roles:**

- Table CRUD: `admin`, `owner`
- View tables/stats: `admin`, `owner`, `waiter`
- QR management: `admin`, `owner`

---

## 1. Tables List & Statistics APIs

### 1.1. Get Tables List

Get a paginated list of tables with filtering options.

**Endpoint:** `GET /api/tables`

**Query Parameters:**

| Parameter   | Type    | Required | Description                                                          |
| ----------- | ------- | -------- | -------------------------------------------------------------------- |
| `page`      | integer | No       | Page number (default: 1)                                             |
| `limit`     | integer | No       | Items per page (default: 10, max: 100)                               |
| `search`    | string  | No       | Search by table number or floor/area name                            |
| `floor`     | string  | No       | Filter by floor/area (e.g., "Tầng 1", "Tầng 2")                      |
| `status`    | string  | No       | Filter by status: `available`, `occupied`, `reserved`, `maintenance` |
| `is_active` | boolean | No       | Filter by active status                                              |

**Request Example:**

```http
GET /api/tables?page=1&limit=10&search=Table%201&floor=Tầng%201&status=available
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "table_number": "1",
        "capacity": 4,
        "floor": "Tầng 1",
        "shape": "rectangle",
        "status": "available",
        "is_active": true,
        "position": {
          "x": 100,
          "y": 200,
          "rotation": 0,
          "width": 120,
          "height": 80
        },
        "current_order": null,
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "table_number": "2",
        "capacity": 6,
        "floor": "Tầng 1",
        "shape": "round",
        "status": "occupied",
        "is_active": true,
        "position": {
          "x": 300,
          "y": 200,
          "rotation": 45,
          "width": 120,
          "height": 120
        },
        "current_order": {
          "order_number": "ORD-20250115-001",
          "total_amount": 450000,
          "status": "in_progress"
        },
        "created_at": "2025-01-15T10:35:00Z",
        "updated_at": "2025-01-15T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "total_pages": 5
    }
  }
}
```

**Database Query:**

```sql
SELECT
  t.*,
  json_build_object(
    'x', (t.position::json->>'x')::int,
    'y', (t.position::json->>'y')::int,
    'rotation', COALESCE((t.position::json->>'rotation')::int, 0),
    'width', COALESCE((t.position::json->>'width')::int, 100),
    'height', COALESCE((t.position::json->>'height')::int, 100)
  ) as position,
  CASE
    WHEN t.status = 'occupied' THEN json_build_object(
      'order_number', o.order_number,
      'total_amount', o.total_amount,
      'status', o.status
    )
    ELSE NULL
  END as current_order
FROM tables t
LEFT JOIN orders o ON o.table_id = t.id
  AND o.status NOT IN ('completed', 'cancelled', 'abandoned')
  AND o.created_at = (
    SELECT MAX(created_at)
    FROM orders
    WHERE table_id = t.id
    AND status NOT IN ('completed', 'cancelled', 'abandoned')
  )
WHERE t.tenant_id = $1  -- from JWT token
  AND ($2::text IS NULL OR t.table_number ILIKE '%' || $2 || '%' OR t.floor ILIKE '%' || $2 || '%')
  AND ($3::text IS NULL OR t.floor = $3)
  AND ($4::text IS NULL OR t.status = $4)
  AND ($5::boolean IS NULL OR t.is_active = $5)
ORDER BY t.table_number
LIMIT $6 OFFSET $7;
```

---

### 1.2. Get Tables Statistics

Get overview statistics for tables.

**Endpoint:** `GET /api/tables/stats`

**Query Parameters:** None

**Request Example:**

```http
GET /api/tables/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "total_tables": 42,
    "available_tables": 18,
    "occupied_tables": 20,
    "waiting_for_payment": 4,
    "maintenance_tables": 0,
    "inactive_tables": 2
  }
}
```

**Database Query:**

```sql
SELECT
  COUNT(*) FILTER (WHERE is_active = true) as total_tables,
  COUNT(*) FILTER (WHERE status = 'available' AND is_active = true) as available_tables,
  COUNT(*) FILTER (WHERE status = 'occupied' AND is_active = true) as occupied_tables,
  COUNT(*) FILTER (
    WHERE status = 'occupied' AND is_active = true
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.table_id = tables.id
      AND o.status IN ('ready', 'served')
    )
  ) as waiting_for_payment,
  COUNT(*) FILTER (WHERE status = 'maintenance' AND is_active = true) as maintenance_tables,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_tables
FROM tables
WHERE tenant_id = $1;  -- from JWT token
```

---

## 2. Table CRUD APIs

### 2.1. Create Table

Create a new table.

**Endpoint:** `POST /api/tables`

**Request Body Schema:**

```json
{
  "table_number": "string (required, max 20 chars, unique per tenant)",
  "capacity": "integer (required, min: 1, max: 50)",
  "floor": "string (required, max 100 chars)",
  "shape": "string (required, enum: 'circle' | 'rectangle' | 'oval')",
  "status": "string (optional, enum: 'available' | 'occupied' | 'reserved' | 'maintenance', default: 'available')",
  "is_active": "boolean (optional, default: true)",
  "position": {
    "x": "integer (optional, default: 0)",
    "y": "integer (optional, default: 0)",
    "rotation": "integer (optional, default: 0, 0-360)",
    "width": "integer (optional, default: 100)",
    "height": "integer (optional, default: 100)"
  },
  "auto_generate_qr": "boolean (optional, default: false)"
}
```

**Request Example:**

```json
{
  "table_number": "VIP-01",
  "capacity": 8,
  "floor": "Tầng 2",
  "shape": "round",
  "status": "available",
  "is_active": true,
  "position": {
    "x": 200,
    "y": 300,
    "rotation": 0,
    "width": 140,
    "height": 140
  },
  "auto_generate_qr": true
}
```

**Response Schema (201 Created):**

```json
{
  "success": true,
  "message": "Table created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "table_number": "VIP-01",
    "capacity": 8,
    "floor": "Tầng 2",
    "shape": "round",
    "status": "available",
    "is_active": true,
    "position": {
      "x": 200,
      "y": 300,
      "rotation": 0,
      "width": 140,
      "height": 140
    },
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://app.smartrestaurant.com/joes-diner/menu?table=...",
    "ordering_url": "https://app.smartrestaurant.com/joes-diner/menu?table=...&token=...",
    "created_at": "2025-01-15T15:00:00Z",
    "updated_at": "2025-01-15T15:00:00Z"
  }
}
```

**Validation Rules:**

- `table_number`: Required, max 20 characters, must be unique per tenant
- `capacity`: Required, must be between 1 and 50
- `floor`: Required, max 100 characters
- `shape`: Must be one of: `circle`, `rectangle`, `oval`
- `status`: Must be one of: `available`, `occupied`, `reserved`, `maintenance`

**Business Logic:**

1. Check if `table_number` already exists for this tenant
2. If `auto_generate_qr` is true, generate QR code after table creation
3. Store `position` as JSON string in database
4. Set default `position` if not provided

**Database Operations:**

```sql
-- Insert table
INSERT INTO tables (
  tenant_id, table_number, capacity, floor, shape,
  status, is_active, position, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW(), NOW()
) RETURNING *;

-- If auto_generate_qr = true, call QR generation logic
```

---

### 2.2. Get Table Details

Get detailed information about a specific table.

**Endpoint:** `GET /api/tables/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Table ID    |

**Request Example:**

```http
GET /api/tables/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "table_number": "1",
    "capacity": 4,
    "floor": "Tầng 1",
    "shape": "rectangle",
    "status": "available",
    "is_active": true,
    "position": {
      "x": 100,
      "y": 200,
      "rotation": 0,
      "width": 120,
      "height": 80
    },
    "qr_code_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    "ordering_url": "https://app.smartrestaurant.com/joes-diner/menu?table=...&token=...",
    "qr_code_generated_at": "2025-01-15T10:30:00Z",
    "current_order": null,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "TABLE_NOT_FOUND",
    "message": "Table not found or access denied"
  }
}
```

**Database Query:**

```sql
SELECT
  t.*,
  json_build_object(
    'x', (t.position::json->>'x')::int,
    'y', (t.position::json->>'y')::int,
    'rotation', COALESCE((t.position::json->>'rotation')::int, 0),
    'width', COALESCE((t.position::json->>'width')::int, 100),
    'height', COALESCE((t.position::json->>'height')::int, 100)
  ) as position,
  t.ordering_url,
  CASE
    WHEN t.status = 'occupied' THEN (
      SELECT json_build_object(
        'order_number', order_number,
        'total_amount', total_amount,
        'status', status
      )
      FROM orders
      WHERE table_id = t.id
      AND status NOT IN ('completed', 'cancelled', 'abandoned')
      ORDER BY created_at DESC
      LIMIT 1
    )
    ELSE NULL
  END as current_order
FROM tables t
WHERE t.id = $1
  AND t.tenant_id = $2;  -- from JWT token
```

---

### 2.3. Update Table

Update an existing table.

**Endpoint:** `PUT /api/tables/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Table ID    |

**Request Body Schema:**

Same as Create Table, but all fields are optional (partial update supported).

**Request Example:**

```json
{
  "table_number": "VIP-01-Updated",
  "capacity": 10,
  "status": "maintenance",
  "position": {
    "x": 250,
    "y": 350,
    "rotation": 90
  }
}
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "Table updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "table_number": "VIP-01-Updated",
    "capacity": 10,
    "floor": "Tầng 2",
    "shape": "round",
    "status": "maintenance",
    "is_active": true,
    "position": {
      "x": 250,
      "y": 350,
      "rotation": 90,
      "width": 140,
      "height": 140
    },
    "updated_at": "2025-01-15T16:00:00Z"
  }
}
```

**Business Logic:**

- Only update provided fields (partial update)
- If `table_number` is changed, verify uniqueness per tenant
- If table has active orders and status is changed to `maintenance`, warn or prevent update
- Update `updated_at` timestamp

**Database Query:**

```sql
UPDATE tables
SET
  table_number = COALESCE($2, table_number),
  capacity = COALESCE($3, capacity),
  floor = COALESCE($4, floor),
  shape = COALESCE($5, shape),
  status = COALESCE($6, status),
  is_active = COALESCE($7, is_active),
  position = COALESCE($8::jsonb, position),
  updated_at = NOW()
WHERE id = $1
  AND tenant_id = $9  -- from JWT token
RETURNING *;
```

---

### 2.4. Delete Table

Delete a table.

**Endpoint:** `DELETE /api/tables/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Table ID    |

**Request Example:**

```http
DELETE /api/tables/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "Table deleted successfully"
}
```

**Business Logic:**

- Check if table has active orders or sessions
- If yes, return error (cannot delete table with active orders)
- Soft delete: Set `is_active = false` instead of hard delete (recommended)
- Or hard delete if no dependencies

**Database Operations:**

```sql
-- Option 1: Soft delete (recommended)
UPDATE tables
SET is_active = false, updated_at = NOW()
WHERE id = $1
  AND tenant_id = $2
  AND NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.table_id = $1
    AND o.status NOT IN ('completed', 'cancelled', 'abandoned')
  )
  AND NOT EXISTS (
    SELECT 1 FROM table_sessions ts
    WHERE ts.table_id = $1
    AND ts.status = 'active'
  );

-- Option 2: Hard delete (if business allows)
DELETE FROM tables
WHERE id = $1
  AND tenant_id = $2
  AND NOT EXISTS (/* same checks as above */);
```

---

## 3. Floor Plan Layout APIs

### 3.1. Get Layout by Floor

Get all tables for a specific floor/area with layout information (position, rotation, size).

**Endpoint:** `GET /api/tables/layout`

**Query Parameters:**

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| `floor`   | string | Yes      | Floor/area name (e.g., "Tầng 1", "Tầng 2") |

**Request Example:**

```http
GET /api/tables/layout?floor=Tầng%201
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "data": {
    "floor": "Tầng 1",
    "tables": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "table_number": "1",
        "type": "rectangle",
        "name": "Table 1",
        "seats": 4,
        "area": "Tầng 1",
        "status": "available",
        "position": {
          "x": 100,
          "y": 100
        },
        "rotation": 0,
        "size": {
          "width": 120,
          "height": 80
        },
        "canBeMerged": true,
        "notes": null
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "table_number": "2",
        "type": "round",
        "name": "Table 2",
        "seats": 6,
        "area": "Tầng 1",
        "status": "occupied",
        "position": {
          "x": 300,
          "y": 100
        },
        "rotation": 45,
        "size": {
          "width": 120,
          "height": 120
        },
        "canBeMerged": false,
        "notes": "VIP table"
      }
    ]
  }
}
```

**Database Query:**

```sql
SELECT
  t.id,
  t.table_number as "table_number",
  CASE t.shape
    WHEN 'circle' THEN 'round'
    WHEN 'rectangle' THEN 'rectangle'
    WHEN 'oval' THEN 'oval'
    ELSE 'rectangle'
  END as type,
  t.table_number as name,
  t.capacity as seats,
  t.floor as area,
  t.status,
  json_build_object(
    'x', (t.position::json->>'x')::int,
    'y', (t.position::json->>'y')::int
  ) as position,
  COALESCE((t.position::json->>'rotation')::int, 0) as rotation,
  json_build_object(
    'width', COALESCE((t.position::json->>'width')::int, 100),
    'height', COALESCE((t.position::json->>'height')::int, 100)
  ) as size,
  COALESCE((t.position::json->>'canBeMerged')::boolean, true) as "canBeMerged",
  (t.position::json->>'notes')::text as notes
FROM tables t
WHERE t.tenant_id = $1  -- from JWT token
  AND t.floor = $2
  AND t.is_active = true
ORDER BY t.table_number;
```

---

### 3.2. Update Table Position

Update a table's position, rotation, and size on the layout canvas.

**Endpoint:** `PUT /api/tables/:id/position`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Table ID    |

**Request Body Schema:**

```json
{
  "position": {
    "x": "integer (required)",
    "y": "integer (required)",
    "rotation": "integer (optional, 0-360, default: 0)",
    "width": "integer (optional, default: existing or 100)",
    "height": "integer (optional, default: existing or 100)"
  }
}
```

**Request Example:**

```json
{
  "position": {
    "x": 250,
    "y": 300,
    "rotation": 90,
    "width": 140,
    "height": 80
  }
}
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "Table position updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "position": {
      "x": 250,
      "y": 300,
      "rotation": 90,
      "width": 140,
      "height": 80
    },
    "updated_at": "2025-01-15T17:00:00Z"
  }
}
```

**Database Query:**

```sql
UPDATE tables
SET
  position = json_build_object(
    'x', $2,
    'y', $3,
    'rotation', COALESCE($4, (position::json->>'rotation')::int, 0),
    'width', COALESCE($5, (position::json->>'width')::int, 100),
    'height', COALESCE($6, (position::json->>'height')::int, 100),
    'canBeMerged', COALESCE((position::json->>'canBeMerged')::boolean, true),
    'notes', position::json->>'notes'
  )::text,
  updated_at = NOW()
WHERE id = $1
  AND tenant_id = $7  -- from JWT token
RETURNING id, position, updated_at;
```

---

### 3.3. Batch Update Layout

Update multiple tables' positions simultaneously (for undo/redo functionality).

**Endpoint:** `POST /api/tables/layout/batch-update`

**Request Body Schema:**

```json
{
  "updates": [
    {
      "table_id": "uuid (required)",
      "position": {
        "x": "integer (required)",
        "y": "integer (required)",
        "rotation": "integer (optional)",
        "width": "integer (optional)",
        "height": "integer (optional)"
      }
    }
  ]
}
```

**Request Example:**

```json
{
  "updates": [
    {
      "table_id": "550e8400-e29b-41d4-a716-446655440000",
      "position": {
        "x": 100,
        "y": 200,
        "rotation": 0,
        "width": 120,
        "height": 80
      }
    },
    {
      "table_id": "550e8400-e29b-41d4-a716-446655440001",
      "position": {
        "x": 300,
        "y": 200,
        "rotation": 45,
        "width": 120,
        "height": 120
      }
    }
  ]
}
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "Layout updated successfully",
  "data": {
    "updated_count": 2,
    "tables": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "position": { "x": 100, "y": 200, "rotation": 0, "width": 120, "height": 80 }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "position": { "x": 300, "y": 200, "rotation": 45, "width": 120, "height": 120 }
      }
    ]
  }
}
```

**Database Operations:**

```sql
-- Use transaction for batch update
BEGIN;

UPDATE tables
SET
  position = json_build_object(
    'x', update_data.x,
    'y', update_data.y,
    'rotation', COALESCE(update_data.rotation, (position::json->>'rotation')::int, 0),
    'width', COALESCE(update_data.width, (position::json->>'width')::int, 100),
    'height', COALESCE(update_data.height, (position::json->>'height')::int, 100)
  )::text,
  updated_at = NOW()
FROM (VALUES
  ($2::uuid, $3::int, $4::int, $5::int, $6::int, $7::int),
  -- ... more rows
) AS update_data(table_id, x, y, rotation, width, height)
WHERE tables.id = update_data.table_id
  AND tables.tenant_id = $1;

COMMIT;
```

---

### 3.4. Get Available Floors

Get list of all floors/areas that have tables.

**Endpoint:** `GET /api/tables/floors`

**Query Parameters:** None

**Request Example:**

```http
GET /api/tables/floors
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "data": {
    "floors": ["Tầng 1", "Tầng 2", "Tầng 3", "Khu ngoài trời", "Khu VIP"]
  }
}
```

**Database Query:**

```sql
SELECT DISTINCT floor
FROM tables
WHERE tenant_id = $1  -- from JWT token
  AND is_active = true
ORDER BY floor;
```

---

## 4. QR Code Management APIs

### 4.1. Get All QR Codes

Get QR code information for all tables.

**Endpoint:** `GET /api/tables/qr`

**Query Parameters:**

| Parameter | Type   | Required | Description                                         |
| --------- | ------ | -------- | --------------------------------------------------- |
| `status`  | string | No       | Filter by QR status: `ready`, `missing`, `outdated` |
| `floor`   | string | No       | Filter by floor/area                                |

**Request Example:**

```http
GET /api/tables/qr?status=ready&floor=Tầng%201
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "tableNumber": "1",
        "tableArea": "Tầng 1 - Khu cửa sổ",
        "seats": 4,
        "qrUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://app.smartrestaurant.com/order?token=...",
        "qrLink": "https://app.smartrestaurant.com/order?token=...",
        "status": "Ready",
        "updatedAt": "2025-01-15T14:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "tableNumber": "2",
        "tableArea": "Tầng 1 - Khu cửa sổ",
        "seats": 2,
        "qrUrl": null,
        "qrLink": "https://app.smartrestaurant.com/order?token=...",
        "status": "Missing",
        "updatedAt": null
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "tableNumber": "6",
        "tableArea": "Tầng 2 - VIP",
        "seats": 8,
        "qrUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
        "qrLink": "https://app.smartrestaurant.com/order?token=...",
        "status": "Outdated",
        "updatedAt": "2023-12-20T11:00:00Z"
      }
    ]
  }
}
```

**QR Status Logic:**

- `Ready`: Has `qr_code_url` and `qr_code_generated_at` is within last 90 days
- `Missing`: No `qr_code_url` or `qr_code_token`
- `Outdated`: Has `qr_code_url` but `qr_code_generated_at` is older than 90 days

**Database Query:**

```sql
SELECT
  t.id,
  t.table_number as "tableNumber",
  t.floor as "tableArea",
  t.capacity as seats,
  t.qr_code_url as "qrUrl",
  CASE
    WHEN t.qr_code_token IS NOT NULL
    THEN CONCAT('https://app.smartrestaurant.com/order?token=', t.qr_code_token)
    ELSE NULL
  END as "qrLink",
  CASE
    WHEN t.qr_code_url IS NULL OR t.qr_code_generated_at IS NULL THEN 'Missing'
    WHEN t.qr_code_generated_at < NOW() - INTERVAL '90 days' THEN 'Outdated'
    ELSE 'Ready'
  END as status,
  t.qr_code_generated_at as "updatedAt"
FROM tables t
WHERE t.tenant_id = $1  -- from JWT token
  AND t.is_active = true
  AND ($2::text IS NULL OR t.floor = $2)
ORDER BY t.table_number;
```

---

### 4.2. Generate QR Code for Table

Generate or regenerate QR code for a specific table.

**Endpoint:** `POST /api/tables/:id/qr/generate`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Table ID    |

**Request Body:** None (optional: `force_regenerate: boolean`)

**Request Example:**

```http
POST /api/tables/550e8400-e29b-41d4-a716-446655440000/qr/generate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "force_regenerate": false
}
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "table_number": "1",
    "qr_code_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0YWJsZV9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImlzc3VlZF9hdCI6IjIwMjUtMDEtMTVUMTg6MDA6MDBaIn0...",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://app.smartrestaurant.com/joes-diner/menu?table=...",
    "ordering_url": "https://app.smartrestaurant.com/joes-diner/menu?table=...&token=eyJhbGci...",
    "qr_code_generated_at": "2025-01-15T18:00:00Z"
  }
}
```

**QR Generation Logic:**

1. **Create JWT Token:**

   ```javascript
   const payload = {
     tenant_id: table.tenant_id,
     table_id: table.id,
     issued_at: new Date().toISOString(),
   }
   const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '365d' })
   ```

2. **Generate QR Code URL:**

   ```
   QR Order URL: https://app.smartrestaurant.com/order?token={jwt_token}
   QR Image URL: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encoded_order_url}
   ```

3. **Database Update:**
   ```sql
   UPDATE tables
   SET
     qr_code_token = $2,
     qr_code_url = $3,
     qr_code_generated_at = NOW(),
     updated_at = NOW()
   WHERE id = $1
     AND tenant_id = $4  -- from JWT token
   RETURNING *;
   ```

**Business Rules:**

- If QR already exists and `force_regenerate` is false, return existing QR
- New QR token invalidates old QR codes (security feature)
- Token expires after 365 days (configurable)

---

### 4.3. Batch Generate QR Codes

Generate QR codes for multiple tables at once.

**Endpoint:** `POST /api/tables/qr/batch-generate`

**Request Body Schema:**

```json
{
  "table_ids": ["uuid[] (optional, if empty, generate for all active tables)"],
  "force_regenerate": "boolean (optional, default: false)"
}
```

**Request Example:**

```json
{
  "table_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "force_regenerate": true
}
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "QR codes generated for 3 tables",
  "data": {
    "generated_count": 3,
    "failed_count": 0,
    "results": [
      {
        "table_id": "550e8400-e29b-41d4-a716-446655440000",
        "table_number": "1",
        "success": true,
        "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=..."
      },
      {
        "table_id": "550e8400-e29b-41d4-a716-446655440001",
        "table_number": "2",
        "success": true,
        "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=..."
      },
      {
        "table_id": "550e8400-e29b-41d4-a716-446655440002",
        "table_number": "3",
        "success": true,
        "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=..."
      }
    ]
  }
}
```

**Database Operations:**

```sql
-- Use transaction for batch operations
BEGIN;

-- If table_ids is empty, get all active tables
-- Otherwise, use provided table_ids
WITH tables_to_update AS (
  SELECT id, table_number
  FROM tables
  WHERE tenant_id = $1
    AND is_active = true
    AND ($2::uuid[] IS NULL OR id = ANY($2::uuid[]))
)
-- Generate QR for each table (pseudocode - actual implementation depends on framework)
UPDATE tables
SET qr_code_token = generate_jwt_token(...),
    qr_code_url = generate_qr_url(...),
    qr_code_generated_at = NOW()
WHERE id IN (SELECT id FROM tables_to_update);

COMMIT;
```

---

### 4.4. Get QR Code for Table

Get QR code information for a specific table.

**Endpoint:** `GET /api/tables/:id/qr`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Table ID    |

**Request Example:**

```http
GET /api/tables/550e8400-e29b-41d4-a716-446655440000/qr
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "table_number": "1",
    "qr_code_token": "eyJhbGci...",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    "ordering_url": "https://app.smartrestaurant.com/joes-diner/menu?table=...&token=...",
    "qr_code_generated_at": "2025-01-15T18:00:00Z",
    "status": "Ready"
  }
}
```

**Database Query:**
Same as Get Table Details, but focused on QR fields.

---

## Data Models

### Table Object

```typescript
interface Table {
  id: string // UUID
  tenant_id: string // UUID (from JWT, not exposed in responses)
  table_number: string // Max 20 chars, unique per tenant
  capacity: number // Min: 1, Max: 50
  floor: string // Max 100 chars
  shape: 'circle' | 'rectangle' | 'oval'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  is_active: boolean
  position: {
    x: number
    y: number
    rotation?: number // 0-360 degrees
    width?: number // Default: 100
    height?: number // Default: 100
    canBeMerged?: boolean // Optional metadata
    notes?: string // Optional metadata
  } | null
  qr_code_token?: string // JWT token (unique)
  qr_code_url?: string // External QR image URL (from api.qrserver.com)
  ordering_url?: string // Actual ordering link embedded in QR code
  qr_code_generated_at?: string // ISO 8601 timestamp
  current_order?: {
    order_number: string
    total_amount: number
    status: string
  } | null
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
}
```

### Position Storage Strategy

**Recommended:** Store as JSON string in `position` column:

```json
{
  "x": 100,
  "y": 200,
  "rotation": 45,
  "width": 120,
  "height": 80,
  "canBeMerged": true,
  "notes": "VIP table"
}
```

**Alternative (if needed):** Add separate columns:

- `position_x` (integer)
- `position_y` (integer)
- `rotation` (integer, 0-360)
- `width` (integer)
- `height` (integer)
- `layout_metadata` (jsonb) - for canBeMerged, notes, etc.

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional: additional error details
  }
}
```

### Error Codes

| HTTP Status | Error Code               | Description                                          |
| ----------- | ------------------------ | ---------------------------------------------------- |
| 400         | `VALIDATION_ERROR`       | Request validation failed                            |
| 400         | `DUPLICATE_TABLE_NUMBER` | Table number already exists for this tenant          |
| 400         | `INVALID_STATUS_CHANGE`  | Cannot change status (e.g., table has active orders) |
| 401         | `UNAUTHORIZED`           | Missing or invalid JWT token                         |
| 403         | `FORBIDDEN`              | Insufficient permissions                             |
| 404         | `TABLE_NOT_FOUND`        | Table not found or access denied                     |
| 409         | `TABLE_IN_USE`           | Cannot delete/update table with active orders        |
| 500         | `INTERNAL_ERROR`         | Server error                                         |

### Error Examples

**400 Validation Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "table_number": "Table number is required",
      "capacity": "Capacity must be between 1 and 50"
    }
  }
}
```

**409 Table In Use:**

```json
{
  "success": false,
  "error": {
    "code": "TABLE_IN_USE",
    "message": "Cannot delete table with active orders",
    "details": {
      "table_id": "550e8400-e29b-41d4-a716-446655440000",
      "active_orders_count": 1
    }
  }
}
```

---

## Database Operations Reference

### Multi-Tenant Isolation

**All queries MUST include tenant filter:**

```sql
WHERE tenant_id = $tenant_id  -- Extracted from JWT token
```

**Never expose tenant_id in responses** (security best practice).

### Position Storage

**Insert/Update Position:**

```sql
-- Store as JSON string
position = json_build_object(
  'x', $x,
  'y', $y,
  'rotation', $rotation,
  'width', $width,
  'height', $height
)::text

-- Retrieve and parse
SELECT
  (position::json->>'x')::int as x,
  (position::json->>'y')::int as y,
  COALESCE((position::json->>'rotation')::int, 0) as rotation,
  COALESCE((position::json->>'width')::int, 100) as width,
  COALESCE((position::json->>'height')::int, 100) as height
FROM tables
```

### Current Order Join

**Get current active order for occupied tables:**

```sql
LEFT JOIN orders o ON o.table_id = t.id
  AND o.status NOT IN ('completed', 'cancelled', 'abandoned')
  AND o.created_at = (
    SELECT MAX(created_at)
    FROM orders
    WHERE table_id = t.id
    AND status NOT IN ('completed', 'cancelled', 'abandoned')
  )
```

### Constraints

**Database-level constraints:**

- `(tenant_id, table_number) UNIQUE` - Unique table number per tenant
- `capacity > 0` - Positive capacity
- `status` CHECK constraint for enum values
- `qr_code_token` UNIQUE globally

---

## QR Code Generation Details

### JWT Token Payload

```javascript
{
  tenant_id: "550e8400-e29b-41d4-a716-446655440000",
  table_id: "550e8400-e29b-41d4-a716-446655440001",
  issued_at: "2025-01-15T18:00:00Z"
}
```

### QR Order URL Format

```
https://app.smartrestaurant.com/order?token={jwt_token}
```

### QR Image Generation

**External Service (Recommended):**

```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encoded_order_url}
```

**Alternative - Self-hosted:**

- Use library like `qrcode` (Node.js) or `qrcode` (Python)
- Generate PNG/SVG and upload to CDN/S3
- Store URL in `qr_code_url`

### Security Considerations

1. **Token Expiration:** Set reasonable expiration (365 days recommended)
2. **Token Regeneration:** Allow regeneration to invalidate old codes
3. **HTTPS Only:** Always use HTTPS for QR order URLs
4. **Token Validation:** Validate token signature on order page load

---

## Status Synchronization

Table `status` can be automatically updated by other system events:

1. **Order Created:** `status` → `occupied` (if was `available`)
2. **Payment Completed:** `status` → `available` (if was `occupied`)
3. **Order Cancelled:** `status` → `available` (if no other active orders)

**Note:** Manual status updates via API should respect business rules (e.g., cannot set to `available` if table has active orders).

---

## Rate Limiting

Recommended rate limits:

- **List/Get operations:** 100 requests/minute
- **Create/Update operations:** 30 requests/minute
- **Batch operations:** 10 requests/minute
- **QR generation:** 50 requests/minute

---

## Versioning

**Current API Version:** `v1`

**Version in URL (optional):**

```
/api/v1/tables
```

**Version in Header (alternative):**

```
Accept: application/json; version=1
```

---

## Testing Examples

### cURL Examples

**Get Tables List:**

```bash
curl -X GET "https://api.smartrestaurant.com/api/tables?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Create Table:**

```bash
curl -X POST "https://api.smartrestaurant.com/api/tables" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": "VIP-01",
    "capacity": 8,
    "floor": "Tầng 2",
    "shape": "round",
    "status": "available",
    "auto_generate_qr": true
  }'
```

**Generate QR Code:**

```bash
curl -X POST "https://api.smartrestaurant.com/api/tables/TABLE_ID/qr/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Changelog

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 1.0     | 2025-01-15 | Initial API documentation |

---

## Support

For questions or issues, contact the API team or refer to the main project documentation.
