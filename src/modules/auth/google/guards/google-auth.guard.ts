import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();
    const email = request.query.login_hint;

    const options: any = {
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar', // thêm scope Calendar
      ],
      accessType: 'offline',
      prompt: 'consent',
    };

    if (email) {
      options.loginHint = email;
      options.prompt = 'select_account';
    }
    return options;
  }
}
