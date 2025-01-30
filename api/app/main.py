from fastapi import FastAPI

from web.route import router

app = FastAPI()

app.include_router(router)
