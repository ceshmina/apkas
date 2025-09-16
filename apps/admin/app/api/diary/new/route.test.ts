import { describe, expect, spyOn, test } from 'bun:test'

import { Diary } from '@apkas/diary/model/entry'
import * as core from '@/core/diary'
import { POST } from './route'


describe('POST /api/diary/new', () => {
  test('正常に日記を作成できる', async () => {
    const id = '1'
    const title = 'テスト日記'
    const content = 'これはテスト日記です'
    const request = new Request('http://localhost:4000/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, content }),
    })

    const spy = spyOn(core, 'putDiary')
    spy.mockResolvedValue(new Diary(id, title, content, new Date(), new Date()))

    const response = await POST(request)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.id).toBe(id)
    expect(body.title).toBe(title)
    expect(body.content).toBe(content)
  })

  test('IDがない場合、エラーになる', async () => {
    const request = new Request('http://localhost:4000/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト日記', content: 'これはテスト日記です' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(422)
  })

  test('タイトルがない場合、エラーにならない', async () => {
    const id = '1'
    const content = 'これはテスト日記です'
    const request = new Request('http://localhost:4000/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content }),
    })

    const spy = spyOn(core, 'putDiary')
    spy.mockResolvedValue(new Diary(id, '', content, new Date(), new Date()))

    const response = await POST(request)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.id).toBe(id)
    expect(body.title).toBe('')
    expect(body.content).toBe(content)
  })

  test('本文がない場合、エラーになる', async () => {
    const request = new Request('http://localhost:4000/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '1', title: 'テスト日記' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(422)
  })

  test('日記の配置に失敗した場合、エラーになる', async () => {
    const request = new Request('http://localhost:4000/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '1', title: 'テスト日記', content: 'これはテスト日記です' }),
    })

    const spy = spyOn(core, 'putDiary')
    const message = 'putDiary内部のエラー'
    spy.mockRejectedValue(new Error(message))

    const response = await POST(request)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe(message)
  })
})
