import { useState, useCallback } from 'react'
import { uploadsApi } from '@/lib/api/uploads'
import { toast } from 'sonner'

export interface UploadResult {
  key: string
  url: string // Full public URL
}

interface UseUploadFilesOptions {
  group?: string
  onProgress?: (progress: number) => void
}

/**
 * Hook for uploading files to S3 via presigned URLs
 *
 * @example
 * ```tsx
 * const { uploadFiles, isUploading, progress } = useUploadFiles()
 *
 * const handleUpload = async (files: File[]) => {
 *   const results = await uploadFiles(files, { group: 'menu-images' })
 *   console.log(results) // [{ key: 'menu-images/abc.jpg', url: 'http://...' }]
 * }
 * ```
 */
export function useUploadFiles() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFiles = useCallback(
    async (files: File[], options: UseUploadFilesOptions = {}): Promise<UploadResult[]> => {
      const { group = 'uploads', onProgress } = options

      if (files.length === 0) return []

      setIsUploading(true)
      setProgress(0)

      try {
        const s3Endpoint = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || 'http://localhost:9000'
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'uploads'

        // Upload all files in parallel
        const uploadPromises = files.map(async (file, index) => {
          // 1. Get presigned URL from backend
          const { uploadUrl, key } = await uploadsApi.getPresignedUrl({
            fileName: file.name,
            contentType: file.type,
            group,
            fileSize: file.size,
          })

          // 2. Upload file directly to S3/MinIO
          await uploadsApi.uploadToS3(uploadUrl, file)

          // 3. Construct public URL
          const publicUrl = `${s3Endpoint}/${bucketName}/${key}`

          return { key, url: publicUrl }
        })

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises)

        setProgress(100)
        onProgress?.(100)

        return results
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Không thể upload ảnh. Vui lòng thử lại.')
        throw error
      } finally {
        setIsUploading(false)
        setProgress(0)
      }
    },
    [],
  )

  return { uploadFiles, isUploading, progress }
}
