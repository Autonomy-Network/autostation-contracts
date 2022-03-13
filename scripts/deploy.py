from brownie import accounts, FundsRouter, TimeConditions, Forwarder
import sys
import os
sys.path.append(os.path.abspath('scripts'))
from addresses import *
sys.path.append(os.path.abspath('tests'))
from consts import *
sys.path.pop()


deployer_priv = os.environ['DEPLOYER_PRIV']
deployer = accounts.add(private_key=deployer_priv)
PUBLISH_SOURCE = True


def main():
    fruf = deployer.deploy(Forwarder, publish_source=PUBLISH_SOURCE)
    fr = deployer.deploy(FundsRouter, registry_addr, fruf, publish_source=PUBLISH_SOURCE)
    fruf.setCaller(fr, True, {'from': deployer})
    tc = deployer.deploy(TimeConditions, fruf, publish_source=PUBLISH_SOURCE)

    print(f'Forwarder deployed at: {fruf}')
    print(f'FundsRouter deployed at: {fr}')
    print(f'TimeConditions deployed at: {tc}')
