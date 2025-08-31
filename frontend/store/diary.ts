import { DynamoDBClient, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'

import { Diary } from '@/model/diary'
import type { GetAllDiaries, GetDiaryByID } from '@/model/diary'


const dynamodb = new DynamoDBClient({
  endpoint: 'http://localhost:4566',
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
})


export const extractDiaryID = (id: string) => {
  return id.split('#')[1] || ''
}

export const diaryIDToKey = (id: string) => {
  return `diary#${id}`
}

export const getAllDiariesFromDynamoDB: GetAllDiaries = async () => {
  const command = new ScanCommand({
    TableName: 'diary',
    ProjectionExpression: 'pid, sid, title, content, created_at, updated_at',
  })
  const response = await dynamodb.send(command)
  if (!response.Items) {
    throw new Error('DynamoDBからのデータ取得に失敗しました: 結果にItemsが含まれません')
  }
  const diaries = response.Items.map(x => new Diary(
    extractDiaryID(x.pid.S || ''),
    x.title.S || '',
    x.content.S || '',
    new Date(x.created_at.S || ''),
    new Date(x.updated_at.S || ''),
  ))
  return diaries.filter(x => x.isValid())
    .sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime()))
}

export const getDiaryByIDFromDynamoDB: GetDiaryByID = async (id: string) => {
  const command = new GetItemCommand({
    TableName: 'diary',
    Key: {
      pid: { 'S': diaryIDToKey(id) },
      sid: { 'S': diaryIDToKey(id) },
    },
    ProjectionExpression: 'pid, sid, title, content, created_at, updated_at',
  })
  const response = await dynamodb.send(command)
  const item = response.Item
  if (!item) {
    return null
  }
  const diary = new Diary(
    id,
    item.title.S || '',
    item.content.S || '',
    new Date(item.created_at.S || ''),
    new Date(item.updated_at.S || ''),
  )
  return diary.isValid() ? diary : null
}
