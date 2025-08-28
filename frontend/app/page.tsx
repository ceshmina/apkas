import { formatDiaryTitle, getAllDiaries } from '@/core/diary'


export default async function Home() {
  const diaries = await getAllDiaries()

  return (<div>
    <main className="p-4">
      <section className="my-4">
        <h1 className="text-2xl font-bold">apkas</h1>
      </section>

      <section className="my-8">
        <h2 className="text-lg font-bold">Diary</h2>
        <div className="my-4">
          {diaries.map((x, i) => (
            <h3 key={i} className="text-base font-bold my-2">
              {formatDiaryTitle(x)}
            </h3>
          ))}
        </div>
      </section>

      <section className="my-4">
        <h2 className="text-lg font-bold">Profile</h2>
        <div className="my-2">
          <p className="text-sm font-normal my-1">
            ソフトウェアエンジニア、データサイエンティスト。
          </p>
          <p className="text-sm font-normal my-1">
            南米の民族風音楽「フォルクローレ」を演奏します。
            フォルクローレグループ「YAMA」「GRUPO★BROTHERS」で活動中。
          </p>
        </div>
      </section>

      <section className="my-4">
        <h2 className="text-lg font-bold">Contact</h2>
        <div className="my-2">
          <p className="text-sm font-normal my-1">
            Email: <code>shu<span className="hidden">_</span>@<span className="hidden">_</span>apkas.net</code>
          </p>
        </div>
      </section>
    </main>
  </div>)
}
