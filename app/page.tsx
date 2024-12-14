import Link from 'next/link'
import { FiChevronsRight } from 'react-icons/fi'
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
        {articles.length > 0 ?
          articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          )) :
          <p className="my-2 text-base font-normal">(no posts)</p>
        }
      </div>

      <div className="my-8">
        <h2 className="text-lg font-bold">diary</h2>
        <p className="my-2 text-base font-normal">
          <FiChevronsRight className="text-xl pb-[2px] inline-block mr-1" />
          <Link href="https://diary.apkas.net" target="_blank" className="text-blue-500">eskarun (diary.apkas.net)</Link>
        </p>
      </div>
    </main>
  )
}
