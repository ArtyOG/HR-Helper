import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
  const allowedOrigins: string[] = [
    'http://localhost:5173',
    ...(frontendUrl ? [frontendUrl] : []),
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix("api", {
    exclude: ['auth', 'auth/{*path}'],
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle("HR Helper API")
    .setDescription("API for the HR Helper application")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
