import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleNestRequest } from './_lib/nest-handler';

export const config = { runtime: 'nodejs' };

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleNestRequest(req, res);
}
