import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './modules/files/files.module';
import { FormsModule } from './modules/forms/forms.module';
import { FormSubmissionsModule } from './modules/form-submissions/form-submissions.module';
import { HealthController } from './common/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    PrismaModule,
    FilesModule,
    AuthModule,
    FormsModule,
    FormSubmissionsModule,
    AiModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
