from consts import *
from utils import *
from brownie import reverts, chain


def test_forwardCalls_rev_userFeeForw(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    for addr in a:
        with reverts(REV_MSG_NOT_USER_FEE_FORW):
            fr.forwardCalls(user_a, 100, [(user_a, "", 0, False)], {'from': addr})


def test_forwardCalls_rev_calldata_not_user(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a, user_b):
    amount_dep, _ = fr_dep
    call_id = 1
    tc_fcn_data = (tc.address, tc.everyTimePeriod.encode_input(user_b, call_id, START_TIME, PERIOD_LENGTH), 0, True)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    fr.withdrawETH(user_a, amount_dep-100, {'from': user_a})

    # Should now be within the valid time range
    chain.sleep(START_TIME - chain.time() + 10)
    # Need to make a tx to have the changed chain timestamp be reflected on-chain
    deployer.transfer(deployer, 0)

    with reverts(REV_MSG_CALLDATA_NOT_USER):
        auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})


def test_forwardCalls_rev_funds_fee(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    tc_fcn_data = (tc.address, tc.betweenTimes.encode_input(START_TIME, START_TIME+PERIOD_LENGTH), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    fr.withdrawETH(user_a, amount_dep-100, {'from': user_a})

    # Should now be within the valid time range
    chain.sleep(START_TIME - chain.time() + 10)
    # Need to make a tx to have the changed chain timestamp be reflected on-chain
    deployer.transfer(deployer, 0)

    with reverts(REV_MSG_NOT_ENOUGH_FUNDS_FEE):
        auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})


def test_forwardCalls_rev_funds_fee_from_eth_sent_in_call(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    deployer.transfer(fr, E_18)
    amount_dep, _ = fr_dep
    mock_target_fcn_data = (mock_target.address, mock_target.setX.encode_input(5), amount_dep+1, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [mock_target_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    # Should now be within the valid time range
    chain.sleep(START_TIME - chain.time() + 10)
    # Need to make a tx to have the changed chain timestamp be reflected on-chain
    deployer.transfer(deployer, 0)

    with reverts(REV_MSG_NOT_ENOUGH_FUNDS_FEE):
        auto.r.executeHashedReq(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})


def test_forwardCalls_rev_reentering_withdrawETH(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    mock_target_fcn_data = (mock_target.address, mock_target.callWithdrawETH.encode_input(5), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [mock_target_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    with reverts(REV_MSG_REENTRANT):
        auto.r.executeHashedReq(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})