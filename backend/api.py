#!.venv/bin/python

"""API Service"""

from fastapi import FastAPI
from uvicorn import run


api = FastAPI()


@api.get("/api/since/{sober_date}")
async def since(sober_date: str):
    """Get sober date"""
    return {"since": sober_date}


if __name__ == "__main__":
    run(api, host="0.0.0.0", port=5556, reload=True)
