
import os

from web3 import Web3
from get_manager_contract import get_contract
from get_token_contract import get_token_contract

from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

load_dotenv()

# setup contracts
token_contract = get_token_contract()
contract = get_contract()

# setup web3 provider, signer account
INFURA_URL = 'https://sepolia.infura.io/v3/8bb0bccdaf914db69b3599a3e513e7cb'  # Replace with your Infura project ID
web3 = Web3(Web3.HTTPProvider(INFURA_URL))
private_key = os.environ.get('PRIVATE_KEY')

web3.middleware_onion.inject(geth_poa_middleware, layer=0)
account = web3.eth.account.from_key(private_key)

AMOUNT_TO_APPROVE = 1000000000000000000000000
SPENDER_ADDRESS = str(os.environ.get('SPENDER_ADDRESS'))

approve_tx = token_contract.functions.approve(
        SPENDER_ADDRESS,
        AMOUNT_TO_APPROVE
    ).build_transaction({
        'chainId': 11155111,  # Sepolia testnet chain ID
        'gas': 100000,  # Adjust the gas limit as needed
        'gasPrice': web3.to_wei('50', 'gwei'),
        'nonce': web3.eth.get_transaction_count(account.address),
    })

# Sign the transaction
signed_approve_tx = web3.eth.account.sign_transaction(approve_tx, private_key)

# Send the transaction
tx_hash = web3.eth.send_raw_transaction(signed_approve_tx.rawTransaction)

# Wait for the transaction receipt
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

print(f'Approve transaction receipt: {tx_receipt}')
