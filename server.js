import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all routes (SPA), injecting env vars at runtime
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  fs.readFile(indexPath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('Error reading index.html', err);
      return res.status(500).send('Error loading application');
    }

    // Inject Cloud Run environment variables into the window object
    // This allows the React app to access keys even though they weren't present at build time
    const envPayload = {
      API_KEY: process.env.API_KEY || "",
      BRIA_API_KEY: process.env.BRIA_API_KEY || "",
      BRIA_MCP_API_KEY: process.env.BRIA_MCP_API_KEY || "",
      BRIA_STAGING_KEY: process.env.BRIA_STAGING_KEY || ""
    };

    const script = `<script>window.__ENV__ = ${JSON.stringify(envPayload)};</script>`;
    
    // Insert script before the closing head tag
    const finalHtml = htmlData.replace('</head>', `${script}</head>`);
    
    res.send(finalHtml);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FIBO Studio Server running on port ${PORT}`);
});