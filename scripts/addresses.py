from brownie import network


if network.show_active() == 'avax-mainnet':
    registry_addr = '0x68FCbECa74A7E5D386f74E14682c94DE0e1bC56b'
    uniV2_address = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'
    reg_uff_addr = '0xc21E82fe258ABf9BC3Ef68fB38aecDA79e472964'


if network.show_active() == 'avax-testnet':
    registry_addr = '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4'
    reg_uff_addr = '0x457B8Bb4d6c8Cc2e506789F768996ddae60CD4fd'


if network.show_active() == 'bsc-mainnet':
    registry_addr = '0x18d087F8D22D409D3CD366AF00BD7AeF0BF225Db'
    uniV2_address = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
    reg_uff_addr = '0x4F54277e6412504EBa0B259A9E4c69Dc7EE4bB9c'