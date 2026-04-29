import { execSync } from 'child_process';
import fs from 'fs';

const TOKEN = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN', 'User')"`, { encoding: 'utf8' }).trim();
const ACCOUNT = 'act_2303565156801569';

const params = new URLSearchParams({
  level: 'ad',
  time_range: JSON.stringify({ since: '2026-04-26', until: '2026-04-26' }),
  fields: 'ad_name,adset_name,campaign_name,spend,impressions,reach,frequency,cpm,clicks,ctr,cpc,actions,cost_per_action_type,video_p75_watched_actions,video_play_actions',
  limit: '50',
  access_token: TOKEN,
});

const url = `https://graph.facebook.com/v22.0/${ACCOUNT}/insights?${params}`;
const res = execSync(`curl -s --ssl-no-revoke "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const j = JSON.parse(res);

if (j.error) { console.error('API Error:', j.error.message); process.exit(1); }

fs.writeFileSync('C:/Users/josea/enba-redes/logs/gate1_hoy.json', JSON.stringify(j, null, 2));

const getAction = (actions, type) => parseFloat(actions?.find(a => a.action_type === type)?.value || 0);
const getCPA = (cpa, type) => parseFloat(cpa?.find(a => a.action_type === type)?.value || 0);

let totalSpend = 0;
let totalPageLikes = 0;
let totalThruPlays = 0;

console.log('\n=== GATE 1 — 26/04/2026 ===\n');

const ads = j.data || [];
ads.forEach(ad => {
  const spend = parseFloat(ad.spend || 0);
  totalSpend += spend;
  const likes = getAction(ad.actions, 'like');
  const thruplay = parseFloat(ad.video_p75_watched_actions?.[0]?.value || 0);
  const videoPlay = parseFloat(ad.video_play_actions?.[0]?.value || 0);
  const cpLike = getCPA(ad.cost_per_action_type, 'like');
  const cpClick = getCPA(ad.cost_per_action_type, 'link_click');

  totalPageLikes += likes;
  totalThruPlays += thruplay;

  if (spend > 0) {
    console.log(`[${ad.ad_name}]`);
    console.log(`  Spend: $${spend.toFixed(0)} | CPM: $${parseFloat(ad.cpm||0).toFixed(0)} | CTR: ${parseFloat(ad.ctr||0).toFixed(2)}% | CPC: $${parseFloat(ad.cpc||0).toFixed(0)}`);
    console.log(`  Clicks: ${ad.clicks} | Reach: ${ad.reach} | Freq: ${parseFloat(ad.frequency||0).toFixed(2)}`);
    if (likes > 0) console.log(`  Page Likes: ${likes} | CPL: $${cpLike.toFixed(0)}`);
    if (videoPlay > 0) console.log(`  Video Plays: ${videoPlay} | P75: ${thruplay}`);
    console.log('');
  }
});

console.log('=== TOTALES DEL DÍA ===');
console.log(`Spend total: $${totalSpend.toFixed(0)}`);
console.log(`FB Page Likes: ${totalPageLikes}`);
console.log(`ThruPlays (P75): ${totalThruPlays}`);
