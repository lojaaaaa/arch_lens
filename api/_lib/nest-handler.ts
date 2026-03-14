import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../../server/src/app.factory';

type HttpHandler = (req: VercelRequest, res: VercelResponse) => void;
let appPromise: Promise<HttpHandler> | null = null;

async function getExpressApp() {
  if (!appPromise) {
    appPromise = createApp().then(async (nestApp) => {
      await nestApp.init();
      return nestApp.getHttpAdapter().getInstance() as HttpHandler;
    });
  }
  return appPromise;
}

export async function handleNestRequest(
  req: VercelRequest,
  res: VercelResponse,
) {
  const path = req.query.path;
  if (path) {
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const url = (req.url ?? '').split('?');
    const otherParams = url[1] ? url[1].replace(/[?&]path=[^&]*/g, '').replace(/^&|&$/g, '') : '';
    req.url = '/api/' + pathStr + (otherParams ? '?' + otherParams : '');
  }
  const app = await getExpressApp();
  return new Promise<void>((resolve, reject) => {
    res.on('finish', () => resolve());
    res.on('error', reject);
    app(req, res);
  });
}
