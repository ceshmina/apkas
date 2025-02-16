import Link from 'next/link'
import { format } from 'date-fns'
import { getAllBlogs } from '@/core/fetch/blog'

export default async function List() {
  const blogs = await getAllBlogs()
  return (<div>
    {blogs.map(blog => (
      <div key={blog.blog_id} className="mt-4">
        <p className="text-sm">
          {format(blog.created_at, 'yyyy-MM-dd')}
          {blog.tags.map(tag => (
            <span key={tag.tag_id} className="ml-2 text-sm">#{tag.name}</span>
          ))}
        </p>
        <h1 className="text-base font-bold">
          <Link href={`/blog/entry/${blog.blog_id}`} className="text-blue-500">{blog.title}</Link>
        </h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-3">{blog.content}</p>
      </div>
    ))}
  </div>)
}
