import { prop, getModelForClass } from "@typegoose/typegoose";

class Args {
  @prop()
  token: string;

  @prop()
  integrator: string;

  @prop()
  integratorFee: string;

  @prop()
  lifiFee: string;
  constructor(
    token: string,
    integrator: string,
    integratorFee: string,
    lifiFee?: string // Make lifiFee optional in the constructor
  ) {
    this.token = token;
    this.integrator = integrator;
    this.integratorFee = integratorFee;
    this.lifiFee = lifiFee || ""; // Assign a default value if not provided
  }
}

class EventDocument {
  @prop()
  blockNumber: number;

  @prop()
  blockHash: string;

  @prop()
  transactionIndex: number;

  @prop()
  removed: boolean;

  @prop()
  address: string;

  @prop()
  data: string;

  @prop()
  topics: string[];

  @prop()
  transactionHash: string;

  @prop()
  logIndex: number;

  @prop({ type: Args })
  args: Args;

  @prop()
  event: string;

  @prop()
  eventSignature: string;
  constructor(
    blockNumber: number,
    blockHash: string,
    transactionIndex: number,
    removed: boolean,
    address: string,
    data: string,
    topics: string[],
    transactionHash: string,
    logIndex: number,
    args: Args,
    event: string,
    eventSignature: string
  ) {
    this.blockNumber = blockNumber;
    this.blockHash = blockHash;
    this.transactionIndex = transactionIndex;
    this.removed = removed;
    this.address = address;
    this.data = data;
    this.topics = topics;
    this.transactionHash = transactionHash;
    this.logIndex = logIndex;
    this.args = args;
    this.event = event;
    this.eventSignature = eventSignature;
  }
}

export const EventModel = getModelForClass(EventDocument);
