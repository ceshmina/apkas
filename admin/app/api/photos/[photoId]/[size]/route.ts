import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKETS, dynamoDBClient, DYNAMODB_TABLE } from '@/lib/aws';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string; size: string } }
) {
  try {
    const { photoId, size } = params;
    
    // サイズのバリデーション
    const validSizes = ['thumbnail', 'medium', 'large'];
    if (!validSizes.includes(size)) {
      return NextResponse.json({ error: 'Invalid size' }, { status: 400 });
    }

    // DynamoDBから写真メタデータを取得してキーを確認
    const scanCommand = new ScanCommand({
      TableName: DYNAMODB_TABLE,
      FilterExpression: 'photo_id = :photoId',
      ExpressionAttributeValues: {
        ':photoId': { S: photoId }
      }
    });

    const dbResponse = await dynamoDBClient.send(scanCommand);
    
    if (!dbResponse.Items || dbResponse.Items.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const photoData = unmarshall(dbResponse.Items[0]);
    console.log('Photo data for image request:', JSON.stringify(photoData, null, 2));

    // processed_filesから正しいキーを取得
    let imageKey: string;
    if (photoData.processed_files && Array.isArray(photoData.processed_files)) {
      const processedFile = photoData.processed_files.find((file: string) => 
        file.includes(`/${size}.webp`)
      );
      
      if (processedFile) {
        // "path/to/file.webp (dimensions)" 形式から "path/to/file.webp" を抽出
        imageKey = processedFile.split(' ')[0];
      } else {
        return NextResponse.json({ error: `${size} image not found` }, { status: 404 });
      }
    } else {
      // フォールバック: original_keyからキーを推測
      const originalKey = photoData.original_key || photoData.original_file?.key;
      if (!originalKey) {
        return NextResponse.json({ error: 'No image key found' }, { status: 404 });
      }
      
      // "path/filename.ext" -> "path/filename/size.webp"
      const pathParts = originalKey.split('/');
      const filename = pathParts.pop()?.split('.')[0];
      const directory = pathParts.join('/');
      imageKey = `${directory}/${filename}/${size}.webp`;
    }

    console.log(`Fetching image with key: ${imageKey}`);

    // S3からリサイズされた画像を取得
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKETS.resizedPhotos,
      Key: imageKey,
    });

    const response = await s3Client.send(getObjectCommand);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // StreamをBufferに変換（Node.js環境対応）
    const chunks: Buffer[] = [];
    
    // AWS SDK v3のStreamをNode.jsのReadableStreamとして処理
    const stream = response.Body as any;
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}