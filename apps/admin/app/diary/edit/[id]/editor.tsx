'use client'

import { useState } from 'react'

import Markdown from '@/components/markdown'
import { formatDate, formatDateForInput } from '@/core/diary'


type Props = {
  initialTitle: string
  initialContent: string
  createdAt: Date
}


export default function Editor({ initialTitle, initialContent, createdAt }: Props) {
  const [date, setDate] = useState(createdAt)
  const [title, setTitle] = useState(initialTitle)
  const [isTitleEditing, setIsTitleEditing] = useState(false)

  const [content, setContent] = useState(initialContent)
  const [isContentEditing, setIsContentEditing] = useState(true)

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const save = async () => {
    try {
      const res = await fetch('/api/diary/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: formatDateForInput(date).replaceAll('-', ''), title, content }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      setMessage('保存しました')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Internal server error')
    }
  }

  return (<div>
    <main className="p-4">
      <section className="my-4">
        {isTitleEditing
        ? <div className="flex justify-between">
            <h1 className="mr-2 text-base">
              <input
                type="date"
                className="w-32 border-[1px] border-gray-300 rounded px-1.5 py-1"
                value={formatDateForInput(date)}
                onChange={(e) => setDate(e.target.valueAsDate || new Date())}
              />
            </h1>
            <h1 className="flex-1 mr-2 text-lg">
              <input
                className="w-[100%] border-[1px] border-gray-300 rounded px-1.5 py-0.5"
                placeholder="カスタムタイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </h1>
            <button
              className="border-[1px] border-gray-300 rounded px-2 text-sm"
              onClick={() => setIsTitleEditing(false)}
            >保存</button>
          </div>
        : <div className="flex justify-between">
            <h1 className="text-2xl font-bold">
              {formatDate(date)}{title && `: ${title}`}
            </h1>
            <button
              className="border-[1px] border-gray-300 rounded px-2 text-sm"
              onClick={() => setIsTitleEditing(true)}
            >編集</button>
          </div>
        }
      </section>

      <section className="my-8">
        <div className="flex">
          <button
            className={`
              border-[1px] border-b-0 border-gray-300 rounded-t px-2 py-1 text-sm mr-2
              ${isContentEditing ? 'font-bold' : 'bg-gray-100'}
            `}
            onClick={() => setIsContentEditing(true)}
          >編集</button>
          <button
            className={`
              border-[1px] border-b-0 border-gray-300 rounded-t px-2 py-1 text-sm
              ${isContentEditing ? 'bg-gray-100' : 'font-bold'}
            `}
            onClick={() => setIsContentEditing(false)}
          >プレビュー</button>
        </div>
        <div className="border-[1px] border-gray-300 rounded-b p-4">
          {isContentEditing
          ? <div>
              <textarea
                rows={20}
                className="w-[100%] text-sm p-2"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          : <div>
              <Markdown>{content}</Markdown>
            </div>
          }
        </div>
      </section>

      <section className="my-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 rounded px-2 py-1 text-sm text-white font-bold"
          onClick={save}
        >保存</button>
      </section>

      {message && <section className="my-4">
        <div className="bg-blue-100 rounded p-4">
          <p className="text-blue-500 text-sm font-bold">{message}</p>
        </div>
      </section>}

      {errorMessage && <section className="my-4">
        <div className="bg-red-100 rounded p-4">
          <p className="text-red-500 text-sm font-bold">{errorMessage}</p>
        </div>
      </section>}
    </main>
  </div>)
}
