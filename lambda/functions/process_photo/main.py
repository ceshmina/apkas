import os
from typing import Any
import uuid

from aws_lambda_typing.context import Context
from aws_lambda_typing.events import S3Event
import boto3

from app.core.process_photo import process


s3_client = boto3.client('s3')


def handler(event: S3Event, context: Context) -> dict[str, Any]:
    record = event['Records'][0]
    source_bucket = record['s3']['bucket']['name']
    source_key = record['s3']['object']['key']

    try:
        [photo_id_str, photo_filename] = source_key.split('/')
        photo_id = uuid.UUID(photo_id_str)
        photo_ext = photo_filename.split('.')[1]
        if photo_ext not in { 'jpg', 'jpeg', 'JPG', 'JPEG' }:
            return { 'message': f'ファイル {source_key}を検出しましたが、対象外の拡張子のため、処理を終了します' }
    except Exception:
        return { 'message': r'ファイルパスが不正です。{photo_id: UUID}/{photo_name}.(jpg|jpeg|JPG|JPEG)としてください'}

    input_dir = f'/tmp/input/{photo_id}'
    input_path = f'{input_dir}/{photo_filename}'
    os.makedirs(input_dir, exist_ok=True)
    s3_client.download_file(Bucket=source_bucket, Key=source_key, Filename=input_path)

    target_dir = f'/tmp/output/{photo_id}'
    _ = process(input_path, target_dir)

    output_files = os.listdir(target_dir)
    for filename in output_files:
        upload_key = f'{str(photo_id)}/{filename}'
        s3_client.upload_file(Filename=os.path.join(target_dir, filename), Bucket='apkas-development-photos', Key=upload_key)

    return { 'message': f'ファイル {source_key}を処理しました' }
