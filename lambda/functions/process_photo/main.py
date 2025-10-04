import os
from typing import Any
import uuid

from aws_lambda_typing.context import Context
from aws_lambda_typing.events import S3Event
import boto3

from app.core.process_photo import process


s3_client = boto3.client('s3')
dynamodb_client = boto3.client('dynamodb')

TARGET_BUCKET = os.environ.get('TARGET_BUCKET')


def handler(event: S3Event, context: Context) -> dict[str, Any]:
    record = event['Records'][0]
    source_bucket = record['s3']['bucket']['name']
    source_key = record['s3']['object']['key']

    try:
        [photo_id_str, photo_filename] = source_key.split('/')
        photo_id = uuid.UUID(photo_id_str)
        photo_ext = photo_filename.split('.')[1]
        if photo_ext not in {'jpg', 'jpeg', 'JPG', 'JPEG'}:
            return {'message': f'ファイル {source_key}を検出しましたが、対象外の拡張子のため、処理を終了します'}
    except Exception:
        return {'message': r'ファイルパスが不正です。{photo_id: UUID}/{photo_name}.(jpg|jpeg|JPG|JPEG)としてください'}

    input_dir = f'/tmp/input/{photo_id}'
    input_path = f'{input_dir}/{photo_filename}'
    os.makedirs(input_dir, exist_ok=True)
    s3_client.download_file(Bucket=source_bucket, Key=source_key, Filename=input_path)

    target_dir = f'/tmp/output/{photo_id}'
    metadata = process(input_path, target_dir)

    dynamodb_item = {
        'pid': {'S': 'ready'},
        'sid': {'S': f'photo#{str(photo_id)}'},
        'item_type': {'S': 'photo'},
        'created_at': {'S': metadata.created_at.isoformat()},
        'paths': {
            'M': {
                'original': {'S': f's3://{source_bucket}/{source_key}'},
            }
        },
        'metadata': {'M': {}},
    }
    if metadata.make:
        dynamodb_item['metadata']['M']['make'] = {'S': metadata.make}
    if metadata.model:
        dynamodb_item['metadata']['M']['model'] = {'S': metadata.model}
    if metadata.lens_model:
        dynamodb_item['metadata']['M']['lens_model'] = {'S': metadata.lens_model}
    if metadata.focal_length:
        dynamodb_item['metadata']['M']['focal_length'] = {'N': str(metadata.focal_length)}
    if metadata.focal_length_in_35mm_film:
        dynamodb_item['metadata']['M']['focal_length_in_35mm_film'] = {'N': str(metadata.focal_length_in_35mm_film)}
    if metadata.f_number:
        dynamodb_item['metadata']['M']['f_number'] = {'N': str(metadata.f_number)}
    if metadata.exposure_time:
        dynamodb_item['metadata']['M']['exposure_time'] = {'N': str(metadata.exposure_time)}
    if metadata.iso_speed_ratings:
        dynamodb_item['metadata']['M']['iso_speed_ratings'] = {'N': str(metadata.iso_speed_ratings)}

    output_files = os.listdir(target_dir)
    for filename in output_files:
        upload_key = f'{str(photo_id)}/{filename}'
        s3_client.upload_file(Filename=os.path.join(target_dir, filename), Bucket=TARGET_BUCKET, Key=upload_key)
        dynamodb_key = filename.split('.')[0]
        dynamodb_item['paths']['M'][dynamodb_key] = {'S': f's3://{TARGET_BUCKET}/{upload_key}'}

    dynamodb_client.put_item(TableName='diary', Item=dynamodb_item)

    return {'message': f'ファイル {source_key}を処理しました'}
