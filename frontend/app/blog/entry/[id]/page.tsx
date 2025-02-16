import Link from 'next/link'
import { format } from 'date-fns'
import Markdown from 'react-markdown'
import { getAllBlogs, getBlogById } from '@/core/fetch/blog'

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ id: blog.blog_id.toString() }))
}

export default async function Page({ params }: Readonly<{ params: { id: string } }>) {
  const blog = await getBlogById(parseInt(params.id))
  if (!blog) return

  const created_str = format(blog.created_at, 'yyyy-MM-dd')
  console.log(blog.content)

  return (<main className="max-w-[800pt] mx-auto mt-4 p-4">
    <section>
      <p className="my-1 text-sm font-normal">
        <Link href="/" className="text-blue-500">apkas</Link>
      </p>
      <h1 className="my-1 text-xl font-bold">{blog.title}</h1>
      <p className="my-2 text-base font-normal">{created_str}</p>
    </section>

    <section className="mt-8">
      <Markdown components={{
        p: ({ children }) => <p className="my-1 text-sm font-normal">{children}</p>,
        a: ({ children, href }) => (
          href ?
          (<a className="text-blue-500" href={href} target="_blank">{children}</a>) :
          (<a>{children}</a>)
        ),
        hr: () => <hr className="mx-auto my-8 w-36 h-0.5 bg-gray-500" />,
        ul: ({ children }) => <ul className="ml-1 my-2 list-disc list-inside text-sm font-normal">{children}</ul>, 
        li: ({ children }) => <li className="my-0.5">{children}</li>,
      }}>{blog.content.replaceAll(/\\n/g, '\n')}</Markdown>
    </section>

    <section className="mt-8">
      <p className="text-sm text-gray-500 font-normal">
        {blog.tags.map(tag => (
          <span key={tag.tag_id} className="mr-2">#{tag.name}</span>
        ))}
      </p>
    </section>
  </main>)
}
