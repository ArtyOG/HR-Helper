export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key',
    jwtExpiration: (process.env.JWT_EXPIRATION || '8h') as string,
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
    },
};