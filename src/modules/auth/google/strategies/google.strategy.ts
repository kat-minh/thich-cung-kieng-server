import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  VerifyCallback,
  StrategyOptions,
} from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
      accessType: 'offline',
      prompt: 'consent',
    } as StrategyOptions);
  }
  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      if (!profile) {
        return done(new Error('Invalid profile data from Google'), undefined);
      }

      const emails = profile.emails || [];
      const photos = profile.photos || [];

      if (emails.length === 0) {
        return done(new Error('No email found in Google profile'), undefined);
      }

      const user = {
        email: emails[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        picture: photos[0]?.value || '',
        accessToken,
        refreshToken: _refreshToken,
        googleId: profile.id,
        displayName: profile.displayName || '',
      };

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
