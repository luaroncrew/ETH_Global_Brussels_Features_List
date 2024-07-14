from web3 import Web3

# eth mainnet infura api address
w3 = Web3(
    Web3.HTTPProvider(
        "https://mainnet.infura.io/v3/8bb0bccdaf914db69b3599a3e513e7cb"
    ))


def resolve_ens_address(name):
    """
    returns the address if exists, None if not
    """
    return w3.ens.address(name)



