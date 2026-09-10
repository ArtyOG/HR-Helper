import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { FilesModule } from "./modules/files/files.module";
import { FormsModule } from "./modules/forms/forms.module";
import { FormSubmissionsModule } from "./modules/form-submissions/form-submissions.module";
import { InterviewSlotsModule } from "./modules/interview-slots/interview-slots.module";
import { HealthController } from "./common/health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config/dist/config.module";

@Module({
  imports: [
    PrismaModule,
    FilesModule,
    AuthModule,
    FormsModule,
    FormSubmissionsModule,
    InterviewSlotsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
