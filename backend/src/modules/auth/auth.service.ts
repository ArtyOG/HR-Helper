// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    async validateGoogleUser(
        details: { email: string; name: string; avatar?: string; googleId: string },
        googleRefreshToken?: string, 
    ) {
        const user = await this.prisma.user.upsert({
            where: { email: details.email },
            update: {
                name: details.name,
                googleId: details.googleId,
                ...(googleRefreshToken && { googleRefreshToken }),
            },
            create: {
                email: details.email,
                name: details.name,
                googleId: details.googleId,
                googleRefreshToken,
            },
        });

        const payload = { id: user.id, email: user.email, role: 'HR' };
        const token = this.jwtService.sign(payload);

        return { user, accessToken: token };
    }
}