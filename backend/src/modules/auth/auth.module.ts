import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './auth.helper';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { authConfig } from './auth.config';
import { JwtAuthGuard } from './auth.middleware';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
            secret: authConfig.jwtSecret,
            signOptions: { expiresIn: '8h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy, JwtStrategy, JwtAuthGuard],
    exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
