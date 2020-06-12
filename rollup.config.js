import typescript from 'rollup-plugin-typescript';
import ts from 'typescript';

const appConfig = {
  input: 'src/main.ts',
  format: 'iife',
  plugins: [
    typescript({
      typescript: ts,
    }),
  ],
  output: {
    file: 'public/app.min.js',
    format: 'iife',
  },
  sourceMap: true,
};

export default [appConfig];
