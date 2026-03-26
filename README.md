# enba-social-assets

Repo separado para servir assets publicos de publicaciones IG/FB de ENBA.

## Objetivo

- hostear renders publicos consumibles por Meta Graph API
- separar media social del repo `enba-web`
- mantener trazabilidad por pieza con manifests JSON

## Estructura

```text
staging/
published/
manifests/
index.html
_headers
_redirects
```

## Dominio sugerido

`social-assets.espacionautico.com.ar`

## Convencion de carpetas

```text
staging/YYYY/MM/<piece-id>/
published/YYYY/MM/<piece-id>/
manifests/<piece-id>.json
```

## Flujo esperado

1. n8n genera renders localmente
2. n8n copia los assets a `staging/...`
3. n8n commitea y pushea este repo
4. Cloudflare Pages publica la URL
5. Meta API consume `staging_url`
6. opcional: luego se promueve a `published/...`

## Nota

V1 puede operar solo con `staging/` + `manifests/`. `published/` queda previsto para una iteracion posterior.
