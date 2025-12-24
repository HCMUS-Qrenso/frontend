/**
 * Download Helpers Unit Tests
 *
 * Tests for file download utilities.
 */

import {
  downloadBlob,
  extractFilenameFromHeader,
  downloadBlobWithHeaders,
} from '../download'

describe('downloadBlob', () => {
  let mockLink: {
    href: string
    download: string
    click: jest.Mock
  }

  beforeEach(() => {
    // Mock document.createElement
    mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create object URL for blob', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' })

    downloadBlob(blob, 'test.txt')

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('should set correct filename on link', () => {
    const blob = new Blob(['test'], { type: 'text/plain' })

    downloadBlob(blob, 'my-file.txt')

    expect(mockLink.download).toBe('my-file.txt')
  })

  it('should trigger click on link', () => {
    const blob = new Blob(['test'], { type: 'text/plain' })

    downloadBlob(blob, 'test.txt')

    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should append link to body and remove after click', () => {
    const blob = new Blob(['test'], { type: 'text/plain' })

    downloadBlob(blob, 'test.txt')

    expect(document.body.appendChild).toHaveBeenCalled()
    expect(document.body.removeChild).toHaveBeenCalled()
  })

  it('should revoke object URL after download', () => {
    const blob = new Blob(['test'], { type: 'text/plain' })

    downloadBlob(blob, 'test.txt')

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})

describe('extractFilenameFromHeader', () => {
  it('should return default name when header is null', () => {
    expect(extractFilenameFromHeader(null, 'default.txt')).toBe('default.txt')
  })

  it('should extract filename from header with double quotes', () => {
    const header = 'attachment; filename="table-1-qr.png"'

    expect(extractFilenameFromHeader(header, 'default.png')).toBe('table-1-qr.png')
  })

  it('should extract filename from header with single quotes', () => {
    const header = "attachment; filename='report.pdf'"

    expect(extractFilenameFromHeader(header, 'default.pdf')).toBe('report.pdf')
  })

  it('should extract filename from header without quotes', () => {
    const header = 'attachment; filename=data.csv'

    expect(extractFilenameFromHeader(header, 'default.csv')).toBe('data.csv')
  })

  it('should decode URI-encoded filename', () => {
    const header = 'attachment; filename="b%C3%A0n%201.png"'

    expect(extractFilenameFromHeader(header, 'default.png')).toBe('bàn 1.png')
  })

  it('should handle filename with spaces', () => {
    const header = 'attachment; filename="my file name.pdf"'

    expect(extractFilenameFromHeader(header, 'default.pdf')).toBe('my file name.pdf')
  })

  it('should return default if filename not found in header', () => {
    const header = 'attachment; other-param=value'

    expect(extractFilenameFromHeader(header, 'fallback.txt')).toBe('fallback.txt')
  })

  it('should handle header with additional parameters', () => {
    const header = 'attachment; filename="document.pdf"; size=1234'

    expect(extractFilenameFromHeader(header, 'default.pdf')).toBe('document.pdf')
  })

  it('should handle empty string header', () => {
    expect(extractFilenameFromHeader('', 'default.txt')).toBe('default.txt')
  })

  it('should handle malformed URI encoding gracefully', () => {
    // %ZZ is not valid URL encoding
    const header = 'attachment; filename="%ZZinvalid.txt"'

    // Should return the raw filename since decoding fails
    expect(extractFilenameFromHeader(header, 'default.txt')).toBe('%ZZinvalid.txt')
  })
})

describe('downloadBlobWithHeaders', () => {
  let mockLink: {
    href: string
    download: string
    click: jest.Mock
  }

  beforeEach(() => {
    mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should use filename from Content-Disposition header', () => {
    const blob = new Blob(['test'], { type: 'image/png' })
    const headers = {
      'content-disposition': 'attachment; filename="qr-code.png"',
    }

    downloadBlobWithHeaders(blob, headers, 'default.png')

    expect(mockLink.download).toBe('qr-code.png')
  })

  it('should use default filename when header is missing', () => {
    const blob = new Blob(['test'], { type: 'image/png' })
    const headers = {}

    downloadBlobWithHeaders(blob, headers, 'default-file.png')

    expect(mockLink.download).toBe('default-file.png')
  })

  it('should handle empty headers object', () => {
    const blob = new Blob(['test'], { type: 'text/csv' })

    downloadBlobWithHeaders(blob, {}, 'export.csv')

    expect(mockLink.download).toBe('export.csv')
  })

  it('should trigger download with correct blob', () => {
    const blob = new Blob(['csv,data'], { type: 'text/csv' })
    const headers = {
      'content-disposition': 'attachment; filename="data.csv"',
    }

    downloadBlobWithHeaders(blob, headers, 'default.csv')

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(mockLink.click).toHaveBeenCalled()
  })
})
