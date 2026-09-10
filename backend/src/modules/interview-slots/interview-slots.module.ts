import { Module } from '@nestjs/common';
import { InterviewSlotsController } from './interview-slots.controller';
import { InterviewSlotsService } from './interview-slots.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InterviewSlotsController],
  providers: [InterviewSlotsService],
  exports: [InterviewSlotsService],
})
export class InterviewSlotsModule {}
