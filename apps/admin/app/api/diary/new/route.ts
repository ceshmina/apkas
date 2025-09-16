import { NextResponse } from 'next/server'

import { Diary } from '@apkas/diary/model/entry'
import { putDiary } from '@/core/diary'


export async function POST(request: Request) {
  const { id, title, content } = await request.json()
  if (!id || !content) {
    return NextResponse.json(
      { error: '日記のIDと本文は必須です' },
      { status: 422 },
    )
  }

  const createdAt = new Date()
  const diary = new Diary(id, title, content, createdAt, createdAt)
  try {
    const res = await putDiary(diary)
    return NextResponse.json(res, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
