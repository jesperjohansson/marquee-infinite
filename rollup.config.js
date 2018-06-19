import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: {
    name: 'marqueeInfinite',
    file: pkg.main,
    format: 'cjs',
  },
  plugins: [
    resolve(),
    commonJS({
      namedExports: {
        sourceMap: false,
        exclude: 'node_modules/**',
        include: ['node_modules/lodash.debounce/debounce'],
      },
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
