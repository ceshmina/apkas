import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKETS } from '@/lib/aws';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイル形式の検証
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPEGファイルのみ対応しています' },
        { status: 400 }
      );
    }

    // ファイルサイズの制限（10MB）
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイルの内容を読み取り
    const buffer = Buffer.from(await file.arrayBuffer());

    // S3キーの生成（UUID + 元のファイル名）
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const photoId = uuidv4();
    const s3Key = `${photoId}/${file.name}`;

    // S3にアップロード
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKETS.originalPhotos,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        photoId: photoId,
      },
    });

    await s3Client.send(putObjectCommand);

    console.log(`Photo uploaded successfully: ${s3Key}`);

    return NextResponse.json({
      success: true,
      message: 'アップロードが完了しました',
      photoId: photoId,
      s3Key: s3Key,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}