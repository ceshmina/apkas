import { getAllBlogs } from '@/core/fetch/blog'
import BlogList from '@/component/blog/list'

export default async function Page() {
  const blogs = await getAllBlogs()

  return (<main className="max-w-[800pt] mx-auto mt-4 p-4">
    <section>
      <h1 className="my-1 text-2xl font-bold">apkas</h1>
      <p className="my-1 text-base font-normal">shu&apos;s website</p>
    </section>

    <section className="mt-8">
      <h1 className="my-2 text-lg font-bold">Blog</h1>
      <BlogList blogs={blogs} />
    </section>

    <section className="mt-8">
      <h1 className="my-2 text-lg font-bold">Diary</h1>
      <p className="my-1 text-sm font-normal">
        <a href="https://diary.apkas.net" className="text-blue-500">eskarun</a>
      </p>
    </section>

    <section className="mt-8">
      <h1 className="my-2 text-lg font-bold">About</h1>
      <p className="my-1 text-sm font-normal">
        ソフトウェアエンジニア、データサイエンティスト。
      </p>
      <p className="my-1 text-sm font-normal">
        南米の民族音楽「フォルクローレ」を演奏している。旧「西田フレンズ」、現在は「YAMA」「グルーポ★ブラザーズ」に所属。
      </p>
      <p className="my-1 text-sm font-normal">
        写真と旅行、最近は珈琲を趣味にしたい。
      </p>
    </section>

    <section className="mt-8">
      <h1 className="my-2 text-lg font-bold">Contact</h1>
      <p className="my-1 text-sm font-normal">以下メールアドレスまでご連絡ください。</p>
      <p className="my-1 text-sm font-normal"><code>shu@apkas.net</code></p>
    </section>
  </main>)
}
