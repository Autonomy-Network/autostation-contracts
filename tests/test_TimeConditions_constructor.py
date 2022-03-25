def test_constructor(a, fruf, tc, deployer):
    assert tc.routerUserVeriForwarder() == fruf
    for addr in a:
        for i in range(10):
            assert tc.userToIdToLastExecTime(addr, i) == 0