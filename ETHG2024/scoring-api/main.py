from fastapi import FastAPI

from models import Payload
from score_calculator import calculate_score
app = FastAPI()


@app.post("/distributePool")
async def parse_payload(payload: Payload):
    winners = calculate_score(payload)
    print(winners)

    return {"parsed_payload": payload}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
