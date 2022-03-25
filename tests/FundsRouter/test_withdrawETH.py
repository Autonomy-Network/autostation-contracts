from consts import *
from brownie import reverts


def test_withdrawETH_self(a, auto, fr, fr_dep, deployer, user_a):
    amount_dep, _ = fr_dep
    amount_withdraw = 50
    amount_diff = amount_dep - amount_withdraw
    assert fr.balances(user_a) == amount_dep

    tx = fr.withdrawETH(user_a, amount_withdraw, {'from': user_a})

    assert fr.balance() == amount_diff
    for addr in a[1:]:
        assert fr.balances(addr) == (amount_diff if addr == user_a else 0)
        assert addr.balance() == (INIT_ETH_BAL - amount_diff if addr == user_a else INIT_ETH_BAL)
    assert tx.events["BalanceChanged"][0].values() == [user_a, amount_diff]


def test_withdrawETH_other(a, auto, fr, fr_dep, deployer, user_a, user_b):
    amount_dep, _ = fr_dep
    amount_withdraw = 50
    amount_diff = amount_dep - amount_withdraw

    tx = fr.withdrawETH(user_b, amount_withdraw, {'from': user_a})

    assert fr.balance() == amount_diff
    for addr in a[1:]:
        router_bal = 0
        account_bal = INIT_ETH_BAL
        if addr == user_a:
            router_bal = amount_diff
        if addr == user_a:
            account_bal = INIT_ETH_BAL - amount_dep
        if addr == user_b:
            account_bal = INIT_ETH_BAL + amount_withdraw
        assert fr.balances(addr) == router_bal
        assert addr.balance() == account_bal
    assert tx.events["BalanceChanged"][0].values() == [user_a, amount_diff]


def test_withdrawETH_rev_funds(a, auto, fr, fr_dep, deployer, user_a):
    amount_dep, _ = fr_dep
    assert fr.balances(user_a) == amount_dep

    for addr in a:
        amount_withdraw = (amount_dep+1 if addr == user_a else 1)
        with reverts(REV_MSG_NOT_ENOUGH_FUNDS):
            fr.withdrawETH(user_a, amount_withdraw, {'from': addr})