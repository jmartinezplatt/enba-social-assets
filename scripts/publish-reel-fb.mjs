import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const token = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'META_ACCESS_TOKEN\',\'User\')"').toString().trim();
const guion = JSON.parse(readFileSync('campaigns/reels/reel-primera-vez/guion.json', 'utf8'));
const caption = guion.captionFb;
const videoPath = path.resolve('campaigns/reels/reel-primera-vez/reel-primera-vez-v8-web.mp4');

console.log('Caption preview:');
console.log(caption.substring(0, 100) + '...');
console.log('');

const url = `https://graph.facebook.com/v21.0/1064806400040502/videos`;

const form = new FormData();
form.append('description', caption);
form.append('access_token', token);
form.append('source', new Blob([readFileSync(videoPath)]), 'reel.mp4');

console.log('Uploading to FB...');
const res = await fetch(url, { method: 'POST', body: form });
const data = await res.json();
console.log('Result:', JSON.stringify(data));
