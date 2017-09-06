import css from 'rollup-plugin-css-only';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
export default {
  input: 'src/storycurve.js',
  output: {
      file:'./dist/storycurve.js', // equivalent to --output
      format: 'umd'
  },
  plugins: [
    resolve(),
    css({ output: './dist/storycurve.css' }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  name: 'storycurve',
  external:[
    'd3-selection',
    'd3-shape',
    'd3-zoom',
    'd3-axis',
    'd3-scale',
    'd3-array',
    'd3-tip'

  ],//id=>/storycurve/.test(id)==false || id!='babelHelpers',//do not bundle externals
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
