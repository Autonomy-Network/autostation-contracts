def test_constructor(a, auto, fruf, fr, deployer):
    assert fr.registry() == auto.r
    assert fr.regUserFeeVeriForwarder() == auto.uff
    assert fr.routerUserVeriForwarder() == fruf
    for addr in a:
        assert fr.balances(addr) == 0