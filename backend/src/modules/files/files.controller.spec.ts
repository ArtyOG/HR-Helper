import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

jest.mock('../auth/auth.middleware', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('FilesController', () => {
  let controller: FilesController;
  let service: {
    createFileRecord: jest.Mock;
    getPresignedUploadUrl: jest.Mock;
    getFileById: jest.Mock;
  };

  const mockReq = {
    user: { id: 10 },
  };

  beforeEach(async () => {
    service = {
      createFileRecord: jest.fn(),
      getPresignedUploadUrl: jest.fn(),
      getFileById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  describe('getFileById', () => {
    it('should call filesService.getFileById with numeric id and req.user.id', async () => {
      service.getFileById.mockResolvedValue({
        id: 1,
        filename: 'resume.pdf',
        url: 'https://s3.example.com/download',
      });

      const result = await controller.getFileById(mockReq, 1);

      expect(service.getFileById).toHaveBeenCalledWith(1, 10);
      expect(result).toHaveProperty('url', 'https://s3.example.com/download');
    });
  });

  describe('removed endpoints verification', () => {
    it('should not have getFile endpoint method', () => {
      expect((controller as any).getFile).toBeUndefined();
    });

    it('should not have uploadFile endpoint method', () => {
      expect((controller as any).uploadFile).toBeUndefined();
    });
  });

  describe('createFileRecord', () => {
    it('should call service.createFileRecord with key', async () => {
      service.createFileRecord.mockResolvedValue({ id: 1, key: 'documents/1.pdf' });

      const result = await controller.createFileRecord({ key: 'documents/1.pdf' });

      expect(service.createFileRecord).toHaveBeenCalledWith('documents/1.pdf');
      expect(result).toEqual({ id: 1, key: 'documents/1.pdf' });
    });
  });

  describe('createUploadUrl', () => {
    it('should call service.getPresignedUploadUrl with filename and filesize', async () => {
      service.getPresignedUploadUrl.mockResolvedValue({ key: 'key', uploadUrl: 'url' });

      const result = await controller.createUploadUrl({ filename: 'cv.pdf', filesize: 2048 });

      expect(service.getPresignedUploadUrl).toHaveBeenCalledWith('cv.pdf', 2048);
      expect(result).toEqual({ key: 'key', uploadUrl: 'url' });
    });
  });
});
