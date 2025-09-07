import { describe, expect, test } from 'bun:test'

import { Diary } from './diary'


describe('有効な日記の判定', () => {
  test('有効な日記を判定できる', () => {
    const diary = new Diary('1', '', '', new Date('2025-01-01T21:00:00+09:00'), new Date('2025-01-01T21:00:00+09:00'))
    expect(diary.isValid()).toBe(true)
  })

  test('無効なIDを判定できる', () => {
    const diary = new Diary('', '', '', new Date('2025-01-01T21:00:00+09:00'), new Date('2025-01-01T21:00:00+09:00'))
    expect(diary.isValid()).toBe(false)
  })

  test('無効な作成時刻を判定できる', () => {
    const diary = new Diary('1', '', '', new Date(''), new Date(''))
    expect(diary.isValid()).toBe(false)
  })
})


describe('作成時刻のフォーマット', () => {
  test('作成時刻を指定したフォーマットで表示できる', () => {
    const diary = new Diary('1', '', '', new Date('2025-01-01T21:00:00+09:00'), new Date('2025-01-01T21:00:00+09:00'))
    expect(diary.getDate()).toBe('2025年1月1日')
  })

  test('作成時刻を日本のタイムゾーンで表示できる', () => {
    const diary = new Diary('1', '', '', new Date('2025-01-02T05:00:00+09:00'), new Date('2025-01-02T05:00:00+09:00'))
    expect(diary.getDate()).toBe('2025年1月2日')
  })
})


test('日記ページのURLを取得できる', () => {
  const diary = new Diary('1', '', '', new Date('2025-01-01T21:00:00+09:00'), new Date('2025-01-01T21:00:00+09:00'))
  expect(diary.getPage()).toBe('/diary/entry/1')
})
