# Redirecciones (`public/.htaccess`)

Fecha: 2026-11-12 · Fase 4 adelantada, solo lo aprobado. Astro copia `public/.htaccess` a `dist/.htaccess`, así que se despliega junto con el resto. Servidor: LiteSpeed (lee `.htaccess` con sintaxis Apache).

## Política

`https://www.aseguratte.es/…` con barra final en las páginas. Toda redirección es **un solo salto 301** al destino final. Las reglas solo actúan sobre `aseguratte.es` y `www.aseguratte.es`: otros subdominios o hosts que sirva la misma cuenta no se tocan.

## Reglas activas

| Origen | Destino | Motivo | Visitas Plausible (12 m) |
|---|---|---|---|
| `http://…` (cualquier ruta, host `www`) | `https://www.aseguratte.es/<ruta>` | Hoy responde 200 sin HTTPS forzado (C2) | — |
| `https://aseguratte.es/<ruta>` y `http://aseguratte.es/<ruta>` | `https://www.aseguratte.es/<ruta>` | Hoy sirve la web completa sin `www` (C2) | — |
| `/index.html` | `/` | Duplicado con 200 de la home | 93 |
| `/<dir>/index.html` (p. ej. `/cookies/index.html`) | `/<dir>/` | Duplicado con 200 | — |
| `/datacard/oficina.html` | `/datacard/oficina/` | Tarjeta digital (probable QR/NFC): hoy 404 | — |
| `/datacard/lidia.html` | `/datacard/lidia/` | Idem | — |
| `/contacto.html` | `/contacto/` | Equivalente exacto; hoy 404 | — |
| `/politicadeprivacidad.html` | `/politica-privacidad/` | Equivalente exacto; hoy 404 | — |
| `/landings/asistencia.html` | `/asistencia/` | Equivalente exacto; hoy 404 | — |
| `/blog`, `/contacto`… sin barra | `/blog/`, `/contacto/` | Ya lo hace el servidor (301). No se duplica en el archivo | — |

El query string se conserva (`/index.html?a=1` → `/?a=1`). `ErrorDocument 404 /404.html` sirve la página 404 propia con código 404.

## Decisión 5 (2026-11-12): URLs antiguas

Las 5 de arriba redirigen con 301 porque tienen una página equivalente real. Se dejan **en 404 a propósito**:

| URL | Motivo |
|---|---|
| `/contactotrabajo.php` | Era «Trabaja con nosotros»; ya no existe (el enlace del pie está comentado). `/contacto/` no cubre esa intención |
| `/sitemap-xml` | Error de escritura; no hay nada que conservar. Comprobar en Search Console que no esté enviado como sitemap |
| `/blog2/` | Era una página de prueba |

No se redirige nada a la home (Google lo trata como un 404 encubierto). Si los QR de las tarjetas no apuntaban a `.html`, las dos reglas de datacard son inofensivas.

## Cómo se probó

Apache 2.4 local (mismos `mod_rewrite` y `mod_dir`) con el `dist/` real, HTTPS con certificado autofirmado y `Host` simulado. **No se ha probado en LiteSpeed ni en producción.** Resultados: las 3 rutas HTTPS con `www` dan 200; `http://www` y `aseguratte.es` (http y https) dan 301 directo al destino; `/index.html`, `/cookies/index.html` y `/index.html?a=1` dan 301 de un salto; las 5 URLs antiguas dan 301 de un solo salto (también desde `http` y sin `www`); `/contactotrabajo.php` y `/sitemap-xml` siguen en 404; `otro.aseguratte.es` y `localhost` no se redirigen; `/nada-404` devuelve 404 con la página propia.

## Después de desplegar

```bash
curl -sI http://www.aseguratte.es/             # 301 -> https://www.aseguratte.es/
curl -sI https://aseguratte.es/blog/           # 301 -> https://www.aseguratte.es/blog/
curl -sI http://aseguratte.es/index.html       # 301 -> https://www.aseguratte.es/   (un salto)
curl -sI http://aseguratte.es/contacto.html    # 301 -> https://www.aseguratte.es/contacto/  (un salto)
curl -sI https://www.aseguratte.es/datacard/oficina.html  # 301 -> /datacard/oficina/
curl -sI https://www.aseguratte.es/contactotrabajo.php    # 404
curl -sI https://www.aseguratte.es/            # 200
curl -sI https://www.aseguratte.es/robots.txt  # 200 text/plain
curl -sI https://www.aseguratte.es/sitemap-index.xml  # 200 application/xml
```

**Si el sitio entra en bucle de redirecciones** (el navegador dice «demasiadas redirecciones»): significa que HTTPS termina antes de LiteSpeed (proxy o CDN) y `%{HTTPS}` llega vacío. Borra `.htaccess` del servidor y avísame. Hoy no hay indicios de proxy: la respuesta trae `server: LiteSpeed` y `alt-svc: h3` directamente.

Tras desplegar, en Search Console reenvía `sitemap-index.xml` en la propiedad `https://www.aseguratte.es/`.
