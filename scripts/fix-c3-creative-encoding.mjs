/**
 * Fix encoding roto en creative C3 Corporativo.
 * El creative original (942857891855079) se subió con curl desde bash
 * y los caracteres con tilde/eñe quedaron como \ufffd (replacement char).
 * Este script crea un creative nuevo con encoding UTF-8 correcto
 * y lo asigna al ad AD_C3_CORP (120239169468780139).
 */

import { execSync } from "child_process";

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) {
  console.error("ERROR: META_ADS_USER_TOKEN no encontrado");
  process.exit(1);
}

const AD_ACCOUNT = "act_2303565156801569";
const AD_ID = "120239169468780139";

const message = [
  "Tu equipo pasa horas en salas de reuniones.",
  "Imaginate lo que puede pasar cuando los sacás a navegar por el Río de la Plata.",
  "En ENBA diseñamos experiencias náuticas corporativas a medida:",
  "team building, eventos de incentivo y jornadas que tu equipo no va a olvidar.",
  "Completá el formulario y te armamos una propuesta.",
].join(" ");

const creative = {
  name: "ENBA_creative_C3_corporativo_v3_utf8fix",
  object_story_spec: JSON.stringify({
    page_id: "1064806400040502",
    link_data: {
      link: "https://espacionautico.com.ar/",
      message,
      name: "Eventos corporativos en velero",
      description:
        "Experiencias náuticas a medida para empresas, desde Costanera Norte.",
      image_hash: "262a830f13da8bddfd33f51c2be4804b",
      call_to_action: {
        type: "LEARN_MORE",
        value: { lead_gen_form_id: "944664581514608" },
      },
    },
  }),
  access_token: TOKEN,
};

// Step 1: crear creative
console.log("Creando creative con encoding UTF-8...");
const createRes = await fetch(
  `https://graph.facebook.com/v21.0/${AD_ACCOUNT}/adcreatives`,
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(creative),
  }
);
const createData = await createRes.json();

if (createData.error) {
  console.error("Error creando creative:", JSON.stringify(createData.error, null, 2));
  process.exit(1);
}

const newCreativeId = createData.id;
console.log(`Creative creado: ${newCreativeId}`);

// Step 2: verificar encoding
const verifyRes = await fetch(
  `https://graph.facebook.com/v21.0/${newCreativeId}?fields=object_story_spec&access_token=${TOKEN}`
);
const verifyData = await verifyRes.json();
const msg = verifyData.object_story_spec?.link_data?.message || "";

if (msg.includes("\ufffd") || msg.includes("�")) {
  console.error("ERROR: encoding sigue roto en el creative nuevo.");
  console.error("Message:", msg);
  process.exit(1);
}

console.log("Encoding verificado OK:");
console.log(msg);

// Step 3: asignar al ad
console.log(`\nAsignando creative ${newCreativeId} al ad ${AD_ID}...`);
const updateRes = await fetch(
  `https://graph.facebook.com/v21.0/${AD_ID}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      creative: JSON.stringify({ creative_id: newCreativeId }),
      access_token: TOKEN,
    }),
  }
);
const updateData = await updateRes.json();

if (updateData.success) {
  console.log("Ad actualizado OK.");
  console.log(`\nCreative anterior (roto): 942857891855079`);
  console.log(`Creative nuevo (fix): ${newCreativeId}`);
} else {
  console.error("Error actualizando ad:", JSON.stringify(updateData, null, 2));
  process.exit(1);
}
