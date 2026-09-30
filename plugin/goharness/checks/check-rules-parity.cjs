#!/usr/bin/env node
'use strict';

/**
 * Parity guard (L42).
 *
 * Two things of the method live written in more than one place, and nothing checked that they
 * said the same:
 *
 *   - The router's rules (`SKILL.md`)          ↔  the "Rules" of `CLAUDE.template.md`.
 *   - The router's cycle table                 ↔  the template's cycle table.
 *
 * A rule fixed on one side and not the other breaks nothing visible: the plugin still validates,
 * and the project seeded tomorrow is born with the old version. This script turns that into a red.
 *
 * **Rules are compared by tag, not by wording.** Every rule carries an invisible comment above it,
 * `<!-- regla: done-means-verified -->`, just like the slots carry `<!-- ranura: … -->`. Before,
 * the identity was the bold title, and that was enough while everything was in one language; once
 * translated, "`hecho` significa verificado" and "`done` means verified" would be two different
 * rules. The tag is never translated.
 *
 * The router summarizes: it has 4 rules and the template 11, and its fourth one joins two of the
 * template's (that is why it carries two tags). So the comparison goes in a single direction: every
 * tag of the router has to exist in the template.
 *
 * And a rule without a tag is a red: otherwise, a new rule written without a mark would stay out of
 * the comparison without anyone noticing.
 *
 * Up to 0.5.2 it also compared the repo's own `CLAUDE.md`, which was the calculator's contract.
 * That file stayed in `GoHarness-es`; the comparison between the English and the Spanish template
 * arrives in phase 4 of the move.
 *
 * Usage: node plugin/goharness/checks/check-rules-parity.cjs
 * Exits 0 if there is parity, 1 if not.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const SOURCES = {
  template: {
    label: 'CLAUDE.template.md (harness-init)',
    file: path.join(ROOT, 'plugin/goharness/skills/harness-init/assets/es/CLAUDE.template.md'),
  },
  router: {
    label: 'SKILL.md (router)',
    file: path.join(ROOT, 'plugin/goharness/SKILL.md'),
  },
};

const TAG = /^<!--\s*regla:\s*([\w-]+)\s*-->$/;

function read(source) {
  if (!fs.existsSync(source.file)) {
    throw new Error(`${path.relative(ROOT, source.file)} does not exist`);
  }
  const text = fs.readFileSync(source.file, 'utf8');
  // HTML comments are dropped before parsing, except the rule tags. The template closes its rules
  // section with a "what does NOT go in this file" comment block that has its own bullets: they
  // are notes for whoever edits the template, not rules of the method.
  return text.replace(/<!--(?!\s*regla:)[\s\S]*?-->/g, '');
}

/**
 * A file's rules, as a list of tags. The list of rules is located by the tags and not by its
 * section's title, so translating the title doesn't make it disappear: it starts at the first tag
 * and ends at the first heading that comes after it.
 *
 * Each top-level item (`- ` or `1. `) is a rule and has to have at least one tag right above it.
 * The `- <...>` items are gaps for the project to fill in, not rules.
 */
function rules(text, label, errors) {
  const lines = text.split('\n');
  const from = lines.findIndex((l) => TAG.test(l.trim()));
  if (from === -1) {
    errors.push(`${label}: it has no \`<!-- regla: … -->\` tag.`);
    return [];
  }
  const tags = [];
  let waiting = [];
  for (const line of lines.slice(from)) {
    if (/^#{1,6}\s/.test(line)) break;
    const m = line.trim().match(TAG);
    if (m) {
      waiting.push(m[1]);
    } else if (/^(- |\d+\. )/.test(line) && !/^- </.test(line)) {
      if (waiting.length === 0) {
        errors.push(`${label}: rule without a tag:\n    "${line.trim().slice(0, 70)}…"`);
      }
      tags.push(...waiting);
      waiting = [];
    }
  }
  if (waiting.length > 0) {
    errors.push(`${label}: tag without a rule below it: ${waiting.join(', ')}.`);
  }
  for (const t of new Set(tags)) {
    if (tags.indexOf(t) !== tags.lastIndexOf(t)) {
      errors.push(`${label}: the tag "${t}" is repeated.`);
    }
  }
  return tags;
}

/** Rows of the cycle table: `| 4 | tasks.md | skill planning-tasks → workflow ... | ... |`. */
function cycleTable(text) {
  const rows = new Map();
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|([^|]*)\|([^|]*)\|/);
    if (!m) continue;
    const step = Number(m[1]);
    // The producer is identified by the names between backticks, not by the prose around them:
    // the router says "skill `specify`, phase 1" and the template could say it another way.
    const producers = [...m[3].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
    rows.set(step, producers.join(' + '));
  }
  return rows;
}

function setDifference(a, b) {
  return [...a].filter((x) => !b.has(x));
}

function main() {
  const errors = [];

  const texts = {
    template: read(SOURCES.template),
    router: read(SOURCES.router),
  };

  // --- Rules ---
  const templateRules = new Set(rules(texts.template, SOURCES.template.label, errors));
  const routerRules = new Set(rules(texts.router, SOURCES.router.label, errors));
  for (const r of setDifference(routerRules, templateRules)) {
    errors.push(`Rule "${r}" of the router is missing from the template.`);
  }

  // --- Cycle table ---
  const routerTable = cycleTable(texts.router);
  const templateTable = cycleTable(texts.template);
  const steps = new Set([...routerTable.keys(), ...templateTable.keys()]);
  for (const step of [...steps].sort((a, b) => a - b)) {
    const inRouter = routerTable.get(step);
    const inTemplate = templateTable.get(step);
    if (inRouter === undefined) {
      errors.push(`Step ${step}: it is in the template and missing from the router.`);
    } else if (inTemplate === undefined) {
      errors.push(`Step ${step}: it is in the router and missing from the template.`);
    } else if (inRouter !== inTemplate) {
      errors.push(
        `Step ${step}: different producers.\n    router:   ${inRouter}\n    template: ${inTemplate}`,
      );
    }
  }

  if (errors.length > 0) {
    console.error('Drift between the template and the router:\n');
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      '\nA rule fixed on one side and not the other is born old in the next project.',
    );
    process.exit(1);
  }

  console.log(
    `Rule parity: no drift (${templateRules.size} rules in the template, ${routerRules.size} tags in the router, ${steps.size} steps in the cycle).`,
  );
}

main();
