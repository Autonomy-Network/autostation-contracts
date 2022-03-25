def test_constructor(a, fruf, deployer):
    assert fruf.owner() == deployer
    for addr in a:
        assert fruf.canCall(addr) == False