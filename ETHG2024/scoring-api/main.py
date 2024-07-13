from fastapi import FastAPI

from models import Payload
from score_calculator import calculate_score
from blockchain_connector import (
    transform_scores,
    send_pool_distribution_transaction
)

app = FastAPI()


@app.post("/distributePool")
async def parse_payload(payload: Payload):
    winners = calculate_score(payload)
    winners = transform_scores(winners)
    send_pool_distribution_transaction(winners, payload.companyId)

    return {"parsed_payload": payload}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
