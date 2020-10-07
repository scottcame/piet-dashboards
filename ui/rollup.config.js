/*
  Copyright 2020 Scott Came Consulting LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
import svelte from 'rollup-plugin-svelte';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from 'rollup-plugin-json';
import css from 'rollup-plugin-css-only'
import autoPreprocess from 'svelte-preprocess';

const production = process.env.DEV !== "true";
const watch = process.env.ROLLUP_WATCH;

const remote = process.env.REMOTE === "true";

console.log("Performing a " + (production ? "production" : "dev") + " build");
if (!production) console.log("Note: dev builds do not include babel transpilation");

export default {

  onwarn(warning, warn) {
    if (
      // ignore these warnings introduced by Vega
      warning.code === 'CIRCULAR_DEPENDENCY' && /node_modules\/(?:vega-.+|d3-.+)/.test(warning.importer) ||
      warning.code === 'THIS_IS_UNDEFINED' && /node_modules\/(?:vega-.+|fast-json-.+)/.test(warning.loc.file)
    ) {
      return;
    }
    warn(warning);
  },

  input: remote ? 'src/index-remote.ts' : 'src/index-local.ts',

  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },

  plugins: [

    json(),
    css(),
    svelte({
      preprocess: autoPreprocess()
    }
    ),
    resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
    commonjs(),
    typescript(),

    // don't transpile in dev mode, as Chrome (our dev browser) handles es6 javascript just fine, and transpiling doubles the rollup bundling time
    production && babel({
      extensions: ['.js', '.svelte', '.ts', '.mjs'],
      include: [
        'src/**', 'node_modules/svelte/**',
        // the following are required for vega / vega-lite, as they utilize es6 features that are not available in IE11 (ugh!)
				'node_modules/fast-json-patch/**', 'node_modules/d3-array/**', 'node_modules/d3-scale/**', 'node_modules/d3-force/**', 'node_modules/d3-delaunay/**', 'node_modules/delaunator/**',
        'node_modules/vega*/**',
        // end vega dependencies
      ],
      babelHelpers: 'runtime',
      presets: [
        [
          "@babel/env",
          {
            targets: {
              ie: '11',
            },
            corejs: 3,
            useBuiltIns: "entry"
          },
        ]
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: false
          }
        ]
      ]
    }),

    // Watch the `public` directory and refresh the browser on changes when not in production
    watch && livereload('public'),

    // If we're building for production (npm run build instead of npm run dev), minify
    production && terser(),

  ],
  watch: {
		clearScreen: false
	}

};
