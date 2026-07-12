import { Request, Response, NextFunction } from 'express';

export function cookieMiddleware(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie;
  const cookies: Record<string, string> = {};

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts.shift()?.trim();
      const value = parts.join('=')?.trim();
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }

  (req as any).cookies = cookies;
  next();
}

