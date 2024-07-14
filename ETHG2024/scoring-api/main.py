import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials


from web3 import Web3

from models import Payload
from score_calculator import calculate_score
from blockchain_connector import (
    transform_scores,
    send_pool_distribution_transaction
)
from ens_address_resolver import resolve_ens_address

users = {
    "admin": {
        "password": os.environ.get('USER_PASSWORD'),
        "token": "",
        "priviliged": True
    }
}

security = HTTPBasic()
app = FastAPI(dependencies=[Depends(security)])
web3 = Web3()


def verification(creds: HTTPBasicCredentials = Depends(security)):
    username = creds.username
    password = creds.password
    if username in users and password == users[username]["password"]:
        print("User Validated")
        return True
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )


@app.post("/distributePool")
async def parse_payload(payload: Payload, Verifcation = Depends(verification)):
    winners = calculate_score(payload)
    winners = transform_scores(winners)
    send_pool_distribution_transaction(winners, payload.companyId)
    return {"distributed": True}


@app.post("/resolveDomainName")
async def resolve_domain_name(name: str):
    ens_address = resolve_ens_address(name)
    return {"address": ens_address}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
