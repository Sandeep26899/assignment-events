import { prop, getModelForClass } from '@typegoose/typegoose';

export class BlockNumber {
  @prop({ required: true, default: null })
  blockNumber!: number;

  @prop({ required: true, default: null })
  chain!: string;
}

export const BlockNumberModel = getModelForClass(BlockNumber);
