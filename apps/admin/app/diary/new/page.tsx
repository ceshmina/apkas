'use client'

import { useState } from 'react'


export default function Home() {
  const [title, setTitle] = useState('新規')
  const [isTitleEditing, setIsTitleEditing] = useState(false)

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
    </main>
  </div>)
}
