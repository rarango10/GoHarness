#!/usr/bin/env node
'use strict';

/**
 * Guarda de paridad (L42).
 *
 * Dos reglas del método viven escritas en más de un lugar, y nada comprobaba que dijeran lo
 * mismo:
 *
 *   - «Reglas del harness» del `CLAUDE.md` de este repo  ↔  «Reglas» de `CLAUDE.template.md`.
 *   - La tabla del ciclo del router (`SKILL.md`)         ↔  la tabla del ciclo de la plantilla.
 *
 * Una regla que se arregla en un lado y no en el otro no rompe nada visible: el repo sigue
 * funcionando, el plugin sigue validando, y el proyecto que se siembre mañana nace con la
 * versión vieja. Este script convierte eso en un rojo.
 *
 * No compara prosa palabra por palabra —las dos copias se redactan distinto a propósito, una
 * habla de este repo y la otra del proyecto que se siembra—. Compara el *conjunto de reglas
 * que existen* y el *productor de cada paso del ciclo*.
 *
 * Uso: node plugin/goharness/checks/check-rules-parity.cjs
 * Sale 0 si hay paridad, 1 si no.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const FUENTES = {
  repo: {
    rotulo: 'CLAUDE.md (este repo)',
    archivo: path.join(ROOT, 'CLAUDE.md'),
    seccionReglas: 'Reglas del harness',
  },
  plantilla: {
    rotulo: 'CLAUDE.template.md (harness-init)',
    archivo: path.join(
      ROOT,
      'plugin/goharness/skills/harness-init/assets/CLAUDE.template.md',
    ),
    seccionReglas: 'Reglas',
  },
  router: {
    rotulo: 'SKILL.md (router)',
    archivo: path.join(ROOT, 'plugin/goharness/SKILL.md'),
  },
};

function leer(fuente) {
  if (!fs.existsSync(fuente.archivo)) {
    throw new Error(`No existe ${path.relative(ROOT, fuente.archivo)}`);
  }
  const texto = fs.readFileSync(fuente.archivo, 'utf8');
  // Los comentarios HTML se descartan antes de parsear. La plantilla cierra su sección de reglas
  // con un bloque `<!-- Qué NO va en este archivo -->` que tiene sus propios bullets: son notas
  // para quien edita la plantilla, no reglas del método, y sin esto entran al conjunto y el
  // chequeo reporta tres reglas inexistentes en su primera corrida.
  return texto.replace(/<!--[\s\S]*?-->/g, '');
}

/** Devuelve las líneas de una sección `## <titulo>`, hasta el próximo encabezado del mismo nivel. */
function seccion(texto, titulo) {
  const lineas = texto.split('\n');
  const desde = lineas.findIndex((l) => l.trim() === `## ${titulo}`);
  if (desde === -1) return null;
  const resto = lineas.slice(desde + 1);
  const hasta = resto.findIndex((l) => /^##\s/.test(l));
  return (hasta === -1 ? resto : resto.slice(0, hasta)).join('\n');
}

/**
 * Junta los bullets de primer nivel de una sección en una regla por bullet, con sus líneas de
 * continuación pegadas. Descarta las ranuras de la plantilla (`- <...>`), que son huecos para
 * que los complete el proyecto, no reglas del método.
 */
function bullets(textoSeccion) {
  const reglas = [];
  for (const linea of textoSeccion.split('\n')) {
    if (/^- /.test(linea)) {
      reglas.push(linea.slice(2).trim());
    } else if (reglas.length > 0 && /^\s+\S/.test(linea)) {
      reglas[reglas.length - 1] += ` ${linea.trim()}`;
    } else if (linea.trim() === '') {
      // un renglón en blanco no corta el bullet: puede haber un párrafo adentro
    }
  }
  return reglas.filter((r) => !r.startsWith('<'));
}

/**
 * La identidad de una regla: el texto por el que se decide si dos bullets, escritos distinto en
 * cada archivo, son *la misma regla*.
 *
 * La decisión es esta: **si el bullet arranca con un título en negrita, la clave es ese título y
 * nada más.** Es el nombre de la regla, y es lo que las dos copias mantienen idéntico a
 * propósito; lo que sigue es explicación, y ahí el repo y la plantilla se redactan distinto
 * —«Cada tarea es su propio ciclo de TDD» contra «Once tareas son once ciclos»— sin que eso sea
 * deriva. Comparar el cuerpo daría rojo en cada corrida y el chequeo se volvería ruido que se
 * aprende a ignorar, que es peor que no tenerlo.
 *
 * Si no hay negrita, la clave es el bullet entero. Los tres bullets sin título —«Una feature a la
 * vez», «TDD», «No agregar dependencias»— son una línea corta y completa, sin cuerpo que pueda
 * diferir, así que compararlos enteros no cuesta nada y es más estricto.
 */
function claveDeRegla(bullet) {
  const conNegrita = bullet.match(/^\*\*(.+?)\*\*/s);
  const bruto = conNegrita ? conNegrita[1] : bullet;
  return bruto
    .replace(/`/g, '')          // los backticks son formato, no contenido
    .replace(/\s+/g, ' ')       // el salto de línea del markdown no es una diferencia
    .trim()
    .replace(/[.,;:]+$/, '')    // un punto final de más no es una regla distinta
    .toLowerCase();
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

  // --- Reglas ---
  const textos = {
    repo: leer(FUENTES.repo),
    plantilla: leer(FUENTES.plantilla),
    router: leer(FUENTES.router),
  };

  const reglas = {};
  for (const lado of ['repo', 'plantilla']) {
    const sec = seccion(textos[lado], FUENTES[lado].seccionReglas);
    if (sec === null) {
      errores.push(
        `${FUENTES[lado].rotulo}: no encuentro la sección «${FUENTES[lado].seccionReglas}».`,
      );
      reglas[lado] = new Set();
      continue;
    }
    reglas[lado] = new Set(bullets(sec).map(claveDeRegla));
  }

  const soloRepo = diferenciaDeConjuntos(reglas.repo, reglas.plantilla);
  const soloPlantilla = diferenciaDeConjuntos(reglas.plantilla, reglas.repo);
  for (const r of soloRepo) {
    errores.push(`Regla solo en ${FUENTES.repo.rotulo}, falta en la plantilla:\n    «${r}»`);
  }
  for (const r of soloPlantilla) {
    errores.push(`Regla solo en ${FUENTES.plantilla.rotulo}, falta en el repo:\n    «${r}»`);
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
    console.error('Deriva entre el contrato del repo, la plantilla y el router:\n');
    for (const e of errores) console.error(`  - ${e}`);
    console.error(
      '\nUna regla que se arregla en un lado y no en el otro nace vieja en el próximo proyecto.',
    );
    process.exit(1);
  }

  console.log(
    `Paridad de reglas: sin deriva (${reglas.repo.size} reglas, ${pasos.size} pasos del ciclo).`,
  );
}

main();
