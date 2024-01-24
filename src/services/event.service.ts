import cron from 'node-cron';
import EventScanner from '../services/eventScanner';
import { EventModel } from '../models/feecollectedevent';
import { config } from '../config/config';

class EventService {
  static async getEventsForIntegrator(integrator: string){
    const data = await EventModel.find({ 'args.integrator': integrator }).exec();
    return {
      error: false,
      message: "Events fetched successfully",
      data: data
    }
  }
  

  static async scheduleEventScan(): Promise<void> {
    // Schedule the task to run every 5 seconds
    cron.schedule('*/5 * * * * *', async () => {
      await new EventScanner(config.chain.polygon).scanEvents();
    });
  }
}

export default EventService;