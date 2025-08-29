import { describe, expect, test } from 'bun:test'

import { diaryIDToKey, extractDiaryID, getAllDiariesFromDynamoDB, getDiaryByIDFromDynamoDB } from './diary'


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

  test('存在しないIDを指定した場合、nullが返る', async () => {
    const diary = await getDiaryByIDFromDynamoDB('20991231')
    expect(diary).toBe(null)
  })
})
