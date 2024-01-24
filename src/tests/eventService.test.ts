// Import necessary dependencies for testing
import EventService from '../services/event.service';
import { EventModel } from '../models/feecollectedevent';

// Mocking EventModel methods
jest.mock('../models/feecollectedevent');

describe('EventService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventsForIntegrator', () => {
    it('should return an error for an invalid integrator address', async () => {
      const invalidIntegrator = 'invalidAddress';
      const result = await EventService.getEventsForIntegrator(invalidIntegrator);
      expect(result.error).toBe(true);
      expect(result.message).toBe('Please provide a valid integrator');
      expect(result.data).toBeNull();
    });

    it('should fetch events successfully for a valid integrator address', async () => {
      const validIntegrator = '0x1aC3EF0ECF4E0ed23D62cab448f3169064230624';
      const mockEventData = [{
        "_id": "65b11cca8ada61da1415d7a1",
        "blockNumber": 52661448,
        "blockHash": "0x56b2d2b02b43edb53eda31478466a026fa769a2413709bcebae6e0d23ef9dbbe",
        "transactionIndex": 82,
        "removed": false,
        "address": "0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9",
        "data": "0x000000000000000000000000000000000000000000000000003c6568f12e8000000000000000000000000000000000000000000000000000000aa87bee538000",
        "topics": [
          "0x28a87b6059180e46de5fb9ab35eb043e8fe00ab45afcc7789e3934ecbbcde3ea",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000001ac3ef0ecf4e0ed23d62cab448f3169064230624"
        ],
        "transactionHash": "0x851b602d5c75f5253d3bb0884ee2df434ee67312d97fbcab29da66b4e370fdbd",
        "logIndex": 377,
        "args": {
          "token": "0x0000000000000000000000000000000000000000",
          "integrator": "0x1aC3EF0ECF4E0ed23D62cab448f3169064230624",
          "integratorFee": "17000000000000000",
          "lifiFee": "3000000000000000",
          "_id": "65b11cca8ada61da1415d7a2"
        },
        "event": "FeesCollected",
        "eventSignature": "FeesCollected(address,address,uint256,uint256)",
        "__v": 0
      }];

      // Mock the implementation of the find method
      (EventModel.find as jest.Mock).mockResolvedValue(mockEventData);

      const result = await EventService.getEventsForIntegrator(validIntegrator);

      expect(result.error).toBe(false);
      expect(result.message).toBe('Events fetched successfully');
      expect(result.data).toEqual(mockEventData);
      // Ensure find method was called with the correct argument
      expect(EventModel.find).toHaveBeenCalledWith({ 'args.integrator': validIntegrator });
    });

    it('should handle the case where no events are found for a valid integrator address', async () => {
      const validIntegrator = '0xE380a93Db38f46866fdf4Ca86005cb51CC259771';
      const mockEventData: any = [];

      // Mock the implementation of the find method
      (EventModel.find as jest.Mock).mockResolvedValue(mockEventData);

      const result = await EventService.getEventsForIntegrator(validIntegrator);

      expect(result.error).toBe(false);
      expect(result.message).toBe('No event found');
      expect(result.data).toEqual(mockEventData);
      // Ensure find method was called with the correct argument
      expect(EventModel.find).toHaveBeenCalledWith({ 'args.integrator': validIntegrator });
    });
  });
});



