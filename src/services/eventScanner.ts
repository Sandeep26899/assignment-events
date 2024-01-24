import { ethers, providers, Contract, Event } from "ethers";
import { config } from "../config/config";
import { BlockNumberModel } from "../models/blocknumber";
import FeeCollectorABI from "../abi/FeeCollector.ABI.json";
import logger from "../log";
import { EventModel } from "../models/feecollectedevent";

class EventScanner {
  private provider: providers.JsonRpcProvider;
  private feeCollectorContract: Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      config.chain.polygon.rpcUrl
    );
    this.feeCollectorContract = new ethers.Contract(
      config.chain.polygon.feeCollectorAddress,
      FeeCollectorABI,
      this.provider
    );
  }

  getBlockInfo = async (
    chain: string
  ): Promise<{
    error: boolean;
    data: { blockNumber: number };
  }> => {
    try {
      const block_info = await BlockNumberModel.findOne({ chain }).exec();
      console.log("block_info", block_info);

      if (!block_info || !block_info.blockNumber) {
        return { error: true, data: { blockNumber: 0 } };
      }
      return { error: false, data: block_info };
    } catch (error) {
      console.log("Error in catch at getBlockInfo of EventService", error);
      return { error: true, data: { blockNumber: 0 } };
    }
  };

  getStartEndBlock = async (
    defaultBlock: number,
    chain: string
  ): Promise<{
    error: boolean;
    startBlock: number;
    endBlock: number;
  }> => {
    // Block batch size  & start and end block calculation begins
    try {
      // Initialize block parameters
      let fromBlock = defaultBlock;
      const eventBatchSize = 1000;

      // Get block information
      const blockInfo = await this.getBlockInfo(chain);
      if (!blockInfo.error) {
        fromBlock = blockInfo.data.blockNumber + 1;
      }

      // Calculate start and end blocks
      const startBlock = fromBlock;
      let currentBlock = await this.provider.getBlockNumber();
      console.table({
        LATEST_BLOCK: currentBlock,
        LAST_BLOCK_PROCESSED: startBlock,
        BLOCK_DIFFERENCE: currentBlock - startBlock,
        CHAIN: chain,
      });
      currentBlock -= 6;
      let endBlock: number = startBlock + eventBatchSize;
      if (startBlock + eventBatchSize > currentBlock) {
        endBlock = currentBlock;
      }
      return {
        error: false,
        startBlock,
        endBlock,
      };
    } catch (error) {
      console.log("Error in catch at getStartEndBlock of EventService", error);
      return { error: true, startBlock: 0, endBlock: 0 };
    }
  };

  async scanEvents(): Promise<void> {
    try {
      // Get the latest saved block number from the database
      const latestBlockInDb = await this.getStartEndBlock(
        config.chain.polygon.oldestBlock,
        "polygon"
      );
      console.log(
        "getEventsForIntegratorgetEventsForIntegrator",
        latestBlockInDb
      );

      if (!latestBlockInDb.error) {
        const events = await this.getEvents(
          latestBlockInDb.startBlock,
          latestBlockInDb.endBlock
        );
        if (events.length) {
          await this.updateLatestBlock(
            events[events.length - 1].blockNumber,
            "polygon"
          );

          for (const event of events) {
            await this.processEvent(event);
          }
        } else {
          await this.updateLatestBlock(latestBlockInDb.endBlock, "polygon");
        }
        logger.info(
          `Scanned ${events.length} events and stored them in the database.`
        );
      }

      // Use the latest saved block number or the configured oldest block as the starting point
      // const startBlock = latestBlockInDb ? latestBlockInDb.blockNumber + 1 : config.chain.polygon.oldestBlock;
      // const latestBlock = startBlock + 1000;

      // if (startBlock <= latestBlock) {

      // } else {
      //   logger.info('No new blocks to scan.');
      // }

      // Update the latest block number in the database
    } catch (error) {
      logger.error(`Error during event scanning: ${error}`);
    }
  }

  private async getEvents(
    startBlock: number,
    endBlock: number
  ): Promise<Event[]> {
    return this.feeCollectorContract.queryFilter(
      this.feeCollectorContract.filters.FeesCollected(),
      startBlock,
      endBlock
    );
  }

  private async processEvent(event: Event): Promise<void> {
    console.log("eventevent", event);
   if(!event||!event.args){
       return 
   }
    // Assuming `event` is your input object
    const args = {
      token: event.args._token,
      integrator: event.args._integrator,
      integratorFee: event.args._integratorFee.toString(), // Convert BigNumber to string
      lifiFee: event.args._lifiFee.toString(), // Convert BigNumber to string
    };
    const eventDocument = new EventModel({
      blockNumber: event.blockNumber,
      blockHash: event.blockHash,
      transactionIndex: event.transactionIndex,
      removed: event.removed,
      address: event.address,
      data: event.data,
      topics: event.topics,
      transactionHash: event.transactionHash,
      logIndex: event.logIndex,
      args: args,
      event: event.event,
      eventSignature: event.eventSignature,
    });

    // Save the document to the database
    await eventDocument.save();
  }

  private async updateLatestBlock(latestBlock: number, chain: string) {
    try {
      const updatedBlock = await BlockNumberModel.findOneAndUpdate(
        { chain },
        { $set: { blockNumber: latestBlock } },
        { upsert: true }
      ).exec();
      if (updatedBlock) {
        return { error: true };
      }
      return { error: false };
    } catch (err) {
      console.log("Error in catch at upsertBlockInfo ", err);
      return { error: true };
    }
  }
}

export default EventScanner;
