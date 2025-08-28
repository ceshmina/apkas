#!/bin/bash


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
  local created_at=$3

  awslocal dynamodb put-item \
    --table-name diary \
    --item '{
      "pid": { "S": "'"${id}"'" },
      "sid": { "S": "'"${id}"'" },
      "title": { "S": "'"${title}"'" },
      "created_at": { "S": "'"${created_at}"'" }
    }' \
    --region ap-northeast-1
}

put_diary diary#20250101 テスト日記1 2025-01-01T21:00:00+09:00
put_diary diary#20250102 テスト日記2 2025-01-02T21:00:00+09:00
put_diary diary#20250103 テスト日記3 2025-01-03T21:00:00+09:00
