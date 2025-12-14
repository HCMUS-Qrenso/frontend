# Tables Management API - Usage Examples

This document provides practical examples for common use cases when working with the Tables Management API.

---

## Table of Contents

1. [Common Use Cases](#common-use-cases)
2. [JavaScript/TypeScript Examples](#javascripttypescript-examples)
3. [Error Handling Examples](#error-handling-examples)
4. [Integration Patterns](#integration-patterns)

---

## Common Use Cases

### Use Case 1: Display Tables List Page

**Scenario:** Load tables list with filters and pagination.

**Steps:**

1. Get tables statistics for KPI cards
2. Get paginated tables list with filters
3. Handle pagination and search

**Example:**

```typescript
// 1. Get statistics
const statsResponse = await fetch('/api/tables/stats', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
const stats = await statsResponse.json()
// stats.data: { total_tables: 42, available_tables: 18, ... }

// 2. Get tables list
const tablesResponse = await fetch('/api/tables?page=1&limit=10&floor=Tầng%201&status=available', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
const tables = await tablesResponse.json()
// tables.data.tables: [...]
// tables.data.pagination: { page: 1, limit: 10, total: 42, ... }
```

---

### Use Case 2: Create New Table

**Scenario:** Admin creates a new table via the upsert drawer.

**Steps:**

1. User fills form (table_number, capacity, floor, shape, status)
2. Submit form with optional auto-generate QR
3. Handle success/error response

**Example:**

```typescript
async function createTable(formData: {
  table_number: string
  capacity: number
  floor: string
  shape: 'circle' | 'rectangle' | 'oval'
  status: 'available' | 'maintenance'
  is_active: boolean
  auto_generate_qr: boolean
}) {
  try {
    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table_number: formData.table_number,
        capacity: formData.capacity,
        floor: formData.floor,
        shape: formData.shape,
        status: formData.status,
        is_active: formData.is_active,
        position: {
          x: 200, // Default position
          y: 200,
          rotation: 0,
          width: 120,
          height: 80,
        },
        auto_generate_qr: formData.auto_generate_qr,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error.message)
    }

    const result = await response.json()
    // result.data contains created table with QR code if auto_generate_qr was true

    // Refresh tables list
    await refreshTablesList()

    return result.data
  } catch (error) {
    console.error('Error creating table:', error)
    throw error
  }
}

// Usage
const newTable = await createTable({
  table_number: 'VIP-01',
  capacity: 8,
  floor: 'Tầng 2',
  shape: 'round',
  status: 'available',
  is_active: true,
  auto_generate_qr: true,
})
```

---

### Use Case 3: Update Table Layout (Drag & Drop)

**Scenario:** User drags a table on the floor plan canvas and saves position.

**Steps:**

1. User drags table to new position
2. Update table position via API
3. Handle undo/redo (batch update)

**Example:**

```typescript
// Single table position update
async function updateTablePosition(
  tableId: string,
  position: { x: number; y: number; rotation?: number },
) {
  const response = await fetch(`/api/tables/${tableId}/position`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      position: {
        x: position.x,
        y: position.y,
        rotation: position.rotation || 0,
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to update table position')
  }

  return await response.json()
}

// Batch update for undo/redo functionality
async function batchUpdateTablePositions(
  updates: Array<{
    table_id: string
    position: { x: number; y: number; rotation?: number; width?: number; height?: number }
  }>,
) {
  const response = await fetch('/api/tables/layout/batch-update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updates }),
  })

  if (!response.ok) {
    throw new Error('Failed to batch update layout')
  }

  return await response.json()
}

// Usage in floor plan component
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, delta } = event
  const table = tables.find((t) => t.id === active.id)

  if (table) {
    const newX = table.position.x + delta.x / zoom
    const newY = table.position.y + delta.y / zoom

    // Add to undo history
    addToUndoHistory()

    // Update position
    await updateTablePosition(table.id, {
      x: Math.round(newX / 20) * 20, // Snap to grid
      y: Math.round(newY / 20) * 20,
      rotation: table.rotation,
    })
  }
}

// Undo/Redo with batch update
const handleUndo = async () => {
  if (historyIndex > 0) {
    const previousState = history[historyIndex - 1]
    const updates = previousState.map((table) => ({
      table_id: table.id,
      position: {
        x: table.position.x,
        y: table.position.y,
        rotation: table.rotation,
        width: table.size.width,
        height: table.size.height,
      },
    }))

    await batchUpdateTablePositions(updates)
    setHistoryIndex(historyIndex - 1)
  }
}
```

---

### Use Case 4: Load Floor Plan Layout

**Scenario:** Load tables for a specific floor to display on canvas.

**Example:**

```typescript
async function loadFloorLayout(floor: string) {
  const response = await fetch(`/api/tables/layout?floor=${encodeURIComponent(floor)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load floor layout')
  }

  const result = await response.json()

  // Transform API response to UI format
  const tables = result.data.tables.map((table) => ({
    id: table.id,
    type: table.type, // 'round' | 'rectangle'
    name: table.name,
    seats: table.seats,
    area: table.area,
    status: table.status,
    position: table.position,
    rotation: table.rotation,
    size: table.size,
    canBeMerged: table.canBeMerged || true,
    notes: table.notes || null,
  }))

  return tables
}

// Usage
const floorTables = await loadFloorLayout('Tầng 1')
setTables(floorTables)
```

---

### Use Case 5: Generate QR Codes (Single & Batch)

**Scenario:** Generate QR codes for tables in QR management page.

**Example:**

```typescript
// Generate QR for single table
async function generateQRForTable(tableId: string, forceRegenerate = false) {
  const response = await fetch(`/api/tables/${tableId}/qr/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      force_regenerate: forceRegenerate,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate QR code')
  }

  return await response.json()
}

// Batch generate QR for multiple tables
async function batchGenerateQR(tableIds: string[], forceRegenerate = false) {
  const response = await fetch('/api/tables/qr/batch-generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table_ids: tableIds,
      force_regenerate: forceRegenerate,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to batch generate QR codes')
  }

  return await response.json()
}

// Generate QR for all tables
async function generateAllQR(forceRegenerate = false) {
  return await batchGenerateQR([], forceRegenerate) // Empty array = all tables
}

// Usage
// Single table
const qrResult = await generateQRForTable('table-id-123', false)

// Multiple selected tables
const selectedTableIds = ['id1', 'id2', 'id3']
const batchResult = await batchGenerateQR(selectedTableIds, true)

// All tables
const allQRResult = await generateAllQR(false)
console.log(`Generated QR codes for ${allQRResult.data.generated_count} tables`)
```

---

### Use Case 6: Load QR Management Page

**Scenario:** Display QR codes list with status (Ready, Missing, Outdated).

**Example:**

```typescript
async function loadQRManagementData(floor?: string, status?: 'ready' | 'missing' | 'outdated') {
  const params = new URLSearchParams()
  if (floor) params.append('floor', floor)
  if (status) params.append('status', status)

  const response = await fetch(`/api/tables/qr?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load QR codes')
  }

  const result = await response.json()

  // Transform to UI format
  const qrData = result.data.tables.map((table) => ({
    id: table.id,
    tableNumber: table.tableNumber,
    tableArea: table.tableArea,
    seats: table.seats,
    qrUrl: table.qrUrl,
    qrLink: table.qrLink,
    status: table.status, // 'Ready' | 'Missing' | 'Outdated'
    updatedAt: table.updatedAt,
  }))

  return qrData
}

// Usage
const qrTables = await loadQRManagementData('Tầng 1', 'ready')
// Filter to show only tables with 'Ready' QR status on Tầng 1
```

---

### Use Case 7: Delete Table with Validation

**Scenario:** Delete a table after confirming no active orders.

**Example:**

```typescript
async function deleteTable(tableId: string) {
  try {
    const response = await fetch(`/api/tables/${tableId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()

      if (error.error.code === 'TABLE_IN_USE') {
        throw new Error('Cannot delete table with active orders')
      }

      throw new Error(error.error.message || 'Failed to delete table')
    }

    // Success - refresh list
    await refreshTablesList()
    return true
  } catch (error) {
    console.error('Error deleting table:', error)
    alert(error.message)
    return false
  }
}

// Usage with confirmation
const handleDelete = async (tableId: string, tableNumber: string) => {
  const confirmed = confirm(`Are you sure you want to delete table ${tableNumber}?`)

  if (confirmed) {
    const success = await deleteTable(tableId)
    if (success) {
      toast.success('Table deleted successfully')
    }
  }
}
```

---

### Use Case 8: Edit Table Properties

**Scenario:** Update table details from list page or layout editor.

**Example:**

```typescript
async function updateTable(
  tableId: string,
  updates: Partial<{
    table_number: string
    capacity: number
    floor: string
    shape: 'circle' | 'rectangle' | 'oval'
    status: 'available' | 'occupied' | 'maintenance'
    is_active: boolean
  }>,
) {
  const response = await fetch(`/api/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message || 'Failed to update table')
  }

  return await response.json()
}

// Usage - Update from list page
await updateTable('table-id-123', {
  table_number: 'VIP-01-Updated',
  capacity: 10,
  status: 'maintenance',
})

// Usage - Update from layout side panel
await updateTable(selectedTable.id, {
  name: newName, // Updates table_number
  seats: newCapacity,
  status: newStatus,
  area: newFloor,
})
```

---

## JavaScript/TypeScript Examples

### React Hook for Tables Management

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseTablesOptions {
  page?: number;
  limit?: number;
  search?: string;
  floor?: string;
  status?: string;
}

export function useTables(options: UseTablesOptions = {}) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.floor) params.append('floor', options.floor);
      if (options.status) params.append('status', options.status);

      const response = await fetch(`/api/tables?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }

      const result = await response.json();
      setTables(result.data.tables);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.search, options.floor, options.status]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    pagination,
    refetch: fetchTables
  };
}

// Usage in component
function TablesListPage() {
  const { tables, loading, error, pagination, refetch } = useTables({
    page: 1,
    limit: 10,
    floor: 'Tầng 1'
  });

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {tables.map(table => (
        <TableRow key={table.id} table={table} />
      ))}
      <Pagination pagination={pagination} />
    </div>
  );
}
```

---

### React Hook for Table Statistics

```typescript
export function useTableStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch('/api/tables/stats', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(result => {
        setStats(result.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });
  }, []);

  return { stats, loading };
}

// Usage
function TablesOverviewStats() {
  const { stats, loading } = useTableStats();

  if (loading) return <Skeleton />;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Tables" value={stats.total_tables} />
      <StatCard title="Available" value={stats.available_tables} />
      <StatCard title="Occupied" value={stats.occupied_tables} />
      <StatCard title="Waiting for Payment" value={stats.waiting_for_payment} />
    </div>
  );
}
```

---

## Error Handling Examples

### Centralized Error Handler

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: APIError = await response.json();

    // Handle specific error codes
    switch (error.error.code) {
      case 'VALIDATION_ERROR':
        throw new ValidationError(error.error.message, error.error.details);

      case 'DUPLICATE_TABLE_NUMBER':
        throw new DuplicateTableError(error.error.message);

      case 'TABLE_IN_USE':
        throw new TableInUseError(error.error.message, error.error.details);

      case 'UNAUTHORIZED':
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Unauthorized');

      case 'FORBIDDEN':
        throw new ForbiddenError('Insufficient permissions');

      case 'TABLE_NOT_FOUND':
        throw new NotFoundError('Table not found');

      default:
        throw new APIError(error.error.message, error.error.code);
    }
  }

  const result = await response.json();
  return result.data;
}

// Usage
try {
  const table = await handleAPIResponse<Table>(
    fetch('/api/tables', { ... })
  );
} catch (error) {
  if (error instanceof ValidationError) {
    // Show validation errors in form
    setFormErrors(error.details);
  } else if (error instanceof DuplicateTableError) {
    toast.error('Table number already exists');
  } else if (error instanceof TableInUseError) {
    toast.error('Cannot delete table with active orders');
  } else {
    toast.error('An error occurred');
  }
}
```

---

## Integration Patterns

### Optimistic Updates

```typescript
function useOptimisticTableUpdate() {
  const [tables, setTables] = useState([])

  const updateTablePosition = async (tableId: string, position: Position) => {
    // Optimistic update
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, position, updated_at: new Date().toISOString() } : table,
      ),
    )

    try {
      await fetch(`/api/tables/${tableId}/position`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position }),
      })
    } catch (error) {
      // Revert on error
      await refetchTables()
      throw error
    }
  }

  return { tables, updateTablePosition }
}
```

### Debounced Search

```typescript
import { useDebouncedCallback } from 'use-debounce'

function useTableSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const { tables, refetch } = useTables()

  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      refetch({ search: query })
    },
    300, // 300ms delay
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }

  return { searchQuery, handleSearchChange, tables }
}
```

---

## Next Steps

1. Implement these examples in your frontend codebase
2. Add proper TypeScript types from the API documentation
3. Set up error boundary components
4. Add loading states and skeletons
5. Implement retry logic for failed requests
