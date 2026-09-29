import path from 'path';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import { createExpressApp } from './src/server/createApp';

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = createExpressApp();

  if (!isProduction) {
    // In development mode, dynamically import and mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log(`[HookLab] Dev server running with Vite middlewares on port ${PORT}`);
  } else {
    // In production, serve the built dist directory
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
      console.log(`[HookLab] Production server serving static assets from ${distPath}`);
    } else {
      console.warn(`[HookLab] Warning: dist folder not found at ${distPath}. Run "npm run build" first.`);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HookLab] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[HookLab] Failed to start server:', err);
  process.exit(1);
});
