#!/usr/bin/env bash
#
# Web フォントを Google Fonts から取り込み、src/assets/fonts/ に置く。
#
#   scripts/fetch-fonts.sh
#
# 書体を足す・替えるときにだけ実行し、取り込んだものはコミットする。
# 閲覧のたびに Google へ問い合わせないよう、書体はこのサイト自身から配る
# （日記サイトと同じ方針）。
#
# 和文の書体は、Google Fonts が文字の範囲ごとに約120のファイルへ分けている。
# ブラウザはページに現れる文字を含むファイルだけを読むので、分けたまま置く。

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

OUT_DIR="src/assets/fonts"

# Google Fonts は User-Agent を見て返す形式を変える。woff2 と文字の範囲ごとの
# 分割を受け取るため、いまのブラウザを名乗る。
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'

# ファイル名の頭と、Google Fonts の css2 に渡す指定。
# 太さを1つ足すごとに、閲覧者の読む量が増える（同じ字でも太さごとに別の
# ファイルを読む）。日記と同じく、使う太さだけに絞ってある。
FACES=(
  "instrument-serif         Instrument+Serif:ital@0"
  "instrument-serif-italic  Instrument+Serif:ital@1"
  "instrument-sans-500      Instrument+Sans:wght@500"
  "zen-old-mincho-600       Zen+Old+Mincho:wght@600"
  "zen-kaku-gothic-new-400  Zen+Kaku+Gothic+New:wght@400"
  "zen-kaku-gothic-new-500  Zen+Kaku+Gothic+New:wght@500"
)

# 取り込まない文字の範囲。ページに現れても、代わりの書体で出るだけで欠けはしない。
SKIP_SUBSETS='^(cyrillic|cyrillic-ext|greek|greek-ext|vietnamese|latin-ext)$'

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

CSS="$WORK_DIR/fonts.css"
LIST="$WORK_DIR/list.txt"

cat > "$CSS" <<'EOF'
/* scripts/fetch-fonts.sh が Google Fonts から生成したもの。手で編集しない。 */
EOF

for face in "${FACES[@]}"; do
  read -r prefix query <<<"$face"
  echo "CSS を取得しています: $query"

  # 欧文は「/* latin */」のような注記で範囲が分かる。和文は注記を持たず、
  # ファイル名の末尾（.0.woff2 〜 .119.woff2）で範囲が分かれている。
  # どちらの場合も、同じ範囲には何度取り込んでも同じファイル名を付ける。
  curl -fsS -A "$UA" "https://fonts.googleapis.com/css2?family=${query}&display=swap" |
    awk -v prefix="$prefix" -v skip="$SKIP_SUBSETS" -v css="$CSS" -v list="$LIST" '
      /^\/\* .* \*\/$/ { subset = $2; next }
      /@font-face/ { block = $0 "\n"; inblock = 1; next }
      inblock {
        if (match($0, /url\([^)]*\)/)) {
          url = substr($0, RSTART + 4, RLENGTH - 5)
          name = subset
          if (name == "") {
            name = url
            sub(/\.woff2$/, "", name)
            sub(/.*\./, "", name)
          }
          file = prefix "-" name ".woff2"
          sub(/url\([^)]*\)/, "url(" file ")")
        }
        block = block $0 "\n"
        if ($0 ~ /^}/) {
          if (subset !~ skip) {
            printf "%s", block >> css
            print url, file >> list
          }
          inblock = 0
          subset = ""
        }
      }
    '
done

echo "書体のファイルを取得しています（$(wc -l < "$LIST") 個）..."
xargs -P 8 -n 2 sh -c 'curl -fsS -o "$0/$2" "$1"' "$WORK_DIR" < "$LIST"

# 前回の取り込みで使い、今回なくなったファイルを残さないよう、まるごと入れ替える。
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp "$CSS" "$OUT_DIR/"
while read -r _ file; do
  cp "$WORK_DIR/$file" "$OUT_DIR/"
done < "$LIST"

echo "完了しました: $OUT_DIR（$(du -sh "$OUT_DIR" | cut -f1)）"
