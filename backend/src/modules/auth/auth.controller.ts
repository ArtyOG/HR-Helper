import { Controller, Get, Req, UseGuards, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleOAuthGuard } from './google-oauth.guard';

@Controller('auth')
export class AuthController {
    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Req() req: Request) {
        // Initiates the Google OAuth redirection
    }
    @Get('google/callback')
    @UseGuards(GoogleOAuthGuard)
    async googleAuthRedirect(@Req() req: Request & { user: any }, @Res() res: Response) {
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        if (!req.user?.accessToken) {
            return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
        const { accessToken } = req.user;
        res.cookie('HiOringToken', accessToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 8 * 60 * 60 * 1000,
        });
        return res.redirect(`${frontendUrl}/home?token=${accessToken}`);
    }
    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        const user = req.user;
        console.log('Logging out user:', user);
        res.clearCookie('HiOringToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.status(200).json({ message: 'Logged out ' });
    }

}