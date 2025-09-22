#!/bin/bash


awslocal s3api create-bucket --bucket apkas-development-photos-original
awslocal s3api create-bucket --bucket apkas-development-photos


awslocal dynamodb create-table \
  --table-name diary \
  --attribute-definitions \
    AttributeName=pid,AttributeType=S \
    AttributeName=sid,AttributeType=S \
  --key-schema \
    AttributeName=pid,KeyType=HASH \
    AttributeName=sid,KeyType=RANGE \
  --region ap-northeast-1 \
  --billing-mode PAY_PER_REQUEST


put_diary() {
  local id=$1
  local title=$2
  local content=$3
  local created_at=$4
  local updated_at=$5

  local item_json
  item_json=$(jq -n \
    --arg pid "$id" \
    --arg sid "$id" \
    --arg title "$title" \
    --arg content "$content" \
    --arg created_at "$created_at" \
    --arg updated_at "$updated_at" \
    '{
      "pid": { "S": $pid },
      "sid": { "S": $sid },
      "item_type": { "S": "entry" },
      "title": { "S": $title },
      "content": { "S": $content },
      "created_at": { "S": $created_at },
      "updated_at": { "S": $updated_at }
    }')
  awslocal dynamodb put-item \
    --table-name diary \
    --item "${item_json}" \
    --region ap-northeast-1
}

put_diary diary#20250101 テスト日記1 これはテスト日記その1です。 2025-01-01T21:00:00+09:00 2025-01-01T21:00:00+09:00
put_diary diary#20250102 テスト日記2 これはテスト日記その2です。 2025-01-02T21:00:00+09:00 2025-01-05T21:00:00+09:00

diary3_content=$(cat <<EOF
これはテスト日記その3です。Markdown形式で記述されています。

## 見出し

- 箇条書きのアイテム1
- 箇条書きのアイテム2
- 箇条書きのアイテム3
EOF
)

put_diary diary#20250103 テスト日記3 "${diary3_content}" 2025-01-03T21:00:00+09:00 2025-01-03T21:00:00+09:00

put_diary diary#20991230 無効な日記 これは無効な日記です。 invalid invalid
