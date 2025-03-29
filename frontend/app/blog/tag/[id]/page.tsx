import Link from 'next/link'
import { getAllTags, getTagById } from '@/core/fetch/blog'

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map(tag => ({ id: tag.tag_id.toString() }))
}

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const tag_id = parseInt((await params).id)
  const tag = await getTagById(tag_id)
  if (!tag) return

  return (<main className="max-w-[800pt] mx-auto mt-4 px-0 md:px-4 py-4">
    <section className="px-4 md:px-0">
      <p className="my-1 text-sm font-normal">
        <Link href="/" className="text-blue-500">apkas</Link>
      </p>
      <h1 className="mt-2 mb-4 text-xl font-bold">タグ: {tag.name}の記事一覧</h1>
    </section>
  </main>)
}
