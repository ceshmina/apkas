import { describe, expect, test } from 'bun:test'

import { Diary } from '@apkas/diary/model/entry'
import { formatDate, formatDateForInput, formatDiaryTitle } from './diary'


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


describe('日付のフォーマット', () => {
  test('input用にYYYY-MM-DDに変換できる', () => {
    const date = new Date('2025-01-01')
    expect(formatDateForInput(date)).toBe('2025-01-01')
  })

  test('日本のタイムゾーンでYYYY-MM-DDに変換される', () => {
    const date = new Date('2025-01-01T21:00:00Z')
    expect(formatDateForInput(date)).toBe('2025-01-02')
  })

  test('表示用にYYYY年M月D日に変換できる', () => {
    const date = new Date('2025-01-01')
    expect(formatDate(date)).toBe('2025年1月1日')
  })
})
