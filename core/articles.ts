import { promises as fs } from 'fs'
import path from 'path'
import { parse, format } from 'date-fns'
import matter from 'gray-matter'

export class Article {
  readonly slug: string
  readonly title: string
  readonly edit: string | null
  readonly status: string | null
  readonly tags: string[]
  readonly content: string

  constructor(slug: string, title: string, edit: string | null, status: string | null, tags: string[], content: string) {
    this.slug = slug
    this.title = title
    this.edit = edit
    this.status = status
    this.tags = tags
    this.content = content
  }
  
  formatDate() {
    return format(parse(this.slug, 'yyyyMMdd', new Date()), 'yyyy年M月d日')
  }

  formatEditDate() {
    return this.edit && format(parse(this.edit, 'yyyyMMdd', new Date()), 'yyyy年M月d日')
  }
}

export const getArticles = async () => {
  const articles: Article[] = []
  const _search = async (dir: string) => {
    const paths = await fs.readdir(dir)
    for (const p of paths) {
      const fullPath = path.join(dir, p)
      const stat = await fs.stat(fullPath)
      if (stat.isDirectory()) {
        await _search(fullPath)
      } else if (p.endsWith('.md')) {
        const markdownBody = (await fs.readFile(fullPath)).toString()
        const { content, data } = matter(markdownBody)
        if (process.env.NODE_ENV === 'production' && data.status === 'draft') {
          continue
        }
        const tags = data.tags || []
        articles.push(new Article(
          p.replace('.md', ''),
          data.title,
          data.edit || null,
          data.status || null,
          tags,
          content
        ))
      }
    }
  }
  await _search('_articles')
  return articles.sort((a, b) => b.slug.localeCompare(a.slug))
}

export const getArticleWithNexts = async (slug: string) => {
  const articles = await getArticles()
  const index = articles.findIndex(article => article.slug === slug)
  const next = articles[index - 1] || null
  const prev = articles[index + 1] || null
  return { article: articles[index], next, prev }
}
