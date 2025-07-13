import { NextResponse } from 'next/server';
import { dynamoDBClient, DYNAMODB_TABLE } from '@/lib/aws';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export async function GET() {
  try {
    // DynamoDBから写真メタデータを取得（時刻の新しい順）
    const scanCommand = new ScanCommand({
      TableName: DYNAMODB_TABLE,
    });

    const response = await dynamoDBClient.send(scanCommand);
    
    if (!response.Items) {
      return NextResponse.json({ photos: [] });
    }

    // DynamoDBアイテムをJSONオブジェクトに変換
    const photos = response.Items.map(item => {
      const unmarshalled = unmarshall(item);
      console.log('Photo data structure:', JSON.stringify(unmarshalled, null, 2));
      return unmarshalled;
    })
      // 撮影時刻（date_taken）を優先、なければ保存時刻（created_at）で降順ソート
      .sort((a, b) => {
        const dateA = a.date_taken ? new Date(a.date_taken).getTime() : 
                     a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.date_taken ? new Date(b.date_taken).getTime() : 
                     b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

    console.log(`Fetched ${photos.length} photos from DynamoDB`);
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}