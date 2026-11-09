from fastapi import FastAPI

from app.routers.nlp_router import router as nlp_router

app = FastAPI(title="BCIP AI NLP Service", version="1.0.0")
app.include_router(nlp_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
