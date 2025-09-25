from typing import Any

from aws_lambda_typing.context import Context
from aws_lambda_typing.events import S3Event


def handler(event: S3Event, context: Context) -> dict[str, Any]:
    return { 'message': 'Hello world!' }
