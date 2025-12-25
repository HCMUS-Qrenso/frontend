/**
 * Download a blob as a file
 * @param blob - The blob to download
 * @param filename - The filename for the downloaded file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob)

  // Create a temporary anchor element
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Extract filename from Content-Disposition header
 * @param contentDisposition - The Content-Disposition header value
 * @returns The filename or a default name
 */
export function extractFilenameFromHeader(
  contentDisposition: string | null,
  defaultName: string,
): string {
  if (!contentDisposition) return defaultName

  // Try to extract filename from Content-Disposition header
  // Format: attachment; filename="table-1-qr.png" or attachment; filename=table-1-qr.png
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)

  if (filenameMatch && filenameMatch[1]) {
    // Remove quotes if present
    let filename = filenameMatch[1].replace(/['"]/g, '')
    // Decode URI if needed
    try {
      filename = decodeURIComponent(filename)
    } catch {
      // If decoding fails, use as is
    }
    return filename
  }

  return defaultName
}

/**
 * Download blob with filename from response headers
 * @param blob - The blob to download
 * @param responseHeaders - The response headers (from axios response)
 * @param defaultFilename - Default filename if header is not found
 */
export function downloadBlobWithHeaders(
  blob: Blob,
  responseHeaders: Record<string, string>,
  defaultFilename: string,
): void {
  const contentDisposition = responseHeaders['content-disposition'] || null
  const filename = extractFilenameFromHeader(contentDisposition, defaultFilename)
  downloadBlob(blob, filename)
}
