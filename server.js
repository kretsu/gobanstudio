import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

const distPath = path.join(__dirname, 'dist');

// Serve static assets if dist exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Health check and API info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GobanStudio',
    version: '1.0.0',
    description: 'Go Lesson & Variation Studio'
  });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GobanStudio — Go Lesson Studio</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: #1e293b; padding: 2rem 3rem; border-radius: 1rem; border: 1px solid #334155; }
            h1 { color: #f59e0b; }
            code { background: #0f172a; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>碁 GobanStudio</h1>
            <p>Please build the client with <code>npm run build</code> or run in development mode with <code>npm run dev</code>.</p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`GobanStudio server running at http://localhost:${PORT}`);
});
