import express from 'express';
import Database from './config/db.config';
import EventService from './services/event.service';

class App {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = 3000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.startServer();
  }

  private initializeMiddlewares(): void {
    // Add any necessary middlewares here
  }

  private initializeRoutes(): void {
    this.app.get('/events/:integrator', async (req, res) => {
      try {
        const integrator = req.params.integrator;
        const events = await EventService.getEventsForIntegrator(integrator);
        res.json(events);
      } catch (error) {
        console.error('Error while retrieving events for integrator:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }

  private startServer(): void {
    Database.connect();
    EventService.scheduleEventScan();

    this.app.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}`);
    });
  }
}

new App();