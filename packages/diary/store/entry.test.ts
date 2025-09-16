import { afterEach, describe, expect, test } from 'bun:test'

import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Diary } from '../model/entry'
import {
  diaryIDToKey,
  extractDiaryID,
  getAllDiariesFromDynamoDB,
  getDiaryByIDFromDynamoDB,
  putDiaryToDynamoDB,
} from './entry'


const dynamodb = new DynamoDBClient({
  endpoint: 'http://localhost:4566',
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
})


describe('DynamoDBのキーから日記のIDを抽出できる', () => {
  test('正常な場合', () => {
    expect(extractDiaryID('diary#20250101')).toBe('20250101')
  })

  test('空文字の場合', () => {
    expect(extractDiaryID('diary#')).toBe('')
  })

  test('意図していない形式の場合', () => {
    expect(extractDiaryID('invalid')).toBe('')
  })
})

test('日記IDからDynamoDBのキーに変換できる', () => {
  expect(diaryIDToKey('20250101')).toBe('diary#20250101')
})


test('DynamoDBからすべての日記を取得できる', async () => {
  const diaries = await getAllDiariesFromDynamoDB()
  expect(diaries.map(x => x.id)).toEqual(['20250103', '20250102', '20250101'])
  expect(diaries.map(x => x.title)).toEqual(['テスト日記3', 'テスト日記2', 'テスト日記1'])
  expect(diaries.map(x => x.createdAt)).toEqual([
    new Date('2025-01-03T21:00:00+09:00'),
    new Date('2025-01-02T21:00:00+09:00'),
    new Date('2025-01-01T21:00:00+09:00'),
  ])
})


describe('DynamoDBから個別の日記を取得できる', () => {
  test('指定したIDの日記を取得できる', async () => {
    const diary = await getDiaryByIDFromDynamoDB('20250101')
    expect(diary!.id).toBe('20250101')
    expect(diary!.title).toBe('テスト日記1')
    expect(diary!.createdAt).toEqual(new Date('2025-01-01T21:00:00+09:00'))
  })

  test('無効なIDを指定した場合、nullが返る', async () => {
    const diary = await getDiaryByIDFromDynamoDB('20991230')
    expect(diary).toBe(null)
  })

  test('存在しないIDを指定した場合、nullが返る', async () => {
    const diary = await getDiaryByIDFromDynamoDB('20991231')
    expect(diary).toBe(null)
  })
})


describe('DynamoDBに新しい日記を配置できる', () => {
  const putIds: string[] = []
  afterEach(async () => {
    for (const id of putIds) {
      const key = {
        pid: { 'S': diaryIDToKey(id) },
        sid: { 'S': diaryIDToKey(id) },
      }
      const command = new DeleteItemCommand({
        TableName: 'diary',
        Key: key,
      })
      await dynamodb.send(command)
    }
  })

  test('日記を正しく配置できる', async () => {
    const id = '1'
    const diary = new Diary(id, '', '', new Date('2025-01-01T21:00:00+09:00'), new Date('2025-01-01T21:00:00+09:00'))
    const putRes = await putDiaryToDynamoDB(diary)
    putIds.push(id)
    expect(putRes!.id).toBe(id)
    const getRes = await getDiaryByIDFromDynamoDB(id)
    expect(getRes!.id).toBe(id)
  })

  test('すでに存在するIDで日記を配置しようとするとエラーになる', async () => {
    const id = '20250101'
    const diary = new Diary(id, '', '', new Date('2025-01-01T21:00:00+09:00'), new Date('2025-01-01T21:00:00+09:00'))
    expect(async () => await putDiaryToDynamoDB(diary)).toThrow()
  })
})
