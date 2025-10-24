import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'


const s3Client = ['development', 'test'].includes(process.env.NODE_ENV || '')
  ? new S3Client({
    endpoint: 'http://localhost:4566',
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
  })
  : new S3Client({
    region: 'ap-northeast-1',
  })

const BUCKET_NAME = process.env.PHOTOS_ORIGINAL_BUCKET || 'apkas-development-photos-original'


export const POST = async (request: Request) => {
  try {
    const { fileName, contentType } = await request.json()

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'ファイル名とコンテンツタイプは必須です' },
        { status: 422 },
      )
    }

    const allowedTypes = ['image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return NextResponse.json(
        { error: 'JPEG/JPG形式の画像のみアップロード可能です' },
        { status: 422 },
      )
    }

    const photoId = randomUUID()
    const key = `${photoId}/${fileName}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900  // 15分
    })

    return NextResponse.json({
      uploadUrl,
      photoId,
      key,
    }, { status: 200 })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: `署名付きURLの生成に失敗しました: ${message}` },
      { status: 500 },
    )
  }
}
