#!/usr/bin/env node
'use strict';

/**
 * Guarda de paridad (L42).
 *
 * Dos cosas del método viven escritas en más de un lugar, y nada comprobaba que dijeran lo mismo:
 *
 *   - Las reglas del router (`SKILL.md`)      ↔  las «Reglas» de `CLAUDE.template.md`.
 *   - La tabla del ciclo del router            ↔  la tabla del ciclo de la plantilla.
 *
 * Una regla que se arregla en un lado y no en el otro no rompe nada visible: el plugin sigue
 * validando, y el proyecto que se siembre mañana nace con la versión vieja. Este script convierte
 * eso en un rojo.
 *
 * **Las reglas se comparan por etiqueta, no por redacción.** Cada regla lleva arriba un comentario
 * invisible, `<!-- regla: done-means-verified -->`, igual que los casilleros llevan
 * `<!-- ranura: … -->`. Antes la identidad era el título en negrita, y eso alcanzaba mientras todo
 * estuviera en un idioma; al traducir, «`hecho` significa verificado» y «`done` means verified»
 * serían dos reglas distintas. La etiqueta no se traduce nunca.
 *
 * El router resume: tiene 4 reglas y la plantilla 11, y su cuarta junta dos de la plantilla (por
 * eso lleva dos etiquetas). Así que la comparación va en una sola dirección: toda etiqueta del
 * router tiene que existir en la plantilla.
 *
 * Y una regla sin etiqueta es un rojo: si no, una regla nueva escrita sin marca quedaría afuera de
 * la comparación sin que nadie lo note.
 *
 * Hasta la 0.5.2 comparaba además el `CLAUDE.md` del repo, que era el contrato de la calculadora.
 * Ese archivo se quedó en `GoHarness-es`; la comparación entre la plantilla en inglés y en español
 * llega en la fase 4 de la mudanza.
 *
 * Uso: node plugin/goharness/checks/check-rules-parity.cjs
 * Sale 0 si hay paridad, 1 si no.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const FUENTES = {
  plantilla: {
    rotulo: 'CLAUDE.template.md (harness-init)',
    archivo: path.join(ROOT, 'plugin/goharness/skills/harness-init/assets/CLAUDE.template.md'),
  },
  router: {
    rotulo: 'SKILL.md (router)',
    archivo: path.join(ROOT, 'plugin/goharness/SKILL.md'),
  },
};

const ETIQUETA = /^<!--\s*regla:\s*([\w-]+)\s*-->$/;

function leer(fuente) {
  if (!fs.existsSync(fuente.archivo)) {
    throw new Error(`No existe ${path.relative(ROOT, fuente.archivo)}`);
  }
  const texto = fs.readFileSync(fuente.archivo, 'utf8');
  // Los comentarios HTML se descartan antes de parsear, salvo las etiquetas de regla. La plantilla
  // cierra su sección de reglas con un bloque `<!-- Qué NO va en este archivo -->` que tiene sus
  // propios bullets: son notas para quien edita la plantilla, no reglas del método.
  return texto.replace(/<!--(?!\s*regla:)[\s\S]*?-->/g, '');
}

/**
 * Las reglas de un archivo, como lista de etiquetas. La lista de reglas se ubica por las etiquetas
 * y no por el título de su sección, para que traducir el título no la haga desaparecer: arranca en
 * la primera etiqueta y termina en el primer encabezado que viene después.
 *
 * Cada ítem de primer nivel (`- ` o `1. `) es una regla y tiene que tener al menos una etiqueta
 * justo arriba. Los ítems `- <...>` son huecos para que los complete el proyecto, no reglas.
 */
function reglas(texto, rotulo, errores) {
  const lineas = texto.split('\n');
  const desde = lineas.findIndex((l) => ETIQUETA.test(l.trim()));
  if (desde === -1) {
    errores.push(`${rotulo}: no tiene ninguna etiqueta \`<!-- regla: … -->\`.`);
    return [];
  }
  const etiquetas = [];
  let pendientes = [];
  for (const linea of lineas.slice(desde)) {
    if (/^#{1,6}\s/.test(linea)) break;
    const m = linea.trim().match(ETIQUETA);
    if (m) {
      pendientes.push(m[1]);
    } else if (/^(- |\d+\. )/.test(linea) && !/^- </.test(linea)) {
      if (pendientes.length === 0) {
        errores.push(`${rotulo}: regla sin etiqueta:\n    «${linea.trim().slice(0, 70)}…»`);
      }
      etiquetas.push(...pendientes);
      pendientes = [];
    }
  }
  if (pendientes.length > 0) {
    errores.push(`${rotulo}: etiqueta sin regla debajo: ${pendientes.join(', ')}.`);
  }
  for (const e of new Set(etiquetas)) {
    if (etiquetas.indexOf(e) !== etiquetas.lastIndexOf(e)) {
      errores.push(`${rotulo}: la etiqueta «${e}» está repetida.`);
    }
  }
  return etiquetas;
}

/** Filas de la tabla del ciclo: `| 4 | tasks.md | skill planning-tasks → workflow ... | ... |`. */
function tablaDelCiclo(texto) {
  const filas = new Map();
  for (const linea of texto.split('\n')) {
    const m = linea.match(/^\|\s*(\d+)\s*\|([^|]*)\|([^|]*)\|/);
    if (!m) continue;
    const paso = Number(m[1]);
    // El productor se identifica por los nombres entre backticks, no por la prosa que los rodea:
    // el router dice «skill `specify`, fase 1» y la plantilla podría decirlo de otra forma.
    const productores = [...m[3].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
    filas.set(paso, productores.join(' + '));
  }
  return filas;
}

function diferenciaDeConjuntos(a, b) {
  return [...a].filter((x) => !b.has(x));
}

function main() {
  const errores = [];

  const textos = {
    plantilla: leer(FUENTES.plantilla),
    router: leer(FUENTES.router),
  };

  // --- Reglas ---
  const reglasPlantilla = new Set(reglas(textos.plantilla, FUENTES.plantilla.rotulo, errores));
  const reglasRouter = new Set(reglas(textos.router, FUENTES.router.rotulo, errores));
  for (const r of diferenciaDeConjuntos(reglasRouter, reglasPlantilla)) {
    errores.push(`Regla «${r}» del router, falta en la plantilla.`);
  }

  // --- Tabla del ciclo ---
  const tablaRouter = tablaDelCiclo(textos.router);
  const tablaPlantilla = tablaDelCiclo(textos.plantilla);
  const pasos = new Set([...tablaRouter.keys(), ...tablaPlantilla.keys()]);
  for (const paso of [...pasos].sort((a, b) => a - b)) {
    const enRouter = tablaRouter.get(paso);
    const enPlantilla = tablaPlantilla.get(paso);
    if (enRouter === undefined) {
      errores.push(`Paso ${paso}: está en la plantilla y falta en el router.`);
    } else if (enPlantilla === undefined) {
      errores.push(`Paso ${paso}: está en el router y falta en la plantilla.`);
    } else if (enRouter !== enPlantilla) {
      errores.push(
        `Paso ${paso}: productores distintos.\n    router:    ${enRouter}\n    plantilla: ${enPlantilla}`,
      );
    }
  }

  if (errores.length > 0) {
    console.error('Deriva entre la plantilla y el router:\n');
    for (const e of errores) console.error(`  - ${e}`);
    console.error(
      '\nUna regla que se arregla en un lado y no en el otro nace vieja en el próximo proyecto.',
    );
    process.exit(1);
  }

  console.log(
    `Paridad de reglas: sin deriva (${reglasPlantilla.size} reglas en la plantilla, ${reglasRouter.size} etiquetas en el router, ${pasos.size} pasos del ciclo).`,
  );
}

main();
