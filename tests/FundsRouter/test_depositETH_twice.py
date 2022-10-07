from consts import *


def test_depositETH_self_twice(a, auto, fr, deployer, user_a):
    amount = 100

    tx = fr.depositETH(user_a, {'from': user_a, 'value': amount})

    assert fr.balance() == amount
    for addr in a[1:]:
        assert fr.balances(addr) == (amount if addr == user_a else 0)
        assert addr.balance() == (INIT_ETH_BAL - amount if addr == user_a else INIT_ETH_BAL)
    assert tx.events["BalanceChanged"][0].values() == [user_a, amount]

    tx = fr.depositETH(user_a, {'from': user_a, 'value': amount})

    assert fr.balance() == amount*2
    for addr in a[1:]:
        assert fr.balances(addr) == (amount*2 if addr == user_a else 0)
        assert addr.balance() == (INIT_ETH_BAL - amount*2 if addr == user_a else INIT_ETH_BAL)
    assert tx.events["BalanceChanged"][0].values() == [user_a, amount*2]


def test_depositETH_other_self(a, auto, fr, deployer, user_a, user_b):
    amount = 100

    tx = fr.depositETH(user_b, {'from': user_a, 'value': amount})

    assert fr.balance() == amount
    for addr in a[1:]:
        assert fr.balances(addr) == (amount if addr == user_b else 0)
        assert addr.balance() == (INIT_ETH_BAL - amount if addr == user_a else INIT_ETH_BAL)
    assert tx.events["BalanceChanged"][0].values() == [user_b, amount]

    tx = fr.depositETH(user_a, {'from': user_a, 'value': amount})

    assert fr.balance() == amount*2
    for addr in a[1:]:
        router_bal = 0
        account_bal = INIT_ETH_BAL
        if addr == user_a or addr == user_b:
            router_bal = amount
        if addr == user_a:
            account_bal = INIT_ETH_BAL - amount*2
        assert fr.balances(addr) == router_bal
        assert addr.balance() == account_bal
    assert tx.events["BalanceChanged"][0].values() == [user_a, amount]