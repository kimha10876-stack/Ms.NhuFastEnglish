export const MAX_UPLOAD_FILE_BYTES = 5 * 1024 * 1024

export function getUploadFileError(file: File): string | null {
  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    return 'File không được vượt quá 5MB'
  }
  return null
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
}
