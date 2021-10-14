import { RenNetwork } from "@renproject/interfaces";

import { EthereumBaseChain, EthereumClassConfig } from "./base";
import { EthProvider, EvmNetworkConfig, EvmNetworkInput } from "./utils/types";
import { resolveEvmNetworkConfig } from "./utils/utils";

export const arbitrumMainnetConfig: EvmNetworkConfig = {
    selector: "Arbitrum",

    network: {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        nativeCurrency: { name: "Ether", symbol: "AETH", decimals: 18 },
        rpcUrls: [
            "https://arb1.arbitrum.io/rpc",
            "https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}",
            "https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}",
            "wss://arb1.arbitrum.io/ws",
        ],
        blockExplorerUrls: [
            "https://arbiscan.io",
            "https://explorer.arbitrum.io",
        ],
    },

    logRequestLimit: 20000,
    addresses: {
        GatewayRegistry: "0x21C482f153D0317fe85C60bE1F7fa079019fcEbD",
        BasicAdapter: "0xAC23817f7E9Ec7EB6B7889BDd2b50e04a44470c5",
    },
};

export const arbitrumTestnetConfig: EvmNetworkConfig = {
    selector: "Arbitrum",
    isTestnet: true,

    network: {
        chainId: "0x66eeb",
        chainName: "Arbitrum Testnet Rinkeby",
        nativeCurrency: {
            name: "Arbitrum Rinkeby Ether",
            symbol: "ARETH",
            decimals: 18,
        },
        rpcUrls: [
            "https://rinkeby.arbitrum.io/rpc",
            "wss://rinkeby.arbitrum.io/ws",
        ],
        blockExplorerUrls: [
            "https://testnet.arbiscan.io/",
            "https://rinkeby-explorer.arbitrum.io",
        ],
    },

    logRequestLimit: 20000,
    addresses: {
        GatewayRegistry: "0x5eEBf6c199a9Db26dabF621fB8c43D58C62DF2bd",
        BasicAdapter: "0x1156663dFab56A9BAdd844e12eDD69eC96Dd0eFb",
    },
};

export class Arbitrum extends EthereumBaseChain {
    public static chain = "Arbitrum";

    public static configMap = {
        [RenNetwork.Testnet]: arbitrumTestnetConfig,
        [RenNetwork.Mainnet]: arbitrumMainnetConfig,
    };
    public configMap = Arbitrum.configMap;

    constructor(
        network: EvmNetworkInput,
        web3Provider: EthProvider,
        config: EthereumClassConfig = {},
    ) {
        super(
            resolveEvmNetworkConfig(Arbitrum.configMap, network),
            web3Provider,
            config,
        );
    }
}
