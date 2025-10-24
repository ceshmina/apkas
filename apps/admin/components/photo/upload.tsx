'use client'

import { useState, useRef } from 'react'
import { generatePresignedUrl } from '@/core/s3/url'


type PhotoUploadProps = {
  onSuccess?: (uploadUrl: string, photoId: string) => void
  onError?: (error: string) => void
}


export default function PhotoUpload({ onSuccess, onError }: PhotoUploadProps) {
  const [uploadUrl, setUploadUrl] = useState('')
  const [photoId, setPhotoId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    let generatedUrl = ''
    let generatedId = ''

    await generatePresignedUrl(
      file,
      (url) => {
        generatedUrl = url
        setUploadUrl(url)
      },
      (id) => {
        generatedId = id
        setPhotoId(id)
      },
      setIsGenerating,
      () => {
        if (onSuccess) onSuccess(generatedUrl, generatedId)
      },
      (error) => {
        if (onError) onError(error)
      },
    )
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <section className="my-4">
      <h2 className="text-lg font-bold mb-2">写真アップロード</h2>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg"
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        className={`
          bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed
          rounded px-2 py-1 text-sm text-white font-bold
        `}
        onClick={triggerFileInput}
        disabled={isGenerating}
      >
        {isGenerating ? '処理中...' : '写真アップロード'}
      </button>

      {photoId && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm font-bold mb-2">Photo ID:</p>
          <p className="text-sm font-mono mb-4 break-all">{photoId}</p>

          <p className="text-sm font-bold mb-2">署名付きURL:</p>
          <textarea
            readOnly
            rows={4}
            className="w-full text-xs font-mono p-2 border border-gray-300 rounded bg-white"
            value={uploadUrl}
          />
        </div>
      )}
    </section>
  )
}
