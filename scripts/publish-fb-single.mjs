#!/usr/bin/env node
// publish-fb-single.mjs — Publish a single image + caption to Facebook Page
//
// Usage:
//   node scripts/publish-fb-single.mjs <image-url> <caption-file> [--dry-run]
//
// caption-file: path to a UTF-8 text file with the caption

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const PAGE_ID = '1064806400040502';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const positional = args.filter(a => !a.startsWith('--'));

if (positional.length < 2) {
  console.error('Usage: node scripts/publish-fb-single.mjs <image-url> <caption-file> [--dry-run]');
  process.exit(1);
}

const imageUrl = positional[0];
const captionFile = positional[1];

const token = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ACCESS_TOKEN','User')"`,
  { encoding: 'utf-8' }
).trim();

if (!token) { console.error('META_ACCESS_TOKEN not set'); process.exit(1); }

const caption = readFileSync(captionFile, 'utf-8').trim();

console.log(`Image:   ${imageUrl}`);
console.log(`Caption: ${caption.length} chars`);
console.log(`Dry run: ${DRY_RUN}`);

async function post(path, params) {
  const url = new URL(`${GRAPH_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set('access_token', token);
  const res = await fetch(url.toString(), { method: 'POST' });
  const body = await res.json();
  if (body.error) throw new Error(body.error.message);
  return body;
}

async function main() {
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would upload photo and publish.');
    console.log(`\nCaption preview:\n${caption}`);
    return;
  }

  console.log('\nStep 1: Upload unpublished photo...');
  const photo = await post(`/${PAGE_ID}/photos`, { url: imageUrl, published: 'false' });
  console.log(`  Photo FBID: ${photo.id}`);

  console.log('Step 2: Publish feed post...');
  const feedPost = await post(`/${PAGE_ID}/feed`, {
    message: caption,
    attached_media: JSON.stringify([{ media_fbid: photo.id }]),
  });
  console.log(`  Post ID: ${feedPost.id}`);

  const parts = feedPost.id.split('_');
  if (parts.length === 2) {
    console.log(`  URL: https://www.facebook.com/${parts[0]}/posts/${parts[1]}`);
  }
}

main().catch(err => { console.error(`FATAL: ${err.message}`); process.exit(1); });
