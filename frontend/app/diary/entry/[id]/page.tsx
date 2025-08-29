import { getAllDiaries } from '@/core/diary'


export async function generateStaticParams() {
  const diaries = await getAllDiaries()
  return diaries.map(x => ({ id: x.id }))
}


export default async function Page({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params
  return (<div>
    <main className="p-4">
      <section className="my-4">
        <h1 className="text-2xl font-bold">Diary {id}</h1>
      </section>
    </main>
  </div>)
}
