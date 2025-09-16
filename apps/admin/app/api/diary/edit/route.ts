import { NextResponse } from 'next/server'

import { Diary } from '@apkas/diary/model/entry'
import { putDiary } from '@/core/diary'


export const POST = async (request: Request) => {
  const { id, title, content, createdAt } = await request.json()
  if (!id || !content || !createdAt) {
    return NextResponse.json(
      { error: '日記のID、本文、作成日時は必須です' },
      { status: 422 },
    )
  }

  const diary = new Diary(id, title || '', content, new Date(createdAt), new Date())
  try {
    const res = await putDiary(diary, true)
    return NextResponse.json(res, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
