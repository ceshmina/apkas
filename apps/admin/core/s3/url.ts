export const generatePresignedUrl = async (
  file: File,
  setUploadUrl: (url: string) => void,
  setPhotoId: (id: string) => void,
  setIsGenerating: (loading: boolean) => void,
  setMessage: (msg: string) => void,
  setErrorMessage: (msg: string) => void,
) => {
  setIsGenerating(true)
  setErrorMessage('')
  setMessage('')

  try {
    const res = await fetch('/api/s3/presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error)
    }

    const { uploadUrl: url, photoId: id } = await res.json()
    setUploadUrl(url)
    setPhotoId(id)
    setMessage('署名付きURLを発行しました')
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Internal server error')
  } finally {
    setIsGenerating(false)
  }
}
