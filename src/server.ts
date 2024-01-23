import express from 'express';
import { FeeCollectedEventModel } from './models/FeeCollectedEvent';
import mongoose from 'mongoose';
import { config } from './config';
import { scanEvents } from './services/eventScanner';
import cron from 'node-cron';

const app = express();
const port = 3000;

mongoose.connect(config.mongodb.uri);
mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error));


const getEventsForIntegrator = async (integrator: string) => {
  return FeeCollectedEventModel.find({ integrator }).exec();
};

// Schedule the task to run every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
    await scanEvents();
});

app.get('/events/:integrator', async (req, res) => {
  try {
    const integrator = req.params.integrator;
    const events = await getEventsForIntegrator(integrator);
    res.json(events);
  } catch (error) {
    console.error('Error while retrieving events for integrator:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
