import Markdown from '@/components/markdown'
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
          <Markdown>{diary.content}</Markdown>
        </div>
      </section>
    </main>
  </div>)
}
