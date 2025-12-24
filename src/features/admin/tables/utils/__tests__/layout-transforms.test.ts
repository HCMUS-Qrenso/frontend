/**
 * Layout Transforms Unit Tests
 *
 * Tests for table layout transformation utilities.
 */

import {
  mapStatus,
  mapShape,
  mapStatusToBackend,
  mapShapeToBackend,
  calculateTableSize,
  transformTableToItem,
} from '../layout-transforms'

describe('mapStatus', () => {
  it('should map "available" to "Available"', () => {
    expect(mapStatus('available')).toBe('Available')
  })

  it('should map "occupied" to "Occupied"', () => {
    expect(mapStatus('occupied')).toBe('Occupied')
  })

  it('should map "waiting_for_payment" to "Waiting for bill"', () => {
    expect(mapStatus('waiting_for_payment')).toBe('Waiting for bill')
  })

  it('should map "maintenance" to "Disabled"', () => {
    expect(mapStatus('maintenance')).toBe('Disabled')
  })

  it('should default to "Available" for unknown status', () => {
    expect(mapStatus('unknown')).toBe('Available')
  })
})

describe('mapShape', () => {
  it('should map "circle" to "circle"', () => {
    expect(mapShape('circle')).toBe('circle')
  })

  it('should map "oval" to "oval"', () => {
    expect(mapShape('oval')).toBe('oval')
  })

  it('should map "rectangle" to "rectangle"', () => {
    expect(mapShape('rectangle')).toBe('rectangle')
  })

  it('should default to "rectangle" for null', () => {
    expect(mapShape(null)).toBe('rectangle')
  })

  it('should default to "rectangle" for unknown shape', () => {
    expect(mapShape('hexagon')).toBe('rectangle')
  })
})

describe('mapStatusToBackend', () => {
  it('should map "Available" to "available"', () => {
    expect(mapStatusToBackend('Available')).toBe('available')
  })

  it('should map "Occupied" to "occupied"', () => {
    expect(mapStatusToBackend('Occupied')).toBe('occupied')
  })

  it('should map "Waiting for bill" to "waiting_for_payment"', () => {
    expect(mapStatusToBackend('Waiting for bill')).toBe('waiting_for_payment')
  })

  it('should map "Disabled" to "maintenance"', () => {
    expect(mapStatusToBackend('Disabled')).toBe('maintenance')
  })
})

describe('mapShapeToBackend', () => {
  it('should map "circle" to "circle"', () => {
    expect(mapShapeToBackend('circle')).toBe('circle')
  })

  it('should map "oval" to "oval"', () => {
    expect(mapShapeToBackend('oval')).toBe('oval')
  })

  it('should map "rectangle" to "rectangle"', () => {
    expect(mapShapeToBackend('rectangle')).toBe('rectangle')
  })
})

describe('calculateTableSize', () => {
  describe('rectangle tables', () => {
    it('should return 80x80 for 2 seats', () => {
      expect(calculateTableSize('rectangle', 2)).toEqual({ width: 80, height: 80 })
    })

    it('should return 120x80 for 4 seats', () => {
      expect(calculateTableSize('rectangle', 4)).toEqual({ width: 120, height: 80 })
    })

    it('should return 140x80 for 6 seats', () => {
      expect(calculateTableSize('rectangle', 6)).toEqual({ width: 140, height: 80 })
    })

    it('should return 160x100 for 8 seats', () => {
      expect(calculateTableSize('rectangle', 8)).toEqual({ width: 160, height: 100 })
    })

    it('should return 180x100 for 10 seats', () => {
      expect(calculateTableSize('rectangle', 10)).toEqual({ width: 180, height: 100 })
    })

    it('should scale for 12+ seats', () => {
      const size = calculateTableSize('rectangle', 12)
      expect(size.width).toBeGreaterThan(180)
      expect(size.height).toBeGreaterThan(100)
    })
  })

  describe('circle tables', () => {
    it('should return 80x80 for 2 seats', () => {
      expect(calculateTableSize('circle', 2)).toEqual({ width: 80, height: 80 })
    })

    it('should return 100x100 for 4 seats', () => {
      expect(calculateTableSize('circle', 4)).toEqual({ width: 100, height: 100 })
    })

    it('should have equal width and height', () => {
      const size = calculateTableSize('circle', 6)
      expect(size.width).toBe(size.height)
    })
  })

  describe('oval tables', () => {
    it('should return 90x70 for 2 seats', () => {
      expect(calculateTableSize('oval', 2)).toEqual({ width: 90, height: 70 })
    })

    it('should have width > height', () => {
      const size = calculateTableSize('oval', 4)
      expect(size.width).toBeGreaterThan(size.height)
    })
  })
})

describe('transformTableToItem', () => {
  const mockZoneLayoutTable = {
    id: 'table-1',
    name: 'Bàn 1',
    seats: 4,
    status: 'available',
    type: 'rectangle',
    position: { x: 100, y: 200, rotation: 45 },
    zone: 'Tầng 1',
  }

  it('should transform basic table data', () => {
    const result = transformTableToItem(mockZoneLayoutTable)

    expect(result.id).toBe('table-1')
    expect(result.name).toBe('Bàn 1')
    expect(result.seats).toBe(4)
  })

  it('should map status correctly', () => {
    const result = transformTableToItem(mockZoneLayoutTable)
    expect(result.status).toBe('Available')
  })

  it('should map shape correctly', () => {
    const result = transformTableToItem(mockZoneLayoutTable)
    expect(result.type).toBe('rectangle')
  })

  it('should include position with rotation', () => {
    const result = transformTableToItem(mockZoneLayoutTable)

    expect(result.position.x).toBe(100)
    expect(result.position.y).toBe(200)
    expect(result.position.rotation).toBe(45)
  })

  it('should calculate size based on type and seats', () => {
    const result = transformTableToItem(mockZoneLayoutTable)

    expect(result.size).toEqual({ width: 120, height: 80 })
  })

  it('should set canBeMerged true for rectangle', () => {
    const result = transformTableToItem(mockZoneLayoutTable)
    expect(result.canBeMerged).toBe(true)
  })

  it('should set canBeMerged false for circle', () => {
    const circleTable = { ...mockZoneLayoutTable, type: 'circle' }
    const result = transformTableToItem(circleTable)
    expect(result.canBeMerged).toBe(false)
  })

  it('should handle zone field', () => {
    const result = transformTableToItem(mockZoneLayoutTable)
    expect(result.area).toBe('Tầng 1')
  })

  it('should default rotation to 0 if not provided', () => {
    const tableWithoutRotation = {
      ...mockZoneLayoutTable,
      position: { x: 100, y: 200 },
    }
    const result = transformTableToItem(tableWithoutRotation as any)
    expect(result.rotation).toBe(0)
  })
})
