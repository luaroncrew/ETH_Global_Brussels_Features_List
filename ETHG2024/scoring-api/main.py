
from fastapi import FastAPI


from web3 import Web3

from models import Payload, ENS_payload
from score_calculator import calculate_score
from blockchain_connector import (
    transform_scores,
    send_pool_distribution_transaction
)
from ens_address_resolver import resolve_ens_address

app = FastAPI()
web3 = Web3()


@app.post("/distributePool")
async def parse_payload(payload: Payload):
    winners = calculate_score(payload)
    winners = transform_scores(winners)
    send_pool_distribution_transaction(winners, payload.companyId)
    return {"distributed": True}


@app.post("/resolveDomainName")
async def resolve_domain_name(payload: ENS_payload):
    ens_address = resolve_ens_address(payload.text)
    return {"address": ens_address}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
