// Local development entry point: `npm run dev` (Node)
import { serve } from '@hono/node-server';

import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: createApp().fetch, port, hostname: '0.0.0.0' }, (info) => console.log(`Bankin95 server on http://localhost:${info.port}`));
