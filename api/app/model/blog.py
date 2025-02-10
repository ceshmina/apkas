from datetime import datetime

from pydantic import BaseModel


class Tag(BaseModel):
    tag_id: int
    name: str
    created_at: datetime
    updated_at: datetime | None = None


class Blog(BaseModel):
    blog_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime | None = None
    tags: list[Tag] = []
