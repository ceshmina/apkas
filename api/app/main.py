from fastapi import FastAPI
from pydantic import BaseModel

from web.route import router

app = FastAPI()


class IndexResponse(BaseModel):
    message: str


@app.get('/', response_model=IndexResponse)
def get_index() -> IndexResponse:
    return IndexResponse(message='Hello, world!')


app.include_router(router)
