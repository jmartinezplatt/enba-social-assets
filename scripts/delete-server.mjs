#!/usr/bin/env node
// Mini server to handle file deletion requests from the preview HTML
import { createServer } from 'node:http';
import { unlinkSync, existsSync } from 'node:fs';

const PORT = 3847;

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/delete') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { path } = JSON.parse(body);
        // Safety: only allow deleting from the Veleros download folder
        const allowed = path.replace(/\\/g, '/');
        if (!allowed.includes('/Veleros-3-001/Veleros/') && !allowed.includes('/enba-social-assets/thumbs-')) {
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'Path not allowed' }));
          return;
        }
        if (existsSync(path)) {
          unlinkSync(path);
          console.log(`Deleted: ${path}`);
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'File not found' }));
        }
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Delete server running on http://localhost:${PORT}`);
  console.log('Only allows deletion from Veleros-3-001/Veleros/ and thumbs-* folders');
});
