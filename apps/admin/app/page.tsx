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
          {diaries.length > 0
            ? diaries.map((x, i) => (
              <h3 key={i} className="text-base font-bold my-2">
                <Link href={x.getPage()} className="text-blue-500">{formatDiaryTitle(x)}</Link>
              </h3>
            ))
            : <p className="text-sm text-gray-500 font-normal my-2">まだ日記はありません</p>
          }
        </div>
      </section>
    </main>
  </div>)
}
