#!/usr/bin/env bash
#
# src/ を S3 に同期し、CloudFront のキャッシュを無効化する。
#
#   scripts/deploy.sh
#
# ビルドステップを持たないため、同期するのは src/ そのもの。
# --delete により、前回のデプロイに存在して今回なくなったファイルは配信されなくなる。

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE="config/production.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE がありません。" >&2
  echo "       cp config/production.env.example $ENV_FILE して" >&2
  echo "       terraform output の値を転記してください。" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

for name in AWS_PROFILE SITE_BUCKET CLOUDFRONT_DISTRIBUTION_ID; do
  if [[ -z "${!name:-}" ]]; then
    echo "error: $name が $ENV_FILE に設定されていません。" >&2
    echo "       terraform output の値を転記してください。" >&2
    exit 1
  fi
done

if ! command -v aws >/dev/null 2>&1; then
  echo "error: aws CLI が見つかりません" >&2
  exit 1
fi

# 適用先を取り違えると公開内容が入れ替わるため、実行前に対象を表示する。
ACCOUNT_ID="$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)"

cat <<EOF
  profile      : $AWS_PROFILE
  account      : $ACCOUNT_ID
  bucket       : $SITE_BUCKET
  distribution : $CLOUDFRONT_DISTRIBUTION_ID

EOF

read -r -p "本番サイトに反映します。よろしいですか [y/N]: " answer
if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
  echo "中止しました。"
  exit 1
fi

# 配信物のファイル名はハッシュを持たないため、長い max-age を付けると
# 更新後もブラウザが古い CSS や画像を掴み続ける。CDN 側はこの下で無効化
# できるが、ブラウザのキャッシュには手が届かないので短くしておく。
echo "S3 に同期しています..."
aws s3 sync src/ "s3://${SITE_BUCKET}/" \
  --delete \
  --cache-control "public, max-age=300" \
  --profile "$AWS_PROFILE"

echo "CloudFront のキャッシュを無効化しています..."
INVALIDATION_ID="$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths '/*' \
  --profile "$AWS_PROFILE" \
  --query 'Invalidation.Id' \
  --output text)"

echo "invalidation: $INVALIDATION_ID"
echo
echo "完了しました。${SITE_URL:-（SITE_URL 未設定）}"
