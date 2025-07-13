export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">日記</h2>
          <p className="text-gray-600">最新の日記エントリを管理できます。</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">写真</h2>
          <p className="text-gray-600">アップロードされた写真を確認・管理できます。</p>
        </div>
      </div>
    </div>
  );
}