import Link from 'next/link'
import { getArticles } from '@/core/articles'
import ArticleCard from '@/components/card'

export default async function Page() {
  const articles = await getArticles()

  return (
    <main className="max-w-screen-md mx-auto p-4">
      <div className="my-4">
        <h1 className="text-2xl font-bold">apkas</h1>
        <p className="text-base font-normal">shu&apos;s website</p>
      </div>

      <div className="my-16">
        <h2 className="text-lg font-bold">posts</h2>
        {articles.map(article => (
          <ArticleCard article={article} />
        ))}
      </div>

      <div className="my-8">
        <p className="text-base font-normal">
          <Link href="https://diary.apkas.net" target="_blank" className="text-blue-500">diary</Link>
        </p>
      </div>
    </main>
  )
}
