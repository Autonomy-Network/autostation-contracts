from brownie import web3
from consts import *


def keccakReq(auto, req):
    return web3.keccak(auto.r.getReqBytes(req)).hex()


def get_eth_for_exec(evm_maths, tx, gas_price_fast):
    return evm_maths.mul3div1(tx.return_value, gas_price_fast, PAY_ETH_BPS, BASE_BPS)