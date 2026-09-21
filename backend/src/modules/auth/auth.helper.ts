// src/modules/auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        const clientID = process.env.GOOGLE_CLIENT_ID || 'placeholder-google-client-id.apps.googleusercontent.com';
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'placeholder-google-client-secret';
        const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.warn('[GoogleStrategy] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured. Google OAuth login will be inactive until configured in environment.');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile', 'https://www.googleapis.com/auth/gmail.send'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        try {
            const { name, emails, photos, displayName } = profile;

            if (!emails || emails.length === 0 || !emails[0]?.value) {
                throw new Error('Google profile must have a valid email');
            }

            const email = emails[0].value.toLowerCase().trim();
            const fullName = displayName 
                || [name?.givenName, name?.familyName].filter(Boolean).join(' ') 
                || email.split('@')[0];

            const user = await this.authService.validateGoogleUser({
                email,
                name: fullName,
                avatar: photos?.[0]?.value,
                googleId: profile.id,
            }, 
            refreshToken,
            );
            done(null, user);
        } catch (error: any) {
            console.error('[GoogleStrategy] Validation error:', error?.message || error);
            done(error, false);
        }
    }
}
