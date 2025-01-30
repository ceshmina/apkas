from pydantic import BaseModel


class IndexResponse(BaseModel):
    message: str


class IndexController:
    def get_index(self) -> IndexResponse:
        return IndexResponse(message='Hello, world!')
