import Link from 'next/link'
import { format } from 'date-fns'
import type { Blog } from '@/core/model/blog'

export default async function List(props: Readonly<{ blogs: Blog[] }>) {
  const { blogs } = props

  return (<div>
    {blogs.map(blog => (
      <div key={blog.blog_id} className="mt-6">
        <p className="my-1 text-sm">
          {format(blog.created_at, 'yyyy-MM-dd')}
          {blog.tags.map(tag => (
            <span key={tag.tag_id} className="ml-2 text-sm text-gray-500">
              <Link href={`/blog/tag/${tag.tag_id}`} className="hover:text-gray-400">#{tag.name}</Link>
            </span>
          ))}
        </p>
        <h1 className="mb-2 text-base font-bold">
          <Link href={`/blog/entry/${blog.blog_id}`} className="text-blue-500">{blog.title}</Link>
        </h1>
        <p className="mt-1 text-sm text-gray-500 leading-5 line-clamp-3">{blog.content}</p>
      </div>
    ))}
  </div>)
}
