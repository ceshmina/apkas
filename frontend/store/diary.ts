import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'

import type { GetAllDiaries } from '@/model/diary'


const dynamodb = new DynamoDBClient({
  endpoint: 'http://localhost:4566',
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
})


export const getAllDiariesFromDynamoDB: GetAllDiaries = async () => {
  const command = new ScanCommand({
    TableName: 'diary',
    ProjectionExpression: 'title, created_at',
  })
  const response = await dynamodb.send(command)
  if (!response.Items) {
    throw new Error('DynamoDBからのデータ取得に失敗しました: 結果にItemsが含まれません')
  }
  const diaries = response.Items.map(x => ({
    title: x.title.S || '',
    createdAt: new Date(x.created_at.S || ''),
  }))
  return diaries.filter(x => !isNaN(x.createdAt.getTime()))
    .sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime()))
}
