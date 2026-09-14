// src/modules/auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        const clientID = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

        if (!clientID || !clientSecret) {
            throw new InternalServerErrorException(
                'Google Client ID and Client Secret must be defined in your .env file!'
            );
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
            const { name, emails, photos } = profile;

            if (!emails || emails.length === 0 || !emails[0].value) {
                throw new Error('Google profile must have a valid email');
            }

            if (!name || !name.givenName || !name.familyName) {
                throw new Error('Google profile must have a valid name');
            }

            const user = await this.authService.validateGoogleUser({
                email: emails[0].value,
                name: `${name.givenName} ${name.familyName}`,
                avatar: photos?.[0]?.value,
                googleId: profile.id,
            }, 
            refreshToken,
            );
            done(null, user);
        } catch (error) {
            done(error, false);
        }
    }
}
