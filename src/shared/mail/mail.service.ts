import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SEND_NOTIFICATION_EMAIL_SUBJECT, SEND_NOTIFICATION_EMAIL_TEMPLATE, SEND_PASSWORD_RESET_EMAIL_SUBJECT, SEND_PASSWORD_RESET_EMAIL_TEMPLATE, SEND_WELCOME_EMAIL_SUBJECT, SEND_WELCOME_EMAIL_TEMPLATE } from 'src/common/constants/email.constant';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async sendWelcomeEmail(user: any) {
        const url = `${this.configService.get<string>('clientUrl')}/welcome`;
        await this.mailerService.sendMail({
            to: user.email,
            subject: SEND_WELCOME_EMAIL_SUBJECT,
            template: SEND_WELCOME_EMAIL_TEMPLATE,
            context: {
                name: user.name,
                url,
            },
        });
    }

    async sendPasswordReset(user: any, token: string) {
        const url = `${this.configService.get<string>('clientUrl')}/reset-password?token=${token}`;
        await this.mailerService.sendMail({
            to: user.email,
            subject: SEND_PASSWORD_RESET_EMAIL_SUBJECT,
            template: SEND_PASSWORD_RESET_EMAIL_TEMPLATE,
            context: {
                name: user.name,
                url,
            },
        });
    }

    async sendNotification(user: any, message: string, url?: string) {
        const defaultUrl = `${this.configService.get<string>('clientUrl')}/dashboard`;
        await this.mailerService.sendMail({
            to: user.email,
            subject: SEND_NOTIFICATION_EMAIL_SUBJECT,
            template: SEND_NOTIFICATION_EMAIL_TEMPLATE,
            context: {
                name: user.name,
                message,
                url: url || defaultUrl,
            },
        });
    }
}
