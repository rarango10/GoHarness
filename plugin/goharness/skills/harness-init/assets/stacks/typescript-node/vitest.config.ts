import { defineConfig } from 'vitest/config'

/**
 * By default Vitest picks up every `**\/*.{test,spec}.ts`, which would include the Playwright specs
 * in `end2end/`. They would run under the wrong runner and the test command would fail for a
 * reason that has nothing to do with the code — and worse: it would fail only once the e2e cycle
 * populates that folder, invalidating verdicts of tasks nobody touched. The two runners coexist by
 * excluding that folder here, from day one.
 */
export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'end2end/**'],
    // Test DOM. If the project has client-side JavaScript with behavior —a click that changes what
    // is shown—, the *effect* criteria need a DOM in step 5: a tested pure function shows the rule
    // is right, not that the click does anything. Default: jsdom (the most faithful to the
    // standards; the one Testing Library assumes). Install it with `npm i -D jsdom`.
    // To enable it for the whole project, uncomment the line below; for a single file,
    // `// @vitest-environment jsdom` on its first line is enough. Without client-side JavaScript,
    // it isn't needed.
    // environment: 'jsdom',
  },
})
