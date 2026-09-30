import { createExpressApp } from './createApp';

// Initialize the Express app with full routes, security, and storage adapters
const app = createExpressApp();

export { app };
export default app;
