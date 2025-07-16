import { NextRequest, NextResponse } from 'next/server';
import { s3Client, dynamoDBClient, BUCKETS, DYNAMODB_TABLE } from '@/lib/aws';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DeleteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // DynamoDBから写真メタデータを取得（photo_idでクエリ）
    const queryCommand = new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'photo_id = :photoId',
      ExpressionAttributeValues: {
        ':photoId': { S: photoId }
      }
    });

    const dynamoResponse = await dynamoDBClient.send(queryCommand);
    
    if (!dynamoResponse.Items || dynamoResponse.Items.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const photo = unmarshall(dynamoResponse.Items[0]);

    // S3から元画像を削除
    if (photo.original_key || photo.original_file?.key) {
      const originalKey = photo.original_key || photo.original_file?.key;
      const deleteOriginalCommand = new DeleteObjectCommand({
        Bucket: BUCKETS.originalPhotos,
        Key: originalKey,
      });
      await s3Client.send(deleteOriginalCommand);
      console.log(`Deleted original photo: ${originalKey}`);
    }

    // S3からリサイズされた画像を削除
    if (photo.resized_files) {
      const resizedFiles = photo.resized_files;
      const deletePromises = [];

      // thumbnail, medium, largeの各サイズを削除
      for (const [_size, fileInfo] of Object.entries(resizedFiles)) {
        if (fileInfo && typeof fileInfo === 'object' && 'key' in fileInfo && fileInfo.key) {
          const deleteResizedCommand = new DeleteObjectCommand({
            Bucket: BUCKETS.resizedPhotos,
            Key: fileInfo.key as string,
          });
          deletePromises.push(s3Client.send(deleteResizedCommand));
          console.log(`Scheduled deletion of resized photo: ${fileInfo.key}`);
        }
      }

      await Promise.all(deletePromises);
    }

    // DynamoDBからメタデータを削除（photo_idとcreated_atの両方が必要）
    const deleteItemCommand = new DeleteItemCommand({
      TableName: DYNAMODB_TABLE,
      Key: marshall({ 
        photo_id: photoId,
        created_at: photo.created_at 
      }),
    });

    await dynamoDBClient.send(deleteItemCommand);
    console.log(`Deleted photo metadata: ${photoId}`);

    return NextResponse.json({
      success: true,
      message: '写真が削除されました',
      photoId: photoId,
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: '写真の削除に失敗しました' },
      { status: 500 }
    );
  }
}