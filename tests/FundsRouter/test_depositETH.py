from consts import *


def test_depositETH_self(a, auto, fr, deployer, user_a):
    amount = 100

    tx = fr.depositETH(user_a, {'from': user_a, 'value': amount})

    assert fr.balance() == amount
    for addr in a[1:]:
        assert fr.balances(addr) == (amount if addr == user_a else 0)
        assert addr.balance() == (INIT_ETH_BAL - amount if addr == user_a else INIT_ETH_BAL)
    assert tx.events["BalanceChanged"][0].values() == [user_a, amount]


def test_depositETH_other(a, auto, fr, deployer, user_a, user_b):
    amount = 100

    tx = fr.depositETH(user_b, {'from': user_a, 'value': amount})

    assert fr.balance() == amount
    for addr in a[1:]:
        assert fr.balances(addr) == (amount if addr == user_b else 0)
        assert addr.balance() == (INIT_ETH_BAL - amount if addr == user_a else INIT_ETH_BAL)
    assert tx.events["BalanceChanged"][0].values() == [user_b, amount]