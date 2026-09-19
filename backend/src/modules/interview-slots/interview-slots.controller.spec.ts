import { Test, TestingModule } from '@nestjs/testing';
import { InterviewSlotsController } from './interview-slots.controller';
import { InterviewSlotsService } from './interview-slots.service';

jest.mock('../auth/auth.middleware', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('InterviewSlotsController', () => {
  let controller: InterviewSlotsController;
  let service: {
    deleteSlot: jest.Mock;
    clearSlots: jest.Mock;
    createSlots: jest.Mock;
    findAllByFormId: jest.Mock;
    findAvailableByFormId: jest.Mock;
    bookSlot: jest.Mock;
    getBookingBySubmissionId: jest.Mock;
  };

  const mockReq = {
    user: { id: 1 },
  };

  beforeEach(async () => {
    service = {
      deleteSlot: jest.fn(),
      clearSlots: jest.fn(),
      findAll: jest.fn(),
      createSlots: jest.fn(),
      findAllByFormId: jest.fn(),
      findAvailableByFormId: jest.fn(),
      bookSlot: jest.fn(),
      getBookingBySubmissionId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewSlotsController],
      providers: [
        {
          provide: InterviewSlotsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<InterviewSlotsController>(InterviewSlotsController);
  });

  describe('findAll', () => {
    it('should call service.findAll with req.user.id and query filters', async () => {
      service.findAll.mockResolvedValue([{ id: 1 }]);
      const query = { status: 'BOOKED' as any, limit: 5 };

      const result = await controller.findAll(mockReq, query);

      expect(service.findAll).toHaveBeenCalledWith(1, query);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('deleteSlot', () => {
    it('should call service.deleteSlot with correct params', async () => {
      service.deleteSlot.mockResolvedValue({ id: 42 });

      await controller.deleteSlot(mockReq, 'form-123', 42);

      expect(service.deleteSlot).toHaveBeenCalledWith('form-123', 42, 1);
    });
  });

  describe('clearSlots', () => {
    it('should call service.clearSlots with correct params', async () => {
      service.clearSlots.mockResolvedValue({ count: 10 });

      await controller.clearSlots(mockReq, 'form-123');

      expect(service.clearSlots).toHaveBeenCalledWith('form-123', 1);
    });
  });
});

