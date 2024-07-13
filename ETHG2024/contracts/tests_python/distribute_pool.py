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
SPENDER_ADDRESS = os.environ.get('SPENDER_ADDRESS')

# Define winners
winners = [
  {
    "winnerAddress": "0x285314CdFee7C30c867b70aaf9a24e9aECA489A3",
    "score": 50
  },
  {
    "winnerAddress": "0xB2aF81119A4bFa7E867fd325f59CDc01Ac32bC9A",
    "score": 100
  }
]

# Call distributePool function
list_id = 1

distribute_pool_tx = contract.functions.distributePool(
    list_id,
    winners
).build_transaction({
    'chainId': 11155111,  # Sepolia testnet chain ID
    'gas': 300000,  # Adjust the gas limit as needed
    'gasPrice': web3.to_wei('50', 'gwei'),
    'nonce': web3.eth.get_transaction_count(account.address),
})

# Sign the transaction
signed_distribute_pool_tx = web3.eth.account.sign_transaction(distribute_pool_tx, private_key)

# Send the transaction
tx_hash = web3.eth.send_raw_transaction(signed_distribute_pool_tx.rawTransaction)

# Wait for the transaction receipt
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
print(f'Distribute pool transaction receipt: {tx_receipt}')