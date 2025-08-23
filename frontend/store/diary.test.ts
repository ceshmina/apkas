import { expect, test } from 'bun:test'

import { getAllDiariesFromDynamoDB } from './diary'


test('DynamoDBからすべての日記を取得できる', async () => {
  const diaries = await getAllDiariesFromDynamoDB()
  expect(diaries).toEqual([
    { title: 'テスト日記3', createdAt: new Date('2025-01-03T21:00:00+09:00') },
    { title: 'テスト日記2', createdAt: new Date('2025-01-02T21:00:00+09:00') },
    { title: 'テスト日記1', createdAt: new Date('2025-01-01T21:00:00+09:00') },
  ])
})
