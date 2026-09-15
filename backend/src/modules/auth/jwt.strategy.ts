import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { authConfig } from './auth.config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.HiOringToken;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: authConfig.jwtSecret,
        });
    }

    async validate(payload: any) {
        if (!payload.id || !payload.email) {
            throw new UnauthorizedException('Invalid token payload');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.id },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: payload.id,
            email: payload.email,
            role: payload.role,
        };
    }
}