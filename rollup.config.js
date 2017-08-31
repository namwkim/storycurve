import css from 'rollup-plugin-css-only';
import resolve from 'rollup-plugin-node-resolve';
export default {
  entry: 'src/StoryCurve.js',
  format: 'umd',
  dest: './dist/bundle.js', // equivalent to --output
  plugins: [
    resolve(),
    css({ output: './dist/bundle.css' })
  ],
  moduleName: 'StoryCurve',
  external:id=>/StoryCurve/.test(id)==false,
  globals:{
    'd3-selection':'d3',
    'd3-shape':'d3',
    'd3-zoom':'d3',
    'd3-axis':'d3',
    'd3-scale':'d3',
    'd3-array':'d3',
    'd3-tip':'d3'
  }

};
