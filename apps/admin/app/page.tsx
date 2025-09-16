import Link from 'next/link'

import { formatDiaryTitle, getAllDiaries } from '@/core/diary'


export default async function Home() {
  const diaries = await getAllDiaries()

  return (<div>
    <main className="p-4">
      <section className="my-4">
        <h1 className="text-2xl font-bold">apkas admin</h1>
      </section>

      <section className="my-8">
        <h2 className="text-lg font-bold">Diary</h2>
        <div className="my-4">
          <Link href="/diary/new">
            <button className="bg-blue-500 hover:bg-blue-600 rounded px-2 py-1 text-sm text-white font-bold">新規</button>
          </Link>
        </div>
        <div className="my-4">
          {diaries.length > 0
            ? diaries.map((x, i) => (
              <h3 key={i} className="text-base font-bold my-2">
                <Link href={`/diary/edit/${x.id}`} className="text-blue-500">{formatDiaryTitle(x)}</Link>
              </h3>
            ))
            : <p className="text-sm text-gray-500 font-normal my-2">まだ日記はありません</p>
          }
        </div>
      </section>
    </main>
  </div>)
}
