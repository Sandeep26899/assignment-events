import { prop, getModelForClass } from '@typegoose/typegoose';

export class FeeCollectedEvent {
  @prop({ required: true, default: null })
  blockNumber!: number;

  @prop({ required: true, default: null })
  integrator!: string;
}

export const FeeCollectedEventModel = getModelForClass(FeeCollectedEvent);
