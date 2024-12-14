import Link from 'next/link'
import { Article } from '@/core/articles'

export default function ArticleCard({ article }: Readonly<{ article: Article }>) {
  const { slug, title, content } = article

  const plainText = content.replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<[^>]*>.*?<\/[^>]*>/g, '')  // htmlタグを中身ごと削除
    .replace(/<[^>]*>/g, '')  // 残ったタグを削除
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_~`]{1,2}/g, '')
    .replace('---', '')

  return (
    <div key={slug} className="my-8">
      <p className="mb-1 text-base font-normal">
        {article.formatDate()}
        <span className="ml-2" />
        {article.tags.map(tag => (
          <span key={tag} className="ml-2 text-sm font-light text-gray-500">#{tag}</span>
        ))}
      </p>
      <h2 className="mb-2 text-lg font-bold">
        <Link href={`/articles/${slug}`} className="text-blue-500">{title}</Link>
      </h2>
      <p className="my-2 text-sm font-light line-clamp-3">
        {plainText}
      </p>
    </div>
  )
}