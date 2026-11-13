// Builds dist/arborum.js (readable) and dist/arborum.min.js (the file Webflow loads).
//   npm run build        one build
//   npm run watch        rebuild on every save
import * as esbuild from 'esbuild';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/*! Arborum website animations v${version} · https://github.com/spokedesignlabs/arborum-webflow-animations · includes Lenis (MIT) */`;
const common = {
  entryPoints: ['src/index.js'], bundle: true, format: 'iife', target: ['es2020'],
  loader: { '.json': 'json' },
  define: { __VERSION__: JSON.stringify(version) },
  banner: { js: banner }, legalComments: 'none', logLevel: 'info'
};

const builds = [
  { ...common, outfile: 'dist/arborum.js' },
  { ...common, outfile: 'dist/arborum.min.js', minify: true }
];

if (process.argv.includes('--watch')) {
  for (const b of builds) (await esbuild.context(b)).watch();
} else {
  await Promise.all(builds.map(b => esbuild.build(b)));
}
