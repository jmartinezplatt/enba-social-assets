import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const token = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'META_ACCESS_TOKEN\',\'User\')"').toString().trim();
const igId = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'META_IG_BUSINESS_ACCOUNT_ID\',\'User\')"').toString().trim();
const guion = JSON.parse(readFileSync('campaigns/reels/reel-primera-vez/guion.json', 'utf8'));
const caption = guion.captionIg;
const videoPath = 'campaigns/reels/reel-primera-vez/reel-primera-vez-v8-web.mp4';
const fileSize = readFileSync(videoPath).length;

console.log('Caption preview:');
console.log(caption.substring(0, 120) + '...');
console.log('Emojis check:', caption.includes('👉') ? '👉 OK' : 'MISSING');
console.log('');

// Step 1: Init resumable upload
console.log('Step 1: Init container...');
const initUrl = `https://graph.facebook.com/v21.0/${igId}/media`;
const initParams = new URLSearchParams({
  media_type: 'REELS',
  upload_type: 'resumable',
  caption: caption,
  access_token: token
});

const initRes = await fetch(initUrl, { method: 'POST', body: initParams });
const initData = await initRes.json();
console.log('Container:', initData.id);
const uploadUri = initData.uri;

// Step 2: Upload bytes
console.log('Step 2: Uploading video...');
const videoBuffer = readFileSync(videoPath);
const uploadRes = await fetch(uploadUri, {
  method: 'POST',
  headers: {
    'Authorization': `OAuth ${token}`,
    'offset': '0',
    'file_size': String(fileSize)
  },
  body: videoBuffer
});
const uploadData = await uploadRes.json();
console.log('Upload:', uploadData.message || JSON.stringify(uploadData));

// Step 3: Wait for processing
console.log('Step 3: Waiting for processing...');
let ready = false;
for (let i = 0; i < 15; i++) {
  await new Promise(r => setTimeout(r, 8000));
  const statusRes = await fetch(`https://graph.facebook.com/v21.0/${initData.id}?fields=status_code,status&access_token=${token}`);
  const statusData = await statusRes.json();
  console.log(`  Check ${i+1}: ${statusData.status_code}`);
  if (statusData.status_code === 'FINISHED') { ready = true; break; }
  if (statusData.status_code === 'ERROR') { console.log('ERROR:', statusData.status); process.exit(1); }
}

if (!ready) { console.log('Timeout waiting for processing'); process.exit(1); }

// Step 4: Publish
console.log('Step 4: Publishing...');
const pubParams = new URLSearchParams({
  creation_id: initData.id,
  access_token: token
});
const pubRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/media_publish`, { method: 'POST', body: pubParams });
const pubData = await pubRes.json();
console.log('Published! ID:', pubData.id);

// Step 5: Get permalink
const mediaRes = await fetch(`https://graph.facebook.com/v21.0/${pubData.id}?fields=permalink,caption&access_token=${token}`);
const mediaData = await mediaRes.json();
console.log('Permalink:', mediaData.permalink);
console.log('Caption starts:', mediaData.caption?.substring(0, 80));
