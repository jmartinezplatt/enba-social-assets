#!/usr/bin/env node
/**
 * investigate-g4.mjs — Investigar cómo crear creative para reel "primera vez"
 */
import { execSync } from "node:child_process";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

async function get(endpoint) {
  const url = `${BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}access_token=${TOKEN}`;
  const resp = await fetch(url);
  return resp.json();
}

async function main() {
  // 1. Ver cómo se creó el creative del reel-4horas (que SÍ funciona)
  console.log("=== Creative reel-4horas (funciona) ===");
  const c1 = await get("/950413604375752?fields=object_story_id,object_story_spec,source_instagram_media_id,name,effective_object_story_id");
  console.log(JSON.stringify(c1, null, 2));

  // 2. Ver el reel-4horas-alt
  console.log("\n=== Creative reel-4horas-alt ===");
  const c2 = await get("/1996455587614987?fields=object_story_id,object_story_spec,source_instagram_media_id,name,effective_object_story_id");
  console.log(JSON.stringify(c2, null, 2));

  // 3. Ver posts de la page para encontrar el reel primera vez
  console.log("\n=== Posts recientes de la page ===");
  const posts = await get("/1064806400040502/posts?fields=id,message,created_time,is_instagram_eligible&limit=10");
  console.log(JSON.stringify(posts, null, 2));

  // 4. Ver videos de la page
  console.log("\n=== Videos recientes de la page ===");
  const videos = await get("/1064806400040502/videos?fields=id,title,description,created_time&limit=10");
  console.log(JSON.stringify(videos, null, 2));

  // 5. Probar con el post completo (page_post format)
  console.log("\n=== Buscar post con ID completo ===");
  const post = await get("/1064806400040502_4467029896876277?fields=id,message,is_instagram_eligible,created_time");
  console.log(JSON.stringify(post, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
