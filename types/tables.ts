// Table Status Types
export type TableStatus = 'available' | 'occupied' | 'waiting_for_payment' | 'maintenance'
export type TableShape = 'circle' | 'rectangle' | 'oval'

// Position interface
export interface TablePosition {
  x: number
  y: number
}

// Main Table interface matching backend response
export interface Table {
  id: string
  tenant_id: string
  table_number: string
  capacity: number
  position: string | null // JSON string from backend: "{\"x\":100,\"y\":200}"
  floor: string | null
  shape: TableShape | null
  status: TableStatus
  qr_code_token: string | null
  qr_code_url: string | null
  ordering_url: string | null
  qr_code_generated_at: string | null
  is_active: boolean
  current_order: string | null
  created_at: string
  updated_at: string
}

// Table with parsed position (for frontend use)
export interface TableWithParsedPosition extends Omit<Table, 'position'> {
  position: TablePosition | null
}

// Table Statistics
export interface TableStats {
  total_tables: number
  available_tables: number
  occupied_tables: number
  waiting_for_payment: number
  maintenance_tables: number
  inactive_tables: number
}

// Pagination response
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

// Table List Response
export interface TableListResponse {
  success: boolean
  data: {
    tables: Table[]
    pagination: PaginationMeta
  }
}

// Table Stats Response
export interface TableStatsResponse {
  success: boolean
  data: TableStats
}

// Single Table Response
export interface TableResponse {
  success: boolean
  message?: string
  data: Table
}

// Create Table Payload
export interface CreateTablePayload {
  table_number: string
  capacity: number
  floor?: string
  shape?: TableShape
  status?: TableStatus
  is_active?: boolean
  position?: TablePosition
  auto_generate_qr?: boolean
}

// Update Table Payload
export interface UpdateTablePayload {
  table_number?: string
  capacity?: number
  floor?: string
  shape?: TableShape
  status?: TableStatus
  is_active?: boolean
  position?: TablePosition
}

// Table Query Parameters
export interface TableQueryParams {
  page?: number
  limit?: number
  search?: string
  floor?: string
  status?: TableStatus
  is_active?: boolean
}

// QR Code Generation Response
export interface QRGenerationResponse {
  success: boolean
  message: string
  data: {
    id: string
    table_number: string
    qr_code_token: string
    qr_code_url: string
    ordering_url: string
    qr_code_generated_at: string
  }
}

// QR Token Verification
export interface QRTokenVerificationRequest {
  token: string
}

export interface QRTokenVerificationResponse {
  valid: boolean
  table?: {
    id: string
    tableNumber: string
    floor: string
    capacity: number
    status: TableStatus
  }
  error?: string
  message?: string
}

// Floor Layout Types
export interface FloorLayoutTable {
  id: string
  table_number: string
  type: TableShape
  name: string
  seats: number
  area: string
  status: TableStatus
  position: TablePosition
}

export interface FloorLayoutResponse {
  success: boolean
  data: {
    floor: string
    tables: FloorLayoutTable[]
  }
}

export interface FloorsResponse {
  success: boolean
  data: {
    floors: string[]
  }
}

// Batch Position Update
export interface PositionUpdateItem {
  table_id: string
  position: TablePosition
}

export interface BatchPositionUpdatePayload {
  updates: PositionUpdateItem[]
}

export interface BatchPositionUpdateResponse {
  success: boolean
  message: string
  data: {
    updated_count: number
    tables: Array<{
      id: string
      position: TablePosition
    }>
  }
}

// TableQR interface for QR Manager page
export interface TableQR {
  id: string
  tableNumber: string
  tableArea: string
  qrUrl: string
  qrLink: string
  status: 'Ready' | 'Missing' | 'Outdated'
  updatedAt: string
  seats: number
}

