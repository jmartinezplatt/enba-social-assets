#!/usr/bin/env node
// publish-carousel.mjs — Publish Instagram + Facebook carousel posts via Meta Graph API
//
// Usage:
//   node scripts/publish-carousel.mjs carrusel-cuanto-sale [--dry-run] [--ig-only] [--fb-only]
//
// Tokens: PAGE ACCESS TOKEN from Windows User scope (META_ACCESS_TOKEN).
// IDs: from .env (META_PAGE_ID, META_IG_USER_ID).
// Slides must be deployed to Cloudflare Pages before running.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const GRAPH_API = 'https://graph.facebook.com/v21.0';
// Usar pages.dev, NO custom domain — Cloudflare bloquea crawler IG en custom domains (403)
const BASE_URL = 'https://enba-social-assets.pages.dev';
const CAROUSELS_DIR = resolve(ROOT, 'campaigns/carruseles-organicos');

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 60_000;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));

const DRY_RUN = flags.has('--dry-run');
const IG_ONLY = flags.has('--ig-only');
const FB_ONLY = flags.has('--fb-only');

if (IG_ONLY && FB_ONLY) {
  fatal('Cannot use --ig-only and --fb-only together.');
}

const slug = positional[0];
if (!slug) {
  console.error('Usage: node scripts/publish-carousel.mjs <carousel-slug> [--dry-run] [--ig-only] [--fb-only]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load config
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) fatal('.env file not found at repo root');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function getAccessToken() {
  const token = execSync(
    `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ACCESS_TOKEN','User')"`,
    { encoding: 'utf-8' }
  ).trim();
  if (!token) fatal('META_ACCESS_TOKEN not set in Windows User scope.');
  return token;
}

function loadCarousel(carouselSlug) {
  const dir = resolve(CAROUSELS_DIR, carouselSlug);
  if (!existsSync(dir)) fatal(`Carousel directory not found: ${dir}`);

  const captionsPath = resolve(dir, 'captions.json');
  if (!existsSync(captionsPath)) fatal(`captions.json not found in ${dir}`);
  const captions = JSON.parse(readFileSync(captionsPath, 'utf-8'));

  // Determine slide count from captions.json or carousel.config.json
  let slideCount = captions.slides;
  if (!slideCount) {
    const configPath = resolve(dir, 'carousel.config.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      slideCount = config.slides?.length;
    }
  }
  if (!slideCount) fatal('Cannot determine slide count from captions.json or carousel.config.json');

  return { captions, slideCount, dir };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fatal(msg) {
  console.error(`\nERROR: ${msg}`);
  process.exit(1);
}

function log(msg) {
  console.log(msg);
}

function step(n, msg) {
  console.log(`\n[${'='.repeat(60)}]`);
  console.log(`  STEP ${n}: ${msg}`);
  console.log(`[${'='.repeat(60)}]`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function graphPost(path, params, token) {
  const url = new URL(`${GRAPH_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set('access_token', token);

  const res = await fetch(url.toString(), { method: 'POST' });
  const body = await res.json();

  if (!res.ok || body.error) {
    const err = body.error || { message: `HTTP ${res.status}` };
    throw new Error(`Graph API error: ${err.message} (code: ${err.code || 'N/A'}, type: ${err.type || 'N/A'})`);
  }
  return body;
}

async function graphGet(path, params, token) {
  const url = new URL(`${GRAPH_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set('access_token', token);

  const res = await fetch(url.toString());
  const body = await res.json();

  if (!res.ok || body.error) {
    const err = body.error || { message: `HTTP ${res.status}` };
    throw new Error(`Graph API error: ${err.message}`);
  }
  return body;
}

// ---------------------------------------------------------------------------
// Build slide URLs & verify
// ---------------------------------------------------------------------------
function buildSlideUrls(carouselSlug, slideCount) {
  const urls = [];
  for (let i = 1; i <= slideCount; i++) {
    const nn = String(i).padStart(2, '0');
    urls.push(`${BASE_URL}/campaigns/carruseles-organicos/${carouselSlug}/slide-${nn}.png`);
  }
  return urls;
}

async function verifyUrls(urls) {
  log('\nVerifying slide URLs are publicly accessible...');
  const failed = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const status = res.status;
      const icon = status === 200 ? 'OK' : `FAIL (${status})`;
      log(`  ${icon}  ${url}`);
      if (status !== 200) failed.push({ url, status });
    } catch (err) {
      log(`  FAIL (network error)  ${url}`);
      failed.push({ url, status: 'network error' });
    }
  }
  if (failed.length > 0) {
    fatal(`${failed.length} slide URL(s) not accessible. Deploy to Cloudflare Pages first.`);
  }
  log('All slide URLs verified.');
}

// ---------------------------------------------------------------------------
// Instagram carousel publish
// ---------------------------------------------------------------------------
async function publishInstagram(igUserId, slideUrls, captionIg, token) {
  step('IG-1', `Creating ${slideUrls.length} child containers`);
  const childIds = [];

  for (let i = 0; i < slideUrls.length; i++) {
    const url = slideUrls[i];
    log(`  Slide ${i + 1}/${slideUrls.length}: ${url}`);

    if (DRY_RUN) {
      const fakeId = `dry-run-child-${i + 1}`;
      log(`  [DRY RUN] Would POST /${igUserId}/media?image_url=...&is_carousel_item=true`);
      childIds.push(fakeId);
      continue;
    }

    const result = await graphPost(`/${igUserId}/media`, {
      image_url: url,
      is_carousel_item: 'true',
    }, token);

    log(`  Container ID: ${result.id}`);
    childIds.push(result.id);
  }

  // Poll each child container until FINISHED
  step('IG-2', 'Polling child container status');
  if (!DRY_RUN) {
    for (let i = 0; i < childIds.length; i++) {
      const cid = childIds[i];
      log(`  Polling container ${i + 1}/${childIds.length} (${cid})...`);
      const start = Date.now();

      while (true) {
        const status = await graphGet(`/${cid}`, { fields: 'status_code' }, token);
        const code = status.status_code;
        log(`    status: ${code}`);

        if (code === 'FINISHED') break;
        if (code === 'ERROR') {
          fatal(`Child container ${cid} returned ERROR. Aborting IG publish.`);
        }

        if (Date.now() - start > POLL_TIMEOUT_MS) {
          fatal(`Timeout waiting for container ${cid} to finish (>${POLL_TIMEOUT_MS / 1000}s).`);
        }
        await sleep(POLL_INTERVAL_MS);
      }
    }
    log('  All child containers FINISHED.');
  } else {
    log('  [DRY RUN] Would poll each child container until FINISHED.');
  }

  // Create carousel container
  step('IG-3', 'Creating carousel container');
  const childrenParam = childIds.join(',');
  log(`  Children: ${childrenParam}`);
  log(`  Caption length: ${captionIg.length} chars`);

  let carouselContainerId;
  if (DRY_RUN) {
    log(`  [DRY RUN] Would POST /${igUserId}/media?media_type=CAROUSEL&children=...&caption=...`);
    carouselContainerId = 'dry-run-carousel-container';
  } else {
    const result = await graphPost(`/${igUserId}/media`, {
      media_type: 'CAROUSEL',
      children: childrenParam,
      caption: captionIg,
    }, token);
    carouselContainerId = result.id;
    log(`  Carousel container ID: ${carouselContainerId}`);
  }

  // Poll carousel container
  if (!DRY_RUN) {
    log('  Polling carousel container status...');
    const start = Date.now();
    while (true) {
      const status = await graphGet(`/${carouselContainerId}`, { fields: 'status_code' }, token);
      const code = status.status_code;
      log(`    status: ${code}`);

      if (code === 'FINISHED') break;
      if (code === 'ERROR') {
        fatal(`Carousel container returned ERROR. Aborting IG publish.`);
      }

      if (Date.now() - start > POLL_TIMEOUT_MS) {
        fatal(`Timeout waiting for carousel container to finish.`);
      }
      await sleep(POLL_INTERVAL_MS);
    }
  }

  // Publish
  step('IG-4', 'Publishing carousel');
  let igPostId;
  if (DRY_RUN) {
    log(`  [DRY RUN] Would POST /${igUserId}/media_publish?creation_id=${carouselContainerId}`);
    igPostId = 'dry-run-ig-post-id';
  } else {
    const result = await graphPost(`/${igUserId}/media_publish`, {
      creation_id: carouselContainerId,
    }, token);
    igPostId = result.id;
    log(`  Published! IG Post ID: ${igPostId}`);
  }

  return igPostId;
}

// ---------------------------------------------------------------------------
// Facebook carousel publish (v6 two-step pattern)
// ---------------------------------------------------------------------------
async function publishFacebook(pageId, slideUrls, captionFb, token) {
  step('FB-1', `Uploading ${slideUrls.length} unpublished photos`);
  const mediaFbids = [];

  for (let i = 0; i < slideUrls.length; i++) {
    const url = slideUrls[i];
    log(`  Slide ${i + 1}/${slideUrls.length}: ${url}`);

    if (DRY_RUN) {
      const fakeId = `dry-run-fbid-${i + 1}`;
      log(`  [DRY RUN] Would POST /${pageId}/photos?url=...&published=false`);
      mediaFbids.push(fakeId);
      continue;
    }

    const result = await graphPost(`/${pageId}/photos`, {
      url: url,
      published: 'false',
    }, token);

    const fbid = result.id;
    log(`  Photo FBID: ${fbid}`);
    mediaFbids.push(fbid);
  }

  // Publish as multi-image post
  step('FB-2', 'Publishing multi-image feed post');
  const attachedMedia = JSON.stringify(mediaFbids.map(id => ({ media_fbid: id })));
  log(`  attached_media: ${attachedMedia}`);
  log(`  Caption length: ${captionFb.length} chars`);

  let fbPostId;
  if (DRY_RUN) {
    log(`  [DRY RUN] Would POST /${pageId}/feed?message=...&attached_media=...`);
    fbPostId = 'dry-run-fb-post-id';
  } else {
    const result = await graphPost(`/${pageId}/feed`, {
      message: captionFb,
      attached_media: attachedMedia,
    }, token);
    fbPostId = result.id;
    log(`  Published! FB Post ID: ${fbPostId}`);
  }

  return fbPostId;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================');
  console.log('  ENBA Carousel Publisher');
  console.log('========================================');
  console.log(`  Carousel: ${slug}`);
  console.log(`  Dry run:  ${DRY_RUN}`);
  console.log(`  IG only:  ${IG_ONLY}`);
  console.log(`  FB only:  ${FB_ONLY}`);

  // Load env + token
  const env = loadEnv();
  const pageId = env.META_PAGE_ID;
  const igUserId = env.META_IG_USER_ID;
  if (!pageId) fatal('META_PAGE_ID not found in .env');
  if (!igUserId) fatal('META_IG_USER_ID not found in .env');

  log(`\n  Page ID:   ${pageId}`);
  log(`  IG User:   ${igUserId}`);

  const token = getAccessToken();
  log('  Token:     LOADED (not shown)');

  // Load carousel data
  const { captions, slideCount } = loadCarousel(slug);
  log(`\n  Slides:    ${slideCount}`);
  log(`  Status:    ${captions.status}`);

  if (captions.status !== 'aprobado') {
    fatal(`Carousel status is "${captions.status}" — must be "aprobado" to publish.`);
  }

  if (!FB_ONLY && !captions.captionIg) fatal('captionIg missing in captions.json');
  if (!IG_ONLY && !captions.captionFb) fatal('captionFb missing in captions.json');

  // Build and verify slide URLs
  const slideUrls = buildSlideUrls(slug, slideCount);
  await verifyUrls(slideUrls);

  // Publish
  let igPostId = null;
  let fbPostId = null;

  if (!FB_ONLY) {
    try {
      igPostId = await publishInstagram(igUserId, slideUrls, captions.captionIg, token);
    } catch (err) {
      console.error(`\nIG PUBLISH FAILED: ${err.message}`);
      if (IG_ONLY) process.exit(1);
      // Continue to FB if not --ig-only
    }
  }

  if (!IG_ONLY) {
    try {
      fbPostId = await publishFacebook(pageId, slideUrls, captions.captionFb, token);
    } catch (err) {
      console.error(`\nFB PUBLISH FAILED: ${err.message}`);
      if (!igPostId) process.exit(1);
      // Partial success if IG already published
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('  RESULT SUMMARY');
  console.log('========================================');

  if (!FB_ONLY) {
    if (igPostId) {
      console.log(`  IG Post ID:  ${igPostId}`);
      console.log(`  IG URL:      https://www.instagram.com/p/${igPostId}/`);
    } else {
      console.log('  IG:          FAILED or SKIPPED');
    }
  }

  if (!IG_ONLY) {
    if (fbPostId) {
      console.log(`  FB Post ID:  ${fbPostId}`);
      // FB post URL: pageId_postId format
      const parts = fbPostId.split('_');
      if (parts.length === 2) {
        console.log(`  FB URL:      https://www.facebook.com/${parts[0]}/posts/${parts[1]}`);
      } else {
        console.log(`  FB URL:      https://www.facebook.com/${pageId}/posts/${fbPostId}`);
      }
    } else {
      console.log('  FB:          FAILED or SKIPPED');
    }
  }

  if (DRY_RUN) {
    console.log('\n  [DRY RUN] No actual API calls were made.');
  }

  // Exit with error if anything failed
  const igExpected = !FB_ONLY;
  const fbExpected = !IG_ONLY;
  if ((igExpected && !igPostId) || (fbExpected && !fbPostId)) {
    console.log('\n  Partial or full failure detected.');
    process.exit(1);
  }

  console.log('\n  All done.');
}

main().catch(err => {
  console.error(`\nFATAL: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
