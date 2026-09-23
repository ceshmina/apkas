# apkas

個人のポートフォリオサイト。ビルド不要の静的サイトを S3 + CloudFront で配信する。

```
src/ ──▶ S3 ──▶ CloudFront ──▶ https://apkas.net
```

現時点ではビルドステップを持たない。`src/` の中身がそのまま配信物になるので、
HTML と CSS を編集してブラウザで開けば結果を確認できる。

## ローカルで見る

ファイルを直接開くだけで動く。パスはすべて相対にしてある（Web フォントも
`src/assets/fonts/` から相対パスで読むので、`file://` でも同じ書体で出る）。
ただし言語の切り替え（`en/` と `../`）はディレクトリを指すので、`file://` では
ファイルの一覧が開く。切り替えまで確かめるときはローカルサーバを立てる。

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
│   ├── index.html        # 日本語のページ（/）
│   ├── en/index.html     # 英語のページ（/en/）
│   ├── 404.html          # CloudFront が 403/404 をここに寄せる。日英を併記
│   ├── favicon.png       # 180x180
│   └── assets/
│       ├── icon.png      # 被写体を中心に切り出した 512x512
│       ├── style.css
│       └── fonts/        # Web フォント。fetch-fonts.sh が生成する
├── assets/               # 元素材。配信しない
│   └── icon.png          # 1024x1024 のオリジナル
├── scripts/
│   ├── bootstrap-state.sh  # state バケットの作成（最初に1度だけ）
│   ├── deploy.sh           # src/ を S3 に同期して CDN を無効化
│   └── fetch-fonts.sh      # Web フォントを Google Fonts から取り込む
├── terraform/
│   ├── modules/delivery/   # S3 + CloudFront + ACM + Route53
│   └── envs/production/
├── config/               # 環境ごとの設定（実値はコミットしない）
└── README.md
```

`src/` を配信物そのものとしているのは、いまビルドステップがないため。
将来 Astro などを入れる場合は `src/` をソースに、`dist/` を配信物に切り替える。
その際も同期対象のディレクトリが変わるだけで、`terraform/` 側は影響を受けない。

## 体裁

体裁は日記サイト（[apkas-diary](https://github.com/ceshmina/apkas-diary)）に揃えてある。
色・書体・本文の大きさ・字送りの出どころは、日記の `src/styles/tokens.css` と
`base.css` にあり、`src/assets/style.css` の値はその写し。
日記の側はこちらに追随しない（日記の visual-identity の spec）ので、揃え直すときは
日記の値をこちらへ写す。

- 配色は白い地の1通りで、ダークモードは持たない。色味は朱 `#C73E1D` の1色だけで、
  題字と肩書きの丸、触れたときの手応え、フォーカスの線にだけ使う
- 書体は日記と同じ4つ（Instrument Serif / Instrument Sans / Zen Old Mincho /
  Zen角ゴシック New）で、太さも同じものに絞ってある
- 日記に無い部品は、日記の部品の字面から組んである。プロフィールの頭は日別ページの
  日付の部品、経歴とリンクの行は一覧の行、節の題は「Archive 年別」に倣う

### Web フォント

閲覧のたびに Google へ問い合わせないよう、書体はこのサイト自身から配る（日記と同じ方針）。
Google Fonts から取り込んだファイルを `src/assets/fonts/` に置き、コミットしてある。
書体や太さを変えるときは、`scripts/fetch-fonts.sh` の一覧を直して実行する。

```bash
scripts/fetch-fonts.sh
```

和文の書体は、文字の範囲ごとに約120のファイルに分かれている。ブラウザはページに
現れる文字を含むファイルだけを読むので、全体（約 6MB）を読むことはない。
ファイル名は範囲ごとに決まった名前にしてあり、取り込み直しても変わらない
（`index.html` の先読みが `instrument-serif-latin.woff2` を名指ししているため）。

### アイコンについて

オリジナルの `assets/icon.png` は周囲の余白が広く、そのまま置くと被写体が小さく
見える。被写体を中心に正方形へ切り出したものを `src/assets/icon.png` に置いてある。

白地に黒のシルエットなので、ページには枠を付けずにそのまま置く。画像の地は
`#FDFDFD` で白の上にうっすら四角が見えるため、CSS で `filter: contrast(1.1)` を
かけて白に寄せている。

切り出しは macOS の `sips` で再現できる。

```bash
sips -c 680 680 --cropOffset 164 192 assets/icon.png --out src/assets/icon.png
sips -z 512 512 src/assets/icon.png

sips -c 680 680 --cropOffset 164 192 assets/icon.png --out src/favicon.png
sips -z 180 180 src/favicon.png
```

## 日本語と英語

日本語のページ（`src/index.html`）と英語のページ（`src/en/index.html`）を
別々のファイルとして置き、ヘッダー右端の「JA / EN」で行き来する。
切り替えは普通のリンクで、JS もブラウザの言語による振り分けも使わない。
`/en` で開けるのは CloudFront の関数（`rewrite-index.js`）が `/en/index.html` を
補うため。

2つのページは同じ部品（クラス）で組んであり、中身を変えたら両方を直す。
違いは次のところだけ。

| | 日本語のページ | 英語のページ |
| --- | --- | --- |
| 節の題 | 飾りの英字 + 和文の見出し | 英字がそのまま見出し |
| 経歴の期間 | 英語の略記を見せ、読み上げには和文を渡す | 略記をそのまま読ませる |
| 小見出し | 和文を字間で開く | 欧文の大文字（CSS の `text-transform`） |
| 字送り・行送り | 和文向け | `:lang(en)` で欧文向けに詰める |

`head` の `hreflang` の3行は両方のページに同じものを置く。検索エンジンに
言語ごとの版があることを伝えるためのもので、片方だけだと無視される。

## 書き換えるところ

雛形として置いた内容のうち、実際の情報に差し替えが必要な箇所。
HTML 側にも同じ趣旨のコメントを入れてある。英語のページも同じ箇所が
「Coming soon」のままになっている。

| 場所 | 内容 |
| --- | --- |
| Work / Music | 本文が「準備中」のまま |
| Work / よく使うもの | 技術タグが「準備中」のまま |

### 経歴の書き方

職歴・学歴は、継続中のものと最終学歴だけを出し、それより前は「Earlier」の
ピルで開く。開閉は `<details>` / `<summary>` に任せていて JS は使わない。
`<li class="timeline__item">` をコピーして増やし、ピルの件数（`Earlier · N` と
読み上げ用の「以前の職歴（N件）」）も合わせて直す。

```html
<li class="timeline__item">
  <p class="timeline__period">
    <span class="visually-hidden">2020年4月から現在</span>  <!-- 読み上げ用 -->
    <span aria-hidden="true">Apr 2020 – Present</span>      <!-- 見た目 -->
  </p>
  <p class="timeline__title">◯◯株式会社</p>                 <!-- 社名・学校名 -->
  <p class="timeline__note">データ基盤の設計・構築</p>      <!-- 補足。省略可 -->
</li>
```

期間は日記の日付と同じく英語の略記（Apr、Present）で見せ、読み上げには和文を渡す。
日本語の読み上げ音声は `Apr` のような略記をうまく読めないため。

英語のページでは期間を略記のまま1つだけ書く（`<p class="timeline__period">Apr 2020 – Present</p>`）。
読み上げ用のピルの文言は「Earlier experience (N)」「Earlier education (N)」。

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
