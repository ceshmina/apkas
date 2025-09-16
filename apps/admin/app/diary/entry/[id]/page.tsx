import Markdown from 'react-markdown'

import { formatDiaryTitle, getDiaryByID } from '@/core/diary'


export default async function Page({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params
  const diary = await getDiaryByID(id)
  if (!diary) {
    return null
  }
  return (<div>
    <main className="p-4">
      <section className="my-4">
        <h1 className="text-2xl font-bold">{formatDiaryTitle(diary)}</h1>
      </section>

      <section className="my-4">
        <div className="my-2">
          <Markdown
            components={{
              h2: ({ children }) => (<h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>),
              p: ({ children }) => (<p className="text-sm font-normal my-1">{children}</p>),
              ul: ({ children }) => (<ul className="my-2 pl-5">{children}</ul>),
              li: ({ children }) => (<li className="text-sm font-normal my-1 list-disc">{children}</li>),
            }}
          >{diary.content}</Markdown>
        </div>
      </section>
    </main>
  </div>)
}
