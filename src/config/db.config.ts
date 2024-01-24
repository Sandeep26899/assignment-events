import mongoose from 'mongoose';
import { config } from './config';

class Database {
  static connect(): void {
    mongoose.connect(config.mongodb.uri);
    mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error));
  }
}

export default Database;