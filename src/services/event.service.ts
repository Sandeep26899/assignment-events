import cron from 'node-cron';
import EventScanner from '../services/eventScanner';
import { EventModel } from '../models/feecollectedevent';
import { config } from '../config/config';
import { ethers } from 'ethers';

class EventService {
  static async getEventsForIntegrator(integrator: string){
    const isAddress = ethers.utils.isAddress(integrator);
    if(!isAddress){
      return {
        error: true,
        message: "Please provide a valid integrator",
        data: null
      } 
    }
    const data = await EventModel.find({ 'args.integrator': integrator });
    if(data.length > 0){
      return {
        error: false,
        message: "Events fetched successfully",
        data: data
      }
    }
    return {
      error: false,
      message: "No event found",
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