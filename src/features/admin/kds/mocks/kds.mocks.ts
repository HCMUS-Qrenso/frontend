// KDS Mock Data - For development until backend KDS endpoints are ready

import type { KdsOrder, KdsOrderItem } from '../types/kds.types'

// Helper to create ISO date strings relative to now
const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60 * 1000).toISOString()

// Mock order items
const createMockItems = (orderId: string, items: Partial<KdsOrderItem>[]): KdsOrderItem[] =>
  items.map((item, index) => ({
    id: `item-${orderId}-${index + 1}`,
    orderId,
    menuItemId: `menu-${index + 100}`,
    menuItemName: item.menuItemName || 'Unknown Item',
    quantity: item.quantity || 1,
    status: item.status || 'pending',
    specialInstructions: item.specialInstructions || null,
    estimatedPrepTime: item.estimatedPrepTime || 15,
    preparationStartedAt: item.preparationStartedAt || null,
    preparationCompletedAt: item.preparationCompletedAt || null,
    servedAt: item.servedAt || null,
    cancellationReason: null,
    allergenInfo: item.allergenInfo || null,
    modifiers: item.modifiers || [],
    createdAt: item.createdAt || new Date().toISOString(),
  }))

// Mock KDS Orders
export const MOCK_KDS_ORDERS: KdsOrder[] = [
  // Order 1: High priority, some items preparing
  {
    id: 'ord-001',
    orderNumber: 'ORD-1024',
    tableId: 'tbl-5',
    tableNumber: '5',
    zoneName: 'Tầng 1',
    waiterId: 'usr-1',
    waiterName: 'Nguyễn Văn A',
    status: 'in_progress',
    priority: 'high',
    specialInstructions: 'Khách yêu cầu phục vụ nhanh',
    createdAt: minutesAgo(18),
    updatedAt: minutesAgo(5),
    items: createMockItems('ord-001', [
      {
        menuItemName: 'Phở bò đặc biệt',
        quantity: 2,
        status: 'preparing',
        specialInstructions: 'Ít hành',
        estimatedPrepTime: 15,
        preparationStartedAt: minutesAgo(10),
        allergenInfo: 'gluten',
        createdAt: minutesAgo(18),
      },
      {
        menuItemName: 'Trà đá',
        quantity: 2,
        status: 'ready',
        estimatedPrepTime: 2,
        preparationStartedAt: minutesAgo(15),
        preparationCompletedAt: minutesAgo(14),
        createdAt: minutesAgo(18),
      },
    ]),
  },
  // Order 2: Urgent priority, overdue items
  {
    id: 'ord-002',
    orderNumber: 'ORD-1025',
    tableId: 'tbl-3',
    tableNumber: '3',
    zoneName: 'Tầng 1',
    waiterId: 'usr-2',
    waiterName: 'Trần Thị B',
    status: 'in_progress',
    priority: 'urgent',
    specialInstructions: null,
    createdAt: minutesAgo(32),
    updatedAt: minutesAgo(3),
    items: createMockItems('ord-002', [
      {
        menuItemName: 'Bún chả Hà Nội',
        quantity: 3,
        status: 'preparing',
        specialInstructions: 'Thêm rau sống',
        estimatedPrepTime: 20,
        preparationStartedAt: minutesAgo(25),
        createdAt: minutesAgo(32),
      },
      {
        menuItemName: 'Nem rán',
        quantity: 1,
        status: 'ready',
        estimatedPrepTime: 10,
        preparationStartedAt: minutesAgo(20),
        preparationCompletedAt: minutesAgo(12),
        createdAt: minutesAgo(32),
      },
    ]),
  },
  // Order 3: VIP, newly placed
  {
    id: 'ord-003',
    orderNumber: 'ORD-1026',
    tableId: 'tbl-7',
    tableNumber: '7',
    zoneName: 'Tầng 2',
    waiterId: 'usr-1',
    waiterName: 'Nguyễn Văn A',
    status: 'accepted',
    priority: 'vip',
    specialInstructions: 'Khách VIP - Ưu tiên cao nhất',
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(5),
    items: createMockItems('ord-003', [
      {
        menuItemName: 'Tôm hùm hấp',
        quantity: 1,
        status: 'pending',
        specialInstructions: 'Chín vừa, không quá già',
        estimatedPrepTime: 25,
        allergenInfo: 'seafood',
        createdAt: minutesAgo(5),
      },
      {
        menuItemName: 'Rượu vang đỏ',
        quantity: 1,
        status: 'pending',
        estimatedPrepTime: 3,
        createdAt: minutesAgo(5),
        modifiers: [{ id: 'mod-1', modifierName: 'Merlot 2019', priceAdjustment: 0 }],
      },
    ]),
  },
  // Order 4: Normal priority
  {
    id: 'ord-004',
    orderNumber: 'ORD-1027',
    tableId: 'tbl-12',
    tableNumber: '12',
    zoneName: 'Tầng 2',
    waiterId: 'usr-3',
    waiterName: 'Lê Văn C',
    status: 'in_progress',
    priority: 'normal',
    specialInstructions: null,
    createdAt: minutesAgo(12),
    updatedAt: minutesAgo(2),
    items: createMockItems('ord-004', [
      {
        menuItemName: 'Cơm gà xối mỡ',
        quantity: 2,
        status: 'preparing',
        estimatedPrepTime: 15,
        preparationStartedAt: minutesAgo(8),
        createdAt: minutesAgo(12),
      },
    ]),
  },
  // Order 5: Normal priority with mixed statuses
  {
    id: 'ord-005',
    orderNumber: 'ORD-1028',
    tableId: 'tbl-2',
    tableNumber: '2',
    zoneName: 'Tầng 1',
    waiterId: 'usr-2',
    waiterName: 'Trần Thị B',
    status: 'in_progress',
    priority: 'normal',
    specialInstructions: null,
    createdAt: minutesAgo(8),
    updatedAt: minutesAgo(1),
    items: createMockItems('ord-005', [
      {
        menuItemName: 'Khoai tây chiên',
        quantity: 2,
        status: 'ready',
        estimatedPrepTime: 8,
        preparationStartedAt: minutesAgo(7),
        preparationCompletedAt: minutesAgo(2),
        createdAt: minutesAgo(8),
      },
      {
        menuItemName: 'Cà phê sữa đá',
        quantity: 2,
        status: 'preparing',
        specialInstructions: 'Ít đường',
        estimatedPrepTime: 5,
        preparationStartedAt: minutesAgo(4),
        createdAt: minutesAgo(8),
      },
    ]),
  },
  // Order 6: All items pending
  {
    id: 'ord-006',
    orderNumber: 'ORD-1029',
    tableId: 'tbl-9',
    tableNumber: '9',
    zoneName: 'Tầng 1',
    waiterId: 'usr-1',
    waiterName: 'Nguyễn Văn A',
    status: 'accepted',
    priority: 'normal',
    specialInstructions: null,
    createdAt: minutesAgo(2),
    updatedAt: minutesAgo(2),
    items: createMockItems('ord-006', [
      {
        menuItemName: 'Gỏi cuốn',
        quantity: 2,
        status: 'pending',
        estimatedPrepTime: 10,
        createdAt: minutesAgo(2),
      },
      {
        menuItemName: 'Chả giò',
        quantity: 1,
        status: 'pending',
        estimatedPrepTime: 12,
        createdAt: minutesAgo(2),
      },
    ]),
  },
]

// Get KDS stats
export function getMockKdsStats(orders: KdsOrder[]) {
  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled', 'abandoned'].includes(o.status),
  )

  const overdueOrders = activeOrders.filter((o) => {
    // Parse ISO string to Date
    const elapsed = (Date.now() - new Date(o.createdAt).getTime()) / 60000
    const maxPrepTime = Math.max(...o.items.map((i) => i.estimatedPrepTime || 15))
    return elapsed > maxPrepTime * 1.5
  })

  return {
    total: orders.length,
    activeCount: activeOrders.length,
    overdueCount: overdueOrders.length,
  }
}

