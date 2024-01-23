// src/scripts/eventScanner.ts
import { ethers } from 'ethers';
import { config } from '../config';
import { connect } from 'mongoose';
import { FeeCollectedEventModel } from '../models/FeeCollectedEvent';
import FeeCollectorABI from '../abi/FeeCollector.ABI.json';
import winston from 'winston';

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export async function scanEvents() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.chain.polygon.rpcUrl);
    const feeCollectorContract = new ethers.Contract(
      config.chain.polygon.feeCollectorAddress,
      FeeCollectorABI,
      provider
    );

    // Get the latest saved block number from the database
    const latestBlockInDb = await FeeCollectedEventModel.findOne().sort({ blockNumber: -1 });

    // Use the latest saved block number or the configured oldest block as the starting point
    const startBlock = latestBlockInDb ? latestBlockInDb.blockNumber + 1 : config.chain.polygon.oldestBlock;
    const latestBlock = startBlock + 1000;
    console.log('startBlock', startBlock, latestBlock)
    if (startBlock <= latestBlock) {
      const events = await feeCollectorContract.queryFilter(
        feeCollectorContract.filters.FeesCollected(),
        startBlock,
        latestBlock
      );

      await connect(config.mongodb.uri);

      for (const event of events) {
        const feeCollectedEvent = new FeeCollectedEventModel({
          blockNumber: event.blockNumber,
          integrator: event?.args?.integrator,
        });
        await feeCollectedEvent.save();
      }

      logger.info(`Scanned ${events.length} events and stored them in the database.`);
    } else {
      logger.info('No new blocks to scan.');
    }

    // Update the latest block number in the database
    await FeeCollectedEventModel.findOneAndUpdate({}, { $set: { latestBlock: latestBlock } }, { upsert: true });
  } catch (error) {
    logger.error(`Error during event scanning: ${error}`);
  }
}
