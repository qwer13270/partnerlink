export function getUploadKey(mediaType: 'image' | 'video', sortOrder: number, file: File) {
  return `${mediaType}-${sortOrder}-${file.name}-${file.size}`
}

export async function uploadKolMediaFile({
  token,
  applicationId,
  mediaType,
  sortOrder,
  isProfile,
  file,
  onProgress,
}: {
  token: string
  applicationId: string
  mediaType: 'image' | 'video'
  sortOrder: number
  isProfile: boolean
  file: File
  onProgress: (progress: number) => void
}) {
  const formData = new FormData()
  formData.append('applicationId', applicationId)
  formData.append('mediaType', mediaType)
  formData.append('sortOrder', String(sortOrder))
  formData.append('isProfile', isProfile ? 'true' : 'false')
  formData.append('file', file)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/kol/media')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      onProgress(progress)
    }

    xhr.onerror = () => reject(new Error('媒體上傳失敗，網路連線中斷。'))
    xhr.onabort = () => reject(new Error('媒體上傳已中止。'))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
        return
      }
      const payload = JSON.parse(xhr.responseText || '{}') as { error?: string }
      reject(new Error(payload.error ?? `媒體上傳失敗（${xhr.status}）`))
    }

    xhr.send(formData)
  })
}
