import Link from 'next/link'
import { format } from 'date-fns'
import { getAllTags, searchBlogsByTag } from '@/core/fetch/blog'

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map(tag => ({ id: tag.tag_id.toString() }))
}

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const tag_id = parseInt((await params).id)
  const res = await searchBlogsByTag(tag_id)
  if (!res) return
  const { tag, blogs } = res

  return (<main className="max-w-[800pt] mx-auto mt-4 px-0 md:px-4 py-4">
    <section className="px-4 md:px-0">
      <p className="my-1 text-sm font-normal">
        <Link href="/" className="text-blue-500">apkas</Link>
      </p>
      <h1 className="mt-2 mb-4 text-xl font-bold">タグ: {tag.name}の記事一覧</h1>
    </section>

    <section className="mt-8">
      {blogs.map(blog => (
        <div key={blog.blog_id} className="mt-6">
          <p className="my-1 text-sm">
            {format(blog.created_at, 'yyyy-MM-dd')}
            {blog.tags.map(tag => (
              <span key={tag.tag_id} className="ml-2 text-sm">#{tag.name}</span>
            ))}
          </p>
          <h1 className="mb-2 text-base font-bold">
            <Link href={`/blog/entry/${blog.blog_id}`} className="text-blue-500">{blog.title}</Link>
          </h1>
          <p className="mt-1 text-sm text-gray-500 leading-5 line-clamp-3">{blog.content}</p>
        </div>
      ))}
    </section>
  </main>)
}
