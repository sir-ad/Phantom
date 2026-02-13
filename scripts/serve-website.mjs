#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'fs';
import { extname, join, normalize } from 'path';
import { createServer } from 'http';

const ROOT = normalize(join(process.cwd(), 'website'));
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function resolvePath(urlPath) {
  const clean = (urlPath || '/').split('?')[0].split('#')[0];
  const base = clean === '/' ? '/index.html' : clean;
  const candidate = normalize(join(ROOT, base));
  if (!candidate.startsWith(ROOT)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const withIndex = join(candidate, 'index.html');
    return existsSync(withIndex) ? withIndex : null;
  }
  if (existsSync(candidate)) return candidate;
  const htmlCandidate = `${candidate}.html`;
  if (existsSync(htmlCandidate)) return htmlCandidate;
  return null;
}

const server = createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const contentType = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': contentType, 'cache-control': 'no-cache' });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`PHANTOM website running at http://${HOST}:${PORT}\n`);
});
