from consts import *
from utils import *
from brownie import reverts


def test_forwardCalls_uniV2_price_condition(a, auto, evm_maths, fr, fr_dep, uniV2_router, uni_amounts, deployer, user_a):
    amount_dep, _ = fr_dep
    uni_amounts_fcn_data = (uni_amounts.address, uni_amounts.amountOutGreaterThan.encode_input(WETH_ADDR, USDC_ADDR, E_18, 100), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [uni_amounts_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]
    expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    eth_for_exec = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec
    assert fr.balance() == amount_dep - eth_for_exec
    assert auto.r.getHashedReqs() == [NULL_HASH]
    assert tx.events["HashedReqExecuted"][0].values() == [id, True]


def test_forwardCalls_uniV2_price_condition_rev_output(a, auto, evm_maths, fr, fr_dep, uniV2_router, uni_amounts, deployer, user_a):
    amount_dep, _ = fr_dep
    uni_amounts_fcn_data = (uni_amounts.address, uni_amounts.amountOutGreaterThan.encode_input(WETH_ADDR, USDC_ADDR, E_18, E_18), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [uni_amounts_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    with reverts(REV_MSG_OUTPUT_TOO_LOW):
        auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})