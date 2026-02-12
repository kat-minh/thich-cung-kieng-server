import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { GoogleAuthGuard } from './google/guards/google-auth.guard';
import { GoogleLoginDto } from './google/dto/google-auth.dto';
import { SubscriptionCheckService } from './services/subscription-check.service';
import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly subscriptionCheckService: SubscriptionCheckService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register with email and password',
    description: 'Create a new user account with email and password',
  })
  @ApiBody({
    type: RegisterRequestDto,
    description: 'User registration data',
  })
  @ApiOkResponse({
    description: 'Registration successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
            },
            email: { type: 'string', example: 'user@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'USER' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Email already exists or validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email already exists' },
      },
    },
  })
  async register(
    @Body() registerDto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.register(registerDto);

    // Set cookie for refresh token
    res.cookie('refreshToken', response.tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      subscription: response.subscription,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // 200 instead of 201
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticate user with email and password credentials',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
            },
            email: { type: 'string', example: 'user@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'USER' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid email or password' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed',
  })
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.login(loginDto);

    // Set cookie for refresh token
    res.cookie('refreshToken', response.tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      subscription: response.subscription,
    };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Initiate Google OAuth authentication flow',
  })
  @ApiOkResponse({
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth() {
    // Passport will handle the redirect
  }

  @Public()
  @Post('google/mobile')
  @ApiOperation({
    summary: 'Google OAuth login for mobile apps',
    description:
      'Authenticate with Google ID token from mobile OAuth flow (PKCE)',
  })
  @ApiBody({
    type: GoogleLoginDto,
    description: 'Google OAuth tokens from mobile',
  })
  @ApiOkResponse({
    description: 'Authentication successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
            },
            email: { type: 'string', example: 'user@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'USER' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid Google token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid Google token' },
      },
    },
  })
  async googleAuthMobile(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.mobileGoogleLogin(googleLoginDto);
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and complete authentication',
  })
  @ApiOkResponse({
    description:
      'Google authentication successful, redirects to frontend with tokens',
  })
  @ApiBadRequestResponse({
    description: 'Google authentication failed',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.googleLogin((req as any).user);
    if (!response) {
      return res.redirect(
        `${this.configService.get<string>('server.clientUrl')}/auth/error`,
      );
    }

    // Set cookie for refresh token
    res.cookie('refreshToken', response.tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Set Google refresh token in cookie for calendar access
    const googleRefreshToken = (req as any).user?.refreshToken;
    if (googleRefreshToken) {
      res.cookie('googleRefreshToken', googleRefreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.setHeader(
      'Access-Control-Allow-Origin',
      this.configService.get<string>('server.clientUrl') ||
        'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    const urlParams = new URLSearchParams({
      accessToken: response.tokens.accessToken,
    });
    // // Redirect to frontend with access token
    res.redirect(
      `${this.configService.get<string>('server.clientUrl')}/auth/callback?${urlParams.toString()}`,
    );
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Log out user and invalidate refresh token stored in cookies',
  })
  @ApiOkResponse({
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Logout failed - refresh token not found or invalid',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Refresh token not found' },
      },
    },
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    if (!(await this.authService.logout(refreshToken))) {
      throw new BadRequestException('Logout failed');
    }

    // Xoá cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('server.env') === 'production',
      sameSite: 'lax',
    });
    // Trả về thông báo thành công
    return {
      message: 'Logout successful',
    };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token from cookies',
  })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Refresh token not found or invalid',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Refresh token not found' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'] || req.body.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    if (!tokens) {
      throw new BadRequestException('Failed to refresh tokens');
    }

    // Trả về access token mới
    res.json({
      accessToken: tokens.accessToken,
    });
  }

  @Public()
  @Get('google-calendar-token')
  @ApiOperation({
    summary: 'Get Google Calendar refresh token',
    description:
      'Get the Google refresh token for calendar access from cookies',
  })
  @ApiOkResponse({
    description: 'Google refresh token retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        googleRefreshToken: {
          type: 'string',
          example: '1//0g...',
          description: 'Use this token to sync events to Google Calendar',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Google refresh token not found. Please login via Google again.',
  })
  async getGoogleCalendarToken(@Req() req: Request) {
    const googleRefreshToken = req.cookies['googleRefreshToken'];

    if (!googleRefreshToken) {
      throw new BadRequestException(
        'Google refresh token not found. Please login via Google again to grant calendar access.',
      );
    }

    return {
      googleRefreshToken,
      message: 'Use this token in the sync-to-calendar endpoint',
    };
  }
}
