import os

from web3 import Web3

from dotenv import load_dotenv

load_dotenv()

w3 = Web3()

CONTRACT_ADDRESS = os.environ.get('SPENDER_ADDRESS')
CONTRACT_ABI = '''
[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "listId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "distributionDate",
				"type": "uint256"
			}
		],
		"name": "PoolCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "listId",
				"type": "uint256"
			}
		],
		"name": "PoolDistributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "subscriber",
				"type": "address"
			}
		],
		"name": "Subscription",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "listId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "distributionDate",
				"type": "uint256"
			}
		],
		"name": "createPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "listId",
				"type": "uint256"
			},
			{
				"components": [
					{
						"internalType": "address",
						"name": "winnerAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "score",
						"type": "uint256"
					}
				],
				"internalType": "struct RewardsPoolManager.Winner[]",
				"name": "winners",
				"type": "tuple[]"
			}
		],
		"name": "distributePool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "subscribe",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usdcTokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_subscriptionFee",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "isSubscriber",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pools",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "distributionDate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalScore",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "subscribers",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "subscriptionFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
'''

def get_contract():
    return w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
