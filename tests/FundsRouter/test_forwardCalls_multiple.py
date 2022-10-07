from consts import *
from utils import *
from brownie import reverts, chain
import time


# Single use automation

def test_forwardCalls_time_condition_target_betweenTimes(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    new_x = 5
    tc_fcn_data = (tc.address, tc.betweenTimes.encode_input(START_TIME, START_TIME+PERIOD_LENGTH), 0, False)
    mock_target_fcn_data = (mock_target.address, mock_target.setX.encode_input(new_x), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data, mock_target_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    assert mock_target.x() == 0
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
    expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    assert mock_target.x() == new_x
    eth_for_exec = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec
    assert fr.balance() == amount_dep - eth_for_exec
    assert auto.r.getHashedReqs() == [NULL_HASH]
    assert tx.events["HashedReqExecuted"][0].values() == [id, True]


# with verifyUser

# Recurring automation

def test_forwardCalls_time_condition_everyTimePeriod(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    call_id = 1
    tc_fcn_data = (tc.address, tc.everyTimePeriod.encode_input(user_a, call_id, START_TIME, PERIOD_LENGTH), 0, True)
    new_y = 5
    eth_to_send = 100
    mock_target_fcn_data = (mock_target.address, mock_target.setYVerify.encode_input(user_a, new_y), eth_to_send, True)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data, mock_target_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, True, {'from': user_a})

    assert tc.userToIdToLastExecTime(user_a, call_id) == 0
    assert mock_target.y() == 0
    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, True)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    # Being just before the `afterTime` should revert
    chain.sleep(START_TIME - chain.time() - 10)
    deployer.transfer(deployer, 0)
    with reverts(REV_MSG_NOT_PASSED_START):
        expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    # Should now be within the valid time range
    chain.sleep(START_TIME - chain.time() + 10)
    # Need to make a tx to have the changed chain timestamp be reflected on-chain
    deployer.transfer(deployer, 0)
    expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    assert tc.userToIdToLastExecTime(user_a, call_id) == START_TIME
    assert mock_target.y() == new_y
    eth_for_exec_1 = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec_1 - eth_to_send
    assert fr.balance() == amount_dep - eth_for_exec_1 - eth_to_send
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqExecuted"][0].values() == [id, False]

    new_y_2 = 2
    mock_target.setY(new_y_2)
    assert mock_target.y() == new_y_2

    # Being just before the next period should revert
    with reverts(REV_MSG_TOO_EARLY_PERIOD):
        expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    
    # Should now be within the valid time range
    chain.sleep(START_TIME + PERIOD_LENGTH - chain.time() + 10)
    deployer.transfer(deployer, 0)
    expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    assert tc.userToIdToLastExecTime(user_a, call_id) == START_TIME + PERIOD_LENGTH
    assert mock_target.y() == new_y
    eth_for_exec_2 = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec_1 - eth_to_send - eth_for_exec_2 - eth_to_send
    assert fr.balance() == amount_dep - eth_for_exec_1 - eth_to_send - eth_for_exec_2 - eth_to_send
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqExecuted"][0].values() == [id, False]


def test_forwardCalls_time_condition_everyTimePeriod_incrementX_tutorial_demo(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    PERIOD_LENGTH = 300
    call_id = 1
    tc_fcn_data = (tc.address, tc.everyTimePeriod.encode_input(user_a, call_id, time.time(), PERIOD_LENGTH), 0, True)
    mock_target_fcn_data = (mock_target.address, mock_target.incrementX.encode_input(), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data, mock_target_fcn_data])
    
    tx = auto.r.newReq(fr.address, ADDR_0, fr_callData, 0, True, True, True, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, True)
    tx = auto.r.executeHashedReq(id, req, 21000, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})