export interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  role: string; // User role (e.g., 'USER', 'ADMIN')
  subscription?: {
    hasSubscription: boolean;
    status?: string;
    planName?: string;
    daysRemaining?: number;
  };
}
