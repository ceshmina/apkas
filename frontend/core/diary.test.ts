import { describe, expect, test } from 'bun:test'

import { Diary } from '@/model/diary'
import { formatDiaryTitle } from './diary'


describe('日記タイトルのフォーマット', () => {
  test('title属性が設定されている場合', () => {
    const diary = new Diary('テスト日記', new Date())
    expect(formatDiaryTitle(diary)).toBe(diary.getDate() + ': テスト日記')
  })

  test('title属性が空文字列の場合', () => {
    const diary = new Diary('', new Date())
    expect(formatDiaryTitle(diary)).toBe(diary.getDate())
  })
})
