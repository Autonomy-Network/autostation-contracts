from consts import *
from utils import *
from brownie import reverts, chain


# Single use automation

def test_forwardCalls_time_condition_betweenTimes(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
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

    # Should now be within the valid time range
    chain.sleep(START_TIME - chain.time() + 10)
    # Need to make a tx to have the changed chain timestamp be reflected on-chain
    deployer.transfer(deployer, 0)
    expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    eth_for_exec = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec
    assert fr.balance() == amount_dep - eth_for_exec
    assert auto.r.getHashedReqs() == [NULL_HASH]
    assert tx.events["HashedReqExecuted"][0].values() == [id, True]


def test_forwardCalls_time_condition_betweenTimes_rev_before(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    tc_fcn_data = (tc.address, tc.betweenTimes.encode_input(START_TIME, START_TIME+PERIOD_LENGTH), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    # Being just before the `afterTime` should revert
    chain.sleep(START_TIME - chain.time() - 10)
    deployer.transfer(deployer, 0)
    with reverts(REV_MSG_TOO_EARLY):
        expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})


def test_forwardCalls_time_condition_betweenTimes_rev_after(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    tc_fcn_data = (tc.address, tc.betweenTimes.encode_input(START_TIME, START_TIME+PERIOD_LENGTH), 0, False)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, False, {'from': user_a})

    id = 0
    req = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, False)
    hashes = [keccakReq(auto, req)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req]

    # Being just before the `afterTime` should revert
    chain.sleep(START_TIME - chain.time() + 110)
    deployer.transfer(deployer, 0)
    with reverts(REV_MSG_TOO_LATE):
        expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})


# Recurring automation

def test_forwardCalls_time_condition_everyTimePeriod(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    call_id = 1
    tc_fcn_data = (tc.address, tc.everyTimePeriod.encode_input(user_a, call_id, START_TIME, PERIOD_LENGTH), 0, True)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, True, {'from': user_a})

    assert tc.userToIdToLastExecTime(user_a, call_id) == 0
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
    eth_for_exec_1 = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec_1
    assert fr.balance() == amount_dep - eth_for_exec_1
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqExecuted"][0].values() == [id, False]

    # Being just before the next period should revert
    with reverts(REV_MSG_TOO_EARLY_PERIOD):
        expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    
    # Should now be within the valid time range
    chain.sleep(START_TIME + PERIOD_LENGTH - chain.time() + 10)
    deployer.transfer(deployer, 0)
    expected_gas = auto.r.executeHashedReq.call(id, req, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    assert tc.userToIdToLastExecTime(user_a, call_id) == START_TIME + PERIOD_LENGTH
    eth_for_exec_2 = get_eth_for_exec(evm_maths, tx, INIT_GAS_PRICE_FAST)
    assert fr.balances(user_a) == amount_dep - eth_for_exec_1 - eth_for_exec_2
    assert fr.balance() == amount_dep - eth_for_exec_1 - eth_for_exec_2
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqExecuted"][0].values() == [id, False]


def test_forwardCalls_time_condition_everyTimePeriod_multiple_callIds(a, auto, evm_maths, fr, fr_dep, tc, mock_target, deployer, user_a):
    amount_dep, _ = fr_dep
    call_id_1 = 1
    tc_fcn_data = (tc.address, tc.everyTimePeriod.encode_input(user_a, call_id_1, START_TIME, PERIOD_LENGTH), 0, True)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, True, {'from': user_a})

    assert tc.userToIdToLastExecTime(user_a, call_id_1) == 0
    id = 0
    req_1 = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, True)
    hashes = [keccakReq(auto, req_1)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req_1]

    # Being just before the `afterTime` should revert
    chain.sleep(START_TIME - chain.time() - 10)
    deployer.transfer(deployer, 0)
    with reverts(REV_MSG_NOT_PASSED_START):
        expected_gas = auto.r.executeHashedReq.call(id, req_1, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    # Should now be within the valid time range of the 1st call_id
    chain.sleep(START_TIME - chain.time() + 10)
    # Need to make a tx to have the changed chain timestamp be reflected on-chain
    deployer.transfer(deployer, 0)
    
    # A 2nd call_id should not interfere with the 1st

    call_id_2 = 2
    tc_fcn_data = (tc.address, tc.everyTimePeriod.encode_input(user_a, call_id_2, START_TIME+PERIOD_LENGTH, PERIOD_LENGTH), 0, True)
    fr_callData = fr.forwardCalls.encode_input(user_a, 0, [tc_fcn_data])
    
    tx = auto.r.newReq(fr, ADDR_0, fr_callData, 0, True, True, True, {'from': user_a})

    assert tc.userToIdToLastExecTime(user_a, call_id_1) == 0
    assert tc.userToIdToLastExecTime(user_a, call_id_2) == 0
    id = 1
    req_2 = (user_a, fr, ADDR_0, fr_callData, 0, 0, True, True, False, True)
    hashes = [*hashes, keccakReq(auto, req_2)]
    assert tx.return_value == id
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqAdded"][0].values() == [id, *req_2]

    # Being before the start for the 2nd call_id should revert
    with reverts(REV_MSG_NOT_PASSED_START):
        expected_gas = auto.r.executeHashedReq.call(id, req_2, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    
    # Should now be within the valid time range of the 2nd call_id
    chain.sleep(START_TIME+PERIOD_LENGTH - chain.time() + 10)
    deployer.transfer(deployer, 0)
    expected_gas = auto.r.executeHashedReq.call(id, req_2, MIN_GAS, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})
    tx = auto.r.executeHashedReq(id, req_2, expected_gas, {'from': deployer, 'gasPrice': INIT_GAS_PRICE_FAST})

    assert tc.userToIdToLastExecTime(user_a, call_id_1) == 0
    assert tc.userToIdToLastExecTime(user_a, call_id_2) == START_TIME+PERIOD_LENGTH
    assert auto.r.getHashedReqs() == hashes
    assert tx.events["HashedReqExecuted"][0].values() == [id, False]