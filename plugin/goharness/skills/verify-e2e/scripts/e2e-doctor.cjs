#!/usr/bin/env node
'use strict';

/**
 * Doctor de Playwright (L47).
 *
 * `verify-e2e` no puede generar ni correr un test si el proyecto no tiene Playwright de verdad
 * instalado. El síntoma real que motivó esto: un proyecto con `playwright.config.ts` sembrado,
 * el script `e2e` en `package.json`, y sin embargo `@playwright/test` **ausente** de
 * `devDependencies` y de `node_modules` — algo que solo se notó al llegar a la precondición 4,
 * al final de toda la implementación. La caché global de browsers (`~/…/ms-playwright`) además
 * disfraza el problema: un proyecto nuevo en una máquina que ya usó Playwright para otra cosa
 * parece tener todo listo, porque el browser está bajado — le falta justo la pieza que no se ve
 * a simple vista, el paquete en el proyecto.
 *
 * Este chequeo reemplaza la inspección a ojo de la precondición 4 con algo mecánico: mismo
 * espíritu que `check-rules-parity.cjs` (L42) — comprobar una afirmación en vez de confiar en que
 * "está todo instalado" porque el config y el script existen.
 *
 * Uso: node e2e-doctor.cjs [ruta-del-proyecto]
 * Sale 0 si las dos comprobaciones pasan, 1 si alguna falla.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PROJECT_DIR = path.resolve(process.argv[2] || process.cwd());

/**
 * Primera comprobación: el paquete está declarado y **resuelve desde el proyecto**.
 *
 * No alcanza con mirar `package.json` — `devDependencies` puede listar algo que nunca se instaló
 * (`npm install` no se corrió, o falló a mitad de camino). `require.resolve` con `paths` fijado al
 * proyecto es la misma resolución de módulos que usaría el código del proyecto, así que si esto
 * pasa, Node realmente encuentra el paquete ahí — no en una caché global ni en otro proyecto.
 */
function chequearDependencia() {
  const pkgPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { ok: false, detalle: `No existe ${pkgPath}` };
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const declarado =
    pkg.devDependencies?.['@playwright/test'] ?? pkg.dependencies?.['@playwright/test'];
  if (!declarado) {
    return {
      ok: false,
      detalle: '@playwright/test no está en devDependencies ni en dependencies.',
      arreglo: 'npm i -D @playwright/test',
    };
  }
  try {
    require.resolve('@playwright/test', { paths: [PROJECT_DIR] });
  } catch {
    return {
      ok: false,
      detalle: `package.json declara @playwright/test@${declarado}, pero no resuelve desde node_modules del proyecto.`,
      arreglo: 'npm install',
    };
  }
  return { ok: true, detalle: `@playwright/test@${declarado}, resuelve desde el proyecto.` };
}

/**
 * Dónde guarda Playwright los browsers que descarga. Por default depende del sistema operativo;
 * `PLAYWRIGHT_BROWSERS_PATH`, si está seteada, gana sobre el default — es la misma variable que
 * usa Playwright, así que si alguien la configuró para este proyecto, el doctor tiene que mirar
 * el mismo lugar que Playwright va a mirar al correr los tests.
 */
function carpetaDeBrowsers() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    return process.env.PLAYWRIGHT_BROWSERS_PATH;
  }
  const home = os.homedir();
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Caches', 'ms-playwright');
  if (process.platform === 'win32') return path.join(home, 'AppData', 'Local', 'ms-playwright');
  return path.join(home, '.cache', 'ms-playwright');
}

/**
 * Segunda comprobación: el browser que **esta versión instalada** espera existe en disco.
 *
 * Lo que NO alcanza —y es el error que este chequeo existe para evitar—: "¿hay algún chromium en
 * la caché de ms-playwright?". Eso es lo que disfrazó el problema real la primera vez: la caché es
 * global a la máquina, sobrevive a `npm uninstall` y no sabe nada de qué versión pide *este*
 * proyecto. Dos versiones de Playwright pueden pedir dos revisiones de Chromium distintas, y solo
 * una puede estar en disco.
 *
 * El dato que hace esto resoluble sin adivinar: cada instalación de Playwright declara, en
 * `browsers.json` —al lado del `package.json` de `playwright-core`—, qué revisión de cada browser
 * espera. Ese archivo no se puede pedir con `require.resolve('playwright-core/browsers.json')`
 * directo: el paquete restringe qué subrutas internas se pueden pedir así (su campo `exports`), y
 * `browsers.json` no es una de las permitidas — lo confirmé antes de escribir esto. El rodeo:
 * `playwright-core/package.json` sí está permitido, y `browsers.json` vive en la misma carpeta.
 */
function chequearBrowser() {
  let browsersJson;
  try {
    const pkgJsonPath = require.resolve('playwright-core/package.json', { paths: [PROJECT_DIR] });
    const carpetaDelPaquete = path.dirname(pkgJsonPath);
    browsersJson = JSON.parse(
      fs.readFileSync(path.join(carpetaDelPaquete, 'browsers.json'), 'utf8'),
    );
  } catch {
    return {
      ok: false,
      detalle: 'No pude leer browsers.json de playwright-core: revisá que la dependencia esté instalada (ver el chequeo de arriba).',
    };
  }

  const chromium = browsersJson.browsers.find((b) => b.name === 'chromium');
  if (!chromium) {
    return { ok: false, detalle: 'browsers.json no tiene una entrada para chromium.' };
  }

  const carpeta = carpetaDeBrowsers();
  const carpetaEsperada = path.join(carpeta, `chromium-${chromium.revision}`);
  if (!fs.existsSync(carpetaEsperada)) {
    return {
      ok: false,
      detalle: `Esta instalación de Playwright espera chromium-${chromium.revision}, y no está en ${carpeta}.`,
      arreglo: 'npx playwright install chromium',
    };
  }
  return { ok: true, detalle: `chromium-${chromium.revision} está en ${carpeta}.` };
}

function reportar(r) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.nombre}: ${r.detalle}`);
  if (!r.ok && r.arreglo) console.log(`  arreglo: ${r.arreglo}`);
  return r.ok;
}

function main() {
  // Cada chequeo se reporta apenas termina, no al final: si el primero falla, igual queremos ver
  // el segundo — son dos preguntas independientes, y esconder una detrás de la otra le cuesta a
  // quien lee un segundo intento entero para enterarse del segundo problema.
  const dependencia = !reportar({ nombre: 'Dependencia @playwright/test', ...chequearDependencia() });
  const browser = !reportar({ nombre: 'Browser esperado en disco', ...chequearBrowser() });

  process.exit(dependencia || browser ? 1 : 0);
}

main();
