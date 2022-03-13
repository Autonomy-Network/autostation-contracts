from brownie import network


if network.show_active() == 'avax-mainnet':
    registry_addr = '0x68FCbECa74A7E5D386f74E14682c94DE0e1bC56b'


if network.show_active() == 'avax-testnet':
    registry_addr = '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4'