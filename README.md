# apkas

個人のポートフォリオサイト。ビルド不要の静的サイトを S3 + CloudFront で配信する（予定）。

```
src/ ──▶ S3 ──▶ CloudFront ──▶ 閲覧
```

現時点ではビルドステップを持たない。`src/` の中身がそのまま配信物になるので、
HTML と CSS を編集してブラウザで開けば結果を確認できる。

## ローカルで見る

ファイルを直接開くだけで動く。パスはすべて相対にしてある。

```bash
open src/index.html
```

`file://` 特有の挙動を避けたい場合はローカルサーバを立てる。

```bash
python3 -m http.server -d src 8000   # http://localhost:8000
```

## ディレクトリ構成

```
.
├── src/                  # 配信物そのもの。S3 にはこの中身を同期する
│   ├── index.html
│   ├── favicon.png       # 180x180
│   └── assets/
│       ├── icon.png      # 円形表示用に切り出した 512x512
│       └── style.css
├── assets/               # 元素材。配信しない
│   └── icon.png          # 1024x1024 のオリジナル
├── scripts/              # （今後）deploy など
├── terraform/            # （今後）modules/ と envs/{staging,production}/
├── config/               # （今後）環境ごとの設定（実値はコミットしない）
└── README.md
```

`src/` を配信物そのものとしているのは、いまビルドステップがないため。
将来 Astro などを入れる場合は `src/` をソースに、`dist/` を配信物に切り替える。
その際も同期対象のディレクトリが変わるだけで、`terraform/` 側は影響を受けない。

### アイコンについて

オリジナルの `assets/icon.png` は周囲の余白が広く、そのまま円形に切り抜くと
被写体が小さく見える。被写体を中心に正方形へ切り出したものを `src/assets/icon.png`
に置き、CSS 側は `border-radius: 50%` をかけるだけにしてある。

切り出しは macOS の `sips` で再現できる。

```bash
sips -c 680 680 --cropOffset 164 192 assets/icon.png --out src/assets/icon.png
sips -z 512 512 src/assets/icon.png

sips -c 680 680 --cropOffset 164 192 assets/icon.png --out src/favicon.png
sips -z 180 180 src/favicon.png
```

## 書き換えるところ

雛形として置いた内容のうち、実際の情報に差し替えが必要な箇所。
HTML 側にも同じ趣旨のコメントを入れてある。

| 場所 | 内容 |
| --- | --- |
| Work / よく使うもの | 技術タグが一般的なデータ基盤の構成のままになっている |
| Music | 担当楽器・所属・出演情報。いまはギター中心という記述だけ |
| `<head>` の og:url / og:image | 公開ドメインが確定したら絶対 URL を確認する |

## 今後

日記サイト（[apkas-diary](https://github.com/ceshmina/apkas-diary)）と同じ構成に揃える想定。

- AWS は staging と production でアカウントを分け、named profile で切り替える
- リージョンは `ap-northeast-1`
- Terraform はホストゾーンを作らず `data` で参照する
- state のバケットとホストゾーンはコード管理の外に置く

| 環境 | profile | サイトの URL |
| --- | --- | --- |
| staging | `apkas-staging.admin` | https://dev.apkas.net （予定） |
| production | `apkas-production.admin` | https://apkas.net （予定） |

## リンク

| | |
| --- | --- |
| 日記 | https://diary.apkas.net |
| GitHub | https://github.com/ceshmina |
