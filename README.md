# apkas

個人のポートフォリオサイト。ビルド不要の静的サイトを S3 + CloudFront で配信する。

```
src/ ──▶ S3 ──▶ CloudFront ──▶ https://apkas.net
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
│   ├── 404.html          # CloudFront が 403/404 をここに寄せる
│   ├── favicon.png       # 180x180
│   └── assets/
│       ├── icon.png      # 円形表示用に切り出した 512x512
│       └── style.css
├── assets/               # 元素材。配信しない
│   └── icon.png          # 1024x1024 のオリジナル
├── scripts/
│   ├── bootstrap-state.sh  # state バケットの作成（最初に1度だけ）
│   └── deploy.sh           # src/ を S3 に同期して CDN を無効化
├── terraform/
│   ├── modules/delivery/   # S3 + CloudFront + ACM + Route53
│   └── envs/production/
├── config/               # 環境ごとの設定（実値はコミットしない）
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
| About / Work / Music | 本文が「準備中」のまま |
| Work / よく使うもの | 技術タグが「準備中」のまま |

### 経歴の書き方

職歴・学歴は `<details>` / `<summary>` で開閉する。JS は使っていないので、
中身の `<li class="timeline__item">` をコピーして増やすだけでよい。

```html
<li class="timeline__item">
  <p class="timeline__period">2020.04 – 現在</p>   <!-- 期間。Dusk Mauve で出る -->
  <p class="timeline__title">◯◯株式会社</p>        <!-- 社名・学校名 -->
  <p class="timeline__note">データ基盤の設計・構築</p> <!-- 補足。省略可 -->
</li>
```

縦線は `.timeline` 側に持たせているので、項目を増やしても途切れない。

### 404 ページ

`src/404.html` だけはリンクのパスを絶対（`/assets/style.css`）にしてある。
CloudFront は 404 の中身を元の URL のまま返すため、`/foo/bar` で開かれたときに
相対パスだと参照先が `/foo/assets/...` にずれる。

## 配信

日記サイト（[apkas-diary](https://github.com/ceshmina/apkas-diary)）と同じ構成に揃えてある。
ただしこちらは production だけで、staging は持たない。

| 環境 | profile | サイトの URL |
| --- | --- | --- |
| production | `apkas-production.admin` | https://apkas.net |

- リージョンは `ap-northeast-1`（証明書だけは CloudFront の制約で `us-east-1`）
- ホストゾーン `apkas.net` は作らず `data` で参照する。メールの MX や
  日記サイトのレコードが同居しており、このシステム専用の資産ではないため
- state のバケットとホストゾーンはコード管理の外に置く
- 日記サイトと同じ AWS アカウントを使うが、state のバケットは分けてある

構成は以下の通り。バケットは直接公開せず、OAC を通した CloudFront からのみ読める。

```
Route53 (A/AAAA alias)
      │
CloudFront ── viewer-request function（拡張子のないパスに /index.html を補う）
      │
    OAC ──▶ S3（パブリックアクセスは全面ブロック）
```

### 初期設定（1度だけ）

```bash
aws sso login --profile apkas-production.admin

# state バケットを作る。Terraform では作れない（自己参照になる）ため手で実行する
scripts/bootstrap-state.sh apkas-production.admin

cd terraform/envs/production
cp backend.hcl.example backend.hcl              # bootstrap の出力を転記
cp terraform.tfvars.example terraform.tfvars    # アカウント ID を埋める
terraform init -backend-config=backend.hcl
terraform apply
```

`apply` は ACM の DNS 検証と CloudFront の伝播を待つため、初回は 10 分ほどかかる。

終わったら `terraform output` の値を設定ファイルに転記する。

```bash
cp config/production.env.example config/production.env
```

### デプロイ

```bash
scripts/deploy.sh
```

`src/` を `aws s3 sync --delete` で同期し、CloudFront のキャッシュを無効化する。
ファイル名にハッシュを持たないので `Cache-Control: max-age=300` を付けて配信する。
CDN 側はデプロイのたびに無効化するが、ブラウザのキャッシュには手が届かないため。

## リンク

| | |
| --- | --- |
| 日記 | https://diary.apkas.net |
| GitHub | https://github.com/ceshmina |
