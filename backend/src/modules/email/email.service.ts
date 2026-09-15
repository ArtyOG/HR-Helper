import { Injectable, UnauthorizedException } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailService {
    constructor(private prisma: PrismaService) {}

    async sendTemplatedEmail(
        userId: number,
        to: string, 
        subject: string, 
        templateName: string, 
        context: Record<string, any>
    ) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleRefreshToken: true },
        });

        if (!user || !user.googleRefreshToken) {
            throw new UnauthorizedException('Google account not linked or missing refresh token.');
        }

        const templateRelativePath = path.join('modules', 'email', 'templates', `${templateName}.hbs`);
        const templatePaths = [
            path.join(process.cwd(), 'dist', templateRelativePath),
            path.join(process.cwd(), 'src', templateRelativePath),
        ];
        
        const filePath = templatePaths.find((candidate) => fs.existsSync(candidate));
        if (!filePath) {
            throw new Error(`Email template '${templateName}' not found.`);
        }

        const templateSource = fs.readFileSync(filePath, 'utf8');
        const compiledTemplate = handlebars.compile(templateSource);
        const htmlToSend = compiledTemplate(context);

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
        );

        auth.setCredentials({
            refresh_token: user.googleRefreshToken,
        });

        auth.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { googleRefreshToken: tokens.refresh_token },
                });
            }
        });

        const gmail = google.gmail({ version: 'v1', auth });

        const emailLines = [
            `To: ${to}`,
            `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=utf-8`,
            ``,
            htmlToSend,
        ];
        const emailContent = emailLines.join('\r\n');
        const encodedMessage = Buffer.from(emailContent)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        return { messageId: response.data.id };
    }
}