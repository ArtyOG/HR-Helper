import { Module } from '@nestjs/common';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from '../auth/auth.module';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [S3Module, AuthModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}