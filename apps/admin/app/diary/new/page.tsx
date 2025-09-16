'use client'

import { useState } from 'react'

import Markdown from '@/components/markdown'


export default function Home() {
  const [title, setTitle] = useState('新規')
  const [isTitleEditing, setIsTitleEditing] = useState(false)

  const [content, setContent] = useState('新しい日記です。')
  const [isContentEditing, setIsContentEditing] = useState(false)

  return (<div>
    <main className="p-4">
      <section className="my-4">
        {isTitleEditing
        ? <div className="flex justify-between">
            <h1 className="flex-1 mr-2 text-lg font-sm">
              <input
                className="w-[100%] border-[1px] border-gray-300 rounded px-1.5 py-0.5"
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
              {title}
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
    </main>
  </div>)
}
