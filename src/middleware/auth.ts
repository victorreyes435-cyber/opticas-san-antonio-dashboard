import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Automatically authorize and inject the mock user decoded token for a seamless, login-free experience
  req.user = {
    uid: 'default-user',
    email: 'dr.miller@optica.com',
    name: 'Dr. S. Miller',
    picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    iss: 'https://securetoken.google.com/mock',
    aud: 'mock',
    auth_time: Date.now() / 1000,
    sub: 'default-user',
    exp: Date.now() / 1000 + 3600,
    firebase: {
      identities: {},
      sign_in_provider: 'google.com'
    }
  } as any as DecodedIdToken;
  
  next();
};
