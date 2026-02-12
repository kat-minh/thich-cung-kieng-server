import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's user ID
  email_verified: boolean;
}

@Injectable()
export class GoogleAuthService {
  private oAuth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.oAuth2Client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  /**
   * Verify the Google ID token and extract user information
   * @param idToken The ID token received from Google
   * @returns Google user information if valid, null otherwise
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
      // Verify the token
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      // Get the payload from the verified token
      const payload = ticket.getPayload();

      if (!payload) {
        return null;
      }

      // Extract user information
      return {
        email: payload.email || '',
        name: payload.name || '',
        picture: payload.picture || '',
        sub: payload.sub, // Google's user ID
        email_verified: payload.email_verified || false,
      };
    } catch (error) {
      console.error('Error verifying Google token:', error.message);
      return null;
    }
  }
}
