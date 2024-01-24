export const config = {
    chain: {
      polygon: {
        chainId: 137,
        rpcUrl: "https://rpc-mainnet.maticvigil.com/",
        feeCollectorAddress: "0xbd6c7b0d2f68c2b7805d88388319cfb6ecb50ea9",
        oldestBlock: 52661447,
      },
    },
    mongodb: {
      uri: "mongodb://localhost:27017/feeCollector",
    },
  };
  