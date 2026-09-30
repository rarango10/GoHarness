#!/usr/bin/env node
'use strict';

/**
 * Playwright doctor (L47).
 *
 * `verify-e2e` can't generate or run a test if the project doesn't really have Playwright
 * installed. The real symptom that motivated this: a project with `playwright.config.ts` seeded,
 * the `e2e` script in `package.json`, and yet `@playwright/test` **absent** from
 * `devDependencies` and from `node_modules` — something only noticed on reaching precondition 4,
 * at the end of the whole implementation. The global browser cache (`~/…/ms-playwright`) also
 * disguises the problem: a new project on a machine that already used Playwright for something
 * else looks all set, because the browser is downloaded — it lacks exactly the piece that isn't
 * visible at a glance, the package in the project.
 *
 * This check replaces precondition 4's inspection by eye with something mechanical: same spirit as
 * `check-rules-parity.cjs` (L42) — check a claim instead of trusting that "everything is installed"
 * because the config and the script exist.
 *
 * Usage: node e2e-doctor.cjs [project-path]
 * Exits 0 if both checks pass, 1 if any fails.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PROJECT_DIR = path.resolve(process.argv[2] || process.cwd());

/**
 * First check: the package is declared and **resolves from the project**.
 *
 * Looking at `package.json` isn't enough — `devDependencies` may list something that was never
 * installed (`npm install` wasn't run, or failed halfway). `require.resolve` with `paths` set to
 * the project is the same module resolution the project's code would use, so if this passes, Node
 * really finds the package there — not in a global cache or in another project.
 */
function checkDependency() {
  const pkgPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { ok: false, detail: `${pkgPath} does not exist` };
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const declared =
    pkg.devDependencies?.['@playwright/test'] ?? pkg.dependencies?.['@playwright/test'];
  if (!declared) {
    return {
      ok: false,
      detail: '@playwright/test is neither in devDependencies nor in dependencies.',
      fix: 'npm i -D @playwright/test',
    };
  }
  try {
    require.resolve('@playwright/test', { paths: [PROJECT_DIR] });
  } catch {
    return {
      ok: false,
      detail: `package.json declares @playwright/test@${declared}, but it doesn't resolve from the project's node_modules.`,
      fix: 'npm install',
    };
  }
  return { ok: true, detail: `@playwright/test@${declared}, resolves from the project.` };
}

/**
 * Where Playwright keeps the browsers it downloads. By default it depends on the operating system;
 * `PLAYWRIGHT_BROWSERS_PATH`, if set, wins over the default — it is the same variable Playwright
 * uses, so if someone configured it for this project, the doctor has to look at the same place
 * Playwright will look at when running the tests.
 */
function browsersFolder() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    return process.env.PLAYWRIGHT_BROWSERS_PATH;
  }
  const home = os.homedir();
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Caches', 'ms-playwright');
  if (process.platform === 'win32') return path.join(home, 'AppData', 'Local', 'ms-playwright');
  return path.join(home, '.cache', 'ms-playwright');
}

/**
 * Second check: the browser **this installed version** expects exists on disk.
 *
 * What is NOT enough —and it is the mistake this check exists to avoid—: "is there some chromium
 * in the ms-playwright cache?". That is what disguised the real problem the first time: the cache
 * is global to the machine, survives `npm uninstall` and knows nothing about which version *this*
 * project asks for. Two versions of Playwright can ask for two different Chromium revisions, and
 * only one may be on disk.
 *
 * The piece of data that makes this solvable without guessing: every Playwright installation
 * declares, in `browsers.json` —next to `playwright-core`'s `package.json`—, which revision of each
 * browser it expects. That file can't be requested with
 * `require.resolve('playwright-core/browsers.json')` directly: the package restricts which internal
 * subpaths can be requested that way (its `exports` field), and `browsers.json` isn't one of the
 * allowed ones — confirmed before writing this. The workaround: `playwright-core/package.json` is
 * allowed, and `browsers.json` lives in the same folder.
 */
function checkBrowser() {
  let browsersJson;
  try {
    const pkgJsonPath = require.resolve('playwright-core/package.json', { paths: [PROJECT_DIR] });
    const packageFolder = path.dirname(pkgJsonPath);
    browsersJson = JSON.parse(
      fs.readFileSync(path.join(packageFolder, 'browsers.json'), 'utf8'),
    );
  } catch {
    return {
      ok: false,
      detail: "Couldn't read playwright-core's browsers.json: check that the dependency is installed (see the check above).",
    };
  }

  const chromium = browsersJson.browsers.find((b) => b.name === 'chromium');
  if (!chromium) {
    return { ok: false, detail: 'browsers.json has no entry for chromium.' };
  }

  const folder = browsersFolder();
  const expectedFolder = path.join(folder, `chromium-${chromium.revision}`);
  if (!fs.existsSync(expectedFolder)) {
    return {
      ok: false,
      detail: `This Playwright installation expects chromium-${chromium.revision}, and it isn't in ${folder}.`,
      fix: 'npx playwright install chromium',
    };
  }
  return { ok: true, detail: `chromium-${chromium.revision} is in ${folder}.` };
}

function report(r) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.name}: ${r.detail}`);
  if (!r.ok && r.fix) console.log(`  fix: ${r.fix}`);
  return r.ok;
}

function main() {
  // Each check is reported as soon as it finishes, not at the end: if the first one fails, we still
  // want to see the second — they are two independent questions, and hiding one behind the other
  // costs whoever reads it a whole second attempt to find out about the second problem.
  const dependency = !report({ name: 'Dependency @playwright/test', ...checkDependency() });
  const browser = !report({ name: 'Expected browser on disk', ...checkBrowser() });

  process.exit(dependency || browser ? 1 : 0);
}

main();
