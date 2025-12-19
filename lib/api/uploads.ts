import { apiClient } from '@/lib/axios'

export interface PresignUploadRequest {
  fileName: string
  contentType: string
  group?: string
  fileSize?: number
}

export interface PresignUploadResponse {
  uploadUrl: string
  key: string
}

export const uploadsApi = {
  /**
   * Get presigned URL for file upload
   * Returns an uploadUrl (for PUT to S3) and a key (object path in bucket)
   */
  getPresignedUrl: async (
    request: PresignUploadRequest
  ): Promise<PresignUploadResponse> => {
    const { data } = await apiClient.post<PresignUploadResponse>(
      '/uploads/presign',
      request
    )
    return data
  },

  /**
   * Upload file directly to S3 using presigned URL
   * @param uploadUrl - Presigned URL from getPresignedUrl
   * @param file - File object to upload
   */
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }
  },
}
