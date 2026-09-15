import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { google } from 'googleapis';

jest.mock('googleapis');

describe('EmailService', () => {
  let service: EmailService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockSend = jest.fn();

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: 'msg-12345' } });

    (google.auth.OAuth2 as unknown as jest.Mock).mockImplementation(() => ({
      setCredentials: jest.fn(),
      on: jest.fn(),
    }));

    (google.gmail as unknown as jest.Mock).mockReturnValue({
      users: {
        messages: {
          send: mockSend,
        },
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendTemplatedEmail', () => {
    it('should throw UnauthorizedException if user does not exist or has no refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendTemplatedEmail(1, 'candidate@example.com', 'Subject', 'interview', {}),
      ).rejects.toThrow(
        new UnauthorizedException('Google account not linked or missing refresh token.'),
      );
    });

    it('should throw UnauthorizedException if user exists but googleRefreshToken is null', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, googleRefreshToken: null });

      await expect(
        service.sendTemplatedEmail(1, 'candidate@example.com', 'Subject', 'interview', {}),
      ).rejects.toThrow(
        new UnauthorizedException('Google account not linked or missing refresh token.'),
      );
    });

    it('should throw Error if template name is invalid or does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        googleRefreshToken: 'sample-refresh-token',
      });

      await expect(
        service.sendTemplatedEmail(
          1,
          'candidate@example.com',
          'Subject',
          'non-existent-template-name',
          {},
        ),
      ).rejects.toThrow(/Email template 'non-existent-template-name' not found/);
    });

    it('should compile template and send email via Gmail API when user is valid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        googleRefreshToken: 'sample-refresh-token',
      });

      const result = await service.sendTemplatedEmail(
        1,
        'candidate@example.com',
        'Interview Invitation',
        'interview',
        {
          candidateName: 'Jane Doe',
          roleTitle: 'Software Engineer',
          companyName: 'Acme Corp',
          interviewSlots: [
            {
              id: 1,
              startTime: '2026-09-20 10:00 AM',
              endTime: '11:00 AM',
            },
          ],
        },
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { googleRefreshToken: true },
      });
      expect(mockSend).toHaveBeenCalledWith({
        userId: 'me',
        requestBody: {
          raw: expect.any(String),
        },
      });
      expect(result).toEqual({ messageId: 'msg-12345' });
    });
  });
});
