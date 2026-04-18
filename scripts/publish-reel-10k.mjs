#!/usr/bin/env node
/**
 * publish-reel-10k.mjs — Publica el reel "4 horas en el río" via resumable upload
 * IG Reel + FB Video
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

const env = {};
fs.readFileSync(".env", "utf-8").split("\n").forEach((l) => {
  if (l.includes("=") && !l.startsWith("#")) {
    const [k, v] = l.trim().split("=");
    env[k] = v;
  }
});

const captions = JSON.parse(
  fs.readFileSync("campaigns/reels/reel-4-horas-en-el-rio/captions.json", "utf-8")
);
const videoPath = path.resolve(
  "campaigns/reels/reel-4-horas-en-el-rio/reel-4-horas-FINAL.mp4"
);
const videoSize = fs.statSync(videoPath).size;
const videoBuffer = fs.readFileSync(videoPath);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getPageToken() {
  const accounts = await (
    await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,access_token&access_token=${TOKEN}`
    )
  ).json();
  return accounts.data.find((a) => a.id === env.META_PAGE_ID).access_token;
}

async function publishIGReel(pageToken) {
  console.log("\n=== IG REEL (resumable upload) ===");

  // Step 1: Init
  console.log("1. Init container...");
  const init = await (
    await fetch(
      `https://graph.facebook.com/v21.0/${env.META_IG_USER_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          upload_type: "resumable",
          caption: captions.captionIg,
          access_token: pageToken,
        }),
      }
    )
  ).json();

  if (init.error) {
    console.log("ERROR init:", init.error.message);
    return null;
  }

  const containerId = init.id;
  const uploadUrl = init.uri;
  console.log("   container_id:", containerId);

  if (!uploadUrl) {
    console.log("ERROR: no upload URL. Response:", JSON.stringify(init));
    return null;
  }

  // Step 2: Upload binary
  console.log("2. Subiendo video (" + (videoSize / 1024 / 1024).toFixed(1) + " MB)...");
  const uploadResp = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: "OAuth " + pageToken,
      offset: "0",
      file_size: String(videoSize),
      "Content-Type": "application/octet-stream",
    },
    body: videoBuffer,
  });
  const uploadData = await uploadResp.json();
  console.log("   upload status:", uploadResp.status, "h:", uploadData.h || "ok");

  // Step 3: Poll
  console.log("3. Esperando procesamiento...");
  let status = "";
  let attempts = 0;
  while (status !== "FINISHED" && attempts < 60) {
    await sleep(3000);
    const check = await (
      await fetch(
        `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${pageToken}`
      )
    ).json();
    status = check.status_code;
    attempts++;
    if (attempts % 5 === 0 || status === "FINISHED" || status === "ERROR") {
      console.log("   attempt " + attempts + ": " + status);
    }
    if (status === "ERROR") {
      console.log("   ERROR:", check.status);
      return null;
    }
  }

  if (status !== "FINISHED") {
    console.log("TIMEOUT");
    return null;
  }

  // Step 4: Publish
  console.log("4. Publicando...");
  const publish = await (
    await fetch(
      `https://graph.facebook.com/v21.0/${env.META_IG_USER_ID}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: pageToken,
        }),
      }
    )
  ).json();

  if (publish.error) {
    console.log("ERROR publish:", publish.error.message);
    return null;
  }

  console.log("   IG REEL PUBLICADO:", publish.id);
  return publish.id;
}

async function publishFBVideo(pageToken) {
  console.log("\n=== FB VIDEO ===");

  // Direct post with file_url won't work (Cloudflare issue).
  // Use simple POST with source (multipart form data)
  console.log("1. Subiendo video a FB Page...");

  const boundary = "----FormBoundary" + Date.now();

  function part(name, value) {
    return `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }

  const parts = [
    Buffer.from(part("access_token", pageToken)),
    Buffer.from(part("description", captions.captionFb)),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="source"; filename="reel-4-horas.mp4"\r\nContent-Type: video/mp4\r\n\r\n`
    ),
    videoBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ];

  const body = Buffer.concat(parts);

  const resp = await fetch(
    `https://graph-video.facebook.com/v21.0/${env.META_PAGE_ID}/videos`,
    {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body,
    }
  );

  const data = await resp.json();
  if (data.error) {
    console.log("ERROR FB:", data.error.message);
    return null;
  }

  console.log("   FB VIDEO PUBLICADO:", data.id);
  return data.id;
}

async function main() {
  console.log("Video:", videoPath);
  console.log("Size:", (videoSize / 1024 / 1024).toFixed(1), "MB");

  const pageToken = await getPageToken();
  console.log("Page token: len=" + pageToken.length);

  const igId = await publishIGReel(pageToken);
  const fbId = await publishFBVideo(pageToken);

  // Save
  const stateFile = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");
  const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
  state.reel_published = {
    ig_post_id: igId,
    fb_post_id: fbId,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  console.log("\nIDs guardados en meta-ids.json");
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
