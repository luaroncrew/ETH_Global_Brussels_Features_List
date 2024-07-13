import os

from web3 import Web3
from get_manager_contract import get_contract
from get_token_contract import get_token_contract

from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

load_dotenv()

INFURA_URL = os.environ.get('INFURA_URL')  # FOR MORPH ITS QUIQCKNODE RPC URL
web3 = Web3(Web3.HTTPProvider(INFURA_URL))
private_key = os.environ.get('PRIVATE_KEY')

web3.middleware_onion.inject(geth_poa_middleware, layer=0)
account = web3.eth.account.from_key(private_key)
token_contract = get_token_contract()
contract = get_contract()


def transform_scores(scores):
    """
    Transform a dictionary of scores into a list of dictionaries with winner addresses and scaled scores.

    Args:
        scores (dict): A dictionary where keys are Ethereum addresses and values are scores.

    Returns:
        list: A list of dictionaries with "winnerAddress" and "score" keys.
    """
    transformed_list = []

    for address, score in scores.items():
        transformed_list.append({
            "winnerAddress": address,
            "score": score * 5  # Scale the score by a factor of 5
        })

    return transformed_list


def send_pool_distribution_transaction(winners, company_id):

    distribute_pool_tx = contract.functions.distributePool(
        company_id,
        winners
    ).build_transaction({
        'chainId': 2810,  # MORPH holesky
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

