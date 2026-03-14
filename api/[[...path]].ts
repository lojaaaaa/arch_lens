import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/src/app.factory";

let appPromise: Promise<import("express").Application> | null = null;

async function getExpressApp() {
  if (!appPromise) {
    appPromise = createApp().then((nestApp) =>
      nestApp.getHttpAdapter().getInstance(),
    );
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getExpressApp();
  return new Promise<void>((resolve, reject) => {
    res.on("finish", () => resolve());
    res.on("error", reject);
    app(req, res);
  });
}
