import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'marqueeInfinite',
    file: 'dist/marquee-infinite.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    commonJS({
      include: 'node_modules/lodash.debounce/*',
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
