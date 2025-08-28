import { expect, test } from 'bun:test'

import { Diary } from '@/model/diary'
import { getAllDiariesFromDynamoDB } from './diary'


test('DynamoDBからすべての日記を取得できる', async () => {
  const diaries = await getAllDiariesFromDynamoDB()
  expect(diaries).toEqual([
    new Diary('テスト日記3', new Date('2025-01-03T21:00:00+09:00')),
    new Diary('テスト日記2', new Date('2025-01-02T21:00:00+09:00')),
    new Diary('テスト日記1', new Date('2025-01-01T21:00:00+09:00')),
  ])
})
