import { Request, Response, NextFunction } from 'express';
import { getPolicy } from './policy';

export function policyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const region = req.header('x-region') || 'us';
  const policy = getPolicy(region);
  (req as any).policy = policy;
  next();
}
