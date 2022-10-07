from brownie import accounts, FundsRouter, TimeConditions, Forwarder, UniswapV2Amounts, MockTarget
import sys
import os
sys.path.append(os.path.abspath('scripts'))
from addresses import *
sys.path.append(os.path.abspath('tests'))
from consts import *
sys.path.pop()


deployer_priv = os.environ['DEPLOYER_PRIV']
deployer = accounts.add(private_key=deployer_priv)
print(deployer)
PUBLISH_SOURCE = True


def main():
    fruf = deployer.deploy(Forwarder, publish_source=PUBLISH_SOURCE)
    fr = deployer.deploy(FundsRouter, registry_addr, reg_uff_addr, fruf, publish_source=PUBLISH_SOURCE)
    fruf.setCaller(fr, True, {'from': deployer})
    tc = deployer.deploy(TimeConditions, fruf, publish_source=PUBLISH_SOURCE)
    mock_target = deployer.deploy(MockTarget, fruf, fr, publish_source=PUBLISH_SOURCE)
    uniV2_amounts = deployer.deploy(UniswapV2Amounts, uniV2_address, publish_source=PUBLISH_SOURCE)

    print(f'Forwarder deployed at: {fruf}')
    print(f'FundsRouter deployed at: {fr}')
    print(f'TimeConditions deployed at: {tc}')
    print(f'UniswapV2Amounts deployed at: {uniV2_amounts}')
    print(f'MockTarget deployed at: {mock_target}')
