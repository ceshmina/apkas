// CloudFront Function（ビューアリクエスト）
//
// S3 の REST エンドポイントは、サブディレクトリに対する index ドキュメントの
// 解決を行わない。`/` は default_root_object が拾うが、それより深いパスは
// 誰も解決しないため、拡張子を持たないパスに `/index.html` を補う。
//
// いまのサイトは 1 ページだけなので出番はないが、`src/about/index.html` の
// ように増やしたときに `/about` で開けるようにしておく。

function handler(event) {
  var request = event.request
  var uri = request.uri

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html'
    return request
  }

  // 最後のセグメントに `.` が含まれていればファイルとみなし、そのまま通す。
  // `/assets/style.css` や `/favicon.png` はここで素通りする。
  var lastSlash = uri.lastIndexOf('/')
  var lastSegment = uri.slice(lastSlash + 1)

  if (lastSegment.indexOf('.') === -1) {
    request.uri = uri + '/index.html'
  }

  return request
}
