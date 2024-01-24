import cron from 'node-cron';
import { BlockNumberModel } from '../models/blocknumber';
import EventScanner from '../services/eventScanner';

class EventService {
  static async getEventsForIntegrator(integrator: string): Promise<any[]> {
    return BlockNumberModel.find({ integrator }).exec();
  }

  static async scheduleEventScan(): Promise<void> {
    // Schedule the task to run every 5 seconds
    cron.schedule('*/5 * * * * *', async () => {
      await new EventScanner().scanEvents();
    });
  }
}

export default EventService;