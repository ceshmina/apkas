import { describe, expect, test } from 'bun:test'

import { Diary } from '@apkas/diary/model/entry'
import { formatDiaryTitle } from './diary'


describe('日記タイトルのフォーマット', () => {
  test('title属性が設定されている場合', () => {
    const diary = new Diary('1', 'テスト日記', '', new Date(), new Date())
    expect(formatDiaryTitle(diary)).toBe(diary.getDate() + ': テスト日記')
  })

  test('title属性が空文字列の場合', () => {
    const diary = new Diary('1', '', '', new Date(), new Date())
    expect(formatDiaryTitle(diary)).toBe(diary.getDate())
  })
})
