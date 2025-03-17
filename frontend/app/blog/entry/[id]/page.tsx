import Link from 'next/link'
import { format } from 'date-fns'
import { FaPen, FaTag } from 'react-icons/fa6'
import Markdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight'
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { getAllBlogs, getBlogById } from '@/core/fetch/blog'

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ id: blog.blog_id.toString() }))
}

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const blog_id = parseInt((await params).id)
  const blog = await getBlogById(blog_id)
  if (!blog) return

  const created_str = format(blog.created_at, 'yyyy-MM-dd')

  return (<main className="max-w-[800pt] mx-auto mt-4 px-0 md:px-4 py-4">
    <section className="px-4 md:px-0">
      <p className="my-1 text-sm font-normal">
        <Link href="/" className="text-blue-500">apkas</Link>
      </p>
      <h1 className="mt-2 mb-4 text-xl font-bold">{blog.title}</h1>
      <p className="my-2 text-sm font-normal text-gray-500">
        <FaPen className="inline-block mr-1 pb-0.5" />{created_str}
      </p>
    </section>

    <section className="mt-8">
      <Markdown components={{
        p: ({ children }) => <p className="my-2 px-4 md:px-0 leading-6 text-sm font-normal">{children}</p>,
        a: ({ children, href }) => (
          href ?
          (<a className="text-blue-500" href={href} target="_blank">{children}</a>) :
          (<a>{children}</a>)
        ),
        h2: ({ children }) => <h2 className="mt-8 mb-4 px-4 md:px-0 text-lg font-bold">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-6 mb-3 px-4 md:px-0 text-base font-bold">{children}</h3>,
        hr: () => <hr className="mx-auto my-8 w-36 h-0.5 bg-gray-500" />,
        ul: ({ children }) => <ul
          className="ml-1 my-2 px-4 md:px-0 list-disc list-inside text-sm font-normal"
        >{children}</ul>, 
        li: ({ children }) => <li className="my-1 leading-6">{children}</li>,
        pre: ({ children }) => <pre className="my-4 p-4 bg-gray-100">{children}</pre>,
        code: ({ className, children }) => {
          const lang = className && className.split('-')[1]
          return className ?
            <div className="relative">
              {lang && lang !== 'plaintext' && <p
                className="absolute right-0 top-[-8px] text-xs text-gray-500 text-right"
              >{lang}</p>}
              <SyntaxHighlighter
                language={lang}
                style={github}
                className="text-sm"
                customStyle={{ background: 'inherit', padding: 0 }}
              >
                {String(children)}
              </SyntaxHighlighter>
            </div> :
            <code className="text-sm bg-gray-100 mx-0.5 px-1.5 py-0.5 rounded-md">{children}</code>
        },
      }}>{blog.content.replaceAll(/\\n/g, '\n')}</Markdown>
    </section>

    <section className="mt-8 px-4 md:px-0">
      <p className="text-sm text-gray-500 font-normal">
        <FaTag className="inline-block" />
        {blog.tags.length > 0 ?
          blog.tags.map(tag => (
            <span key={tag.tag_id} className="ml-2">#{tag.name}</span>
          )) :
          (<span className="ml-2">no tags</span>)
        }
      </p>
    </section>
  </main>)
}
