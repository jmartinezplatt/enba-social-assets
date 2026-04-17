#!/usr/bin/env node
/**
 * migrate-env-to-windows.mjs
 *
 * Mueve META_PAGE_ACCESS_TOKEN y META_APP_SECRET del .env
 * a Windows User scope. Cero llamadas a Meta.
 *
 * - Lee .env
 * - Escribe a Windows User como META_ADS_USER_TOKEN y META_APP_SECRET
 * - Borra las líneas del .env
 * - Imprime solo fingerprint + len (no el valor)
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ENV_PATH = path.resolve(".env");

function fingerprint(val) {
  if (!val || val.length < 16) return `len=${val?.length ?? 0}`;
  return `start="${val.slice(0, 8)}" end="${val.slice(-8)}" len=${val.length}`;
}

function setWinUserVar(name, value) {
  // Usamos execFile-style para evitar inyección y logging del valor
  // Escribimos el valor a un archivo temporal y lo leemos desde PowerShell
  const tmpFile = path.resolve(".token-tmp");
  fs.writeFileSync(tmpFile, value, { encoding: "utf-8" });
  try {
    execSync(
      `powershell -Command "[System.Environment]::SetEnvironmentVariable('${name}', [System.IO.File]::ReadAllText('${tmpFile}').Trim(), 'User')"`,
      { stdio: "ignore" }
    );
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function getWinUserVar(name) {
  try {
    const out = execSync(
      `powershell -Command "[System.Environment]::GetEnvironmentVariable('${name}','User')"`,
      { encoding: "utf-8" }
    );
    return out.trim();
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════

if (!fs.existsSync(ENV_PATH)) {
  console.error(".env no existe");
  process.exit(1);
}

const envRaw = fs.readFileSync(ENV_PATH, "utf-8");
const lines = envRaw.split("\n");

const parsed = {};
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  parsed[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
}

console.log("═══ Migrate .env → Windows User ═══\n");

// ──────────────────────────────────────────────────
// Token principal: META_PAGE_ACCESS_TOKEN → META_ADS_USER_TOKEN
// ──────────────────────────────────────────────────

const token = parsed.META_PAGE_ACCESS_TOKEN;
if (!token) {
  console.log("META_PAGE_ACCESS_TOKEN no encontrado en .env — skip");
} else {
  console.log(`[token] leído de .env: ${fingerprint(token)}`);
  setWinUserVar("META_ADS_USER_TOKEN", token);
  const verify = getWinUserVar("META_ADS_USER_TOKEN");
  if (verify === token) {
    console.log(`[token] escrito a Windows User como META_ADS_USER_TOKEN`);
    console.log(`[token] verificación OK: ${fingerprint(verify)}`);
  } else {
    console.error(`[token] FALLO en verificación — abortando`);
    process.exit(1);
  }
}

// ──────────────────────────────────────────────────
// App Secret: META_APP_SECRET → Windows (si no está ya)
// ──────────────────────────────────────────────────

const appSecret = parsed.META_APP_SECRET;
const existingWin = getWinUserVar("META_APP_SECRET");

if (!appSecret) {
  console.log(`\n[app_secret] no en .env — skip`);
} else if (existingWin === appSecret) {
  console.log(`\n[app_secret] ya presente en Windows User (mismo valor) — solo borrar de .env`);
} else if (existingWin) {
  console.log(`\n[app_secret] Windows User tiene un valor distinto — NO sobrescribo, borro solo de .env`);
} else {
  console.log(`\n[app_secret] leído de .env: ${fingerprint(appSecret)}`);
  setWinUserVar("META_APP_SECRET", appSecret);
  console.log(`[app_secret] escrito a Windows User como META_APP_SECRET`);
}

// ──────────────────────────────────────────────────
// Limpiar .env: quitar líneas de secrets
// ──────────────────────────────────────────────────

const newLines = lines.filter((line) => {
  const t = line.trim();
  if (t.startsWith("META_PAGE_ACCESS_TOKEN=")) return false;
  if (t.startsWith("META_APP_SECRET=")) return false;
  return true;
});

// Agregar comentario aclaratorio al tope si no existe
const header = `# Secrets (tokens, app secret) viven en Windows User scope.\n# Leer con powershell [System.Environment]::GetEnvironmentVariable(..., 'User')\n# Este .env solo contiene IDs públicos.\n`;

const hasHeader = newLines.slice(0, 3).some((l) => l.includes("Windows User scope"));
const finalContent = (hasHeader ? "" : header) + newLines.join("\n").trim() + "\n";

fs.writeFileSync(ENV_PATH, finalContent, { encoding: "utf-8" });

console.log(`\n═══ .env limpio ═══`);
console.log(finalContent);
console.log(`\nDone. Próximo paso: actualizar scripts para leer de Windows User.`);
