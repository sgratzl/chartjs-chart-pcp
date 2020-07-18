// rollup.config.js
import pnp from 'rollup-plugin-pnp-resolve';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import pkg from './package.json';

function startsWith(external) {
  return (e) => {
    return external.includes(e) || external.some((d) => e.startsWith(d + '/'));
  };
}

export default [
  {
    input: 'src/index.umd.js',
    output: {
      file: pkg.main,
      name: 'ChartPCP',
      format: 'umd',
      globals: {
        'chart.js': 'Chart',
      },
    },
    external: Object.keys(pkg.peerDependencies),
    plugins: [
      alias({
        entries: [
          {
            find: /^(@sgratzl\/chartjs-esm-facade)$/,
            replacement: '@sgratzl/chartjs-esm-facade/src/index.umd.js',
          },
        ],
      }),
      commonjs(),
      pnp(),
      resolve(),
      babel({ babelHelpers: 'runtime' }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'esm',
    },
    external: startsWith(Object.keys(pkg.peerDependencies).concat(Object.keys(pkg.dependencies))),
    plugins: [commonjs(), pnp(), resolve()],
  },
];
