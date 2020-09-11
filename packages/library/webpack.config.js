const path = require('path')
const os = require('os')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const shell = require('shelljs')

// Minify code
const reservedTerms = [
  // Components
  'Component',
  'Dummy',
  'Screen',
  'Form',
  'Frame',
  'Sequence',
  'Loop',
  'Parallel',
  // Plugins
  'Debug',
  'Download',
  'Logger',
  'Metadata',
  'Transmit',
  // Utilities
  'Random',
  'fromObject',
]

module.exports = (env, argv) => {
  const { mode } = argv
  const target = process.env.NODE_ENV || mode

  // Set output file name
  const outputFilename =
    {
      coverage: 'lab.coverage.js',
      development: 'lab.dev.js',
      legacy: 'lab.legacy.js',
    }[target] || 'lab.js'

  const banner = [
    'lab.js -- Building blocks for online experiments',
    '(c) 2015- Felix Henninger',
  ].join('\n')

  const config = {
    entry: {
      js:
        target === 'legacy'
          ? ['whatwg-fetch', './src/index.ts']
          : ['./src/index.ts'],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            { loader: 'cache-loader' },
            // {
            //   loader: 'thread-loader',
            //   options: {
            //     workers: os.cpus().length - 1,
            //     poolTimeout:
            //       process.env.NODE_ENV === 'development' ? Infinity : 500,
            //   },
            // },
            {
              loader: 'ts-loader',
              options: {
                // happyPackMode: true,
              },
            },
          ],
        },
      ],
    },
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    plugins: [
      // new ForkTsCheckerWebpackPlugin({
      //   typescript: {
      //     diagnosticOptions: {
      //       semantic: true,
      //       syntactic: true,
      //     },
      //   },
      // }),
      new LodashModuleReplacementPlugin(),
      new webpack.BannerPlugin({
        banner,
        exclude: ['lab.vendor.js'],
      }),
      new webpack.DefinePlugin({
        BUILD_FLAVOR: JSON.stringify(target),
        BUILD_COMMIT: JSON.stringify(
          shell.exec('git rev-parse HEAD', { silent: true }).trim(),
        ),
      }),
    ],
    output: {
      filename: outputFilename,
      path: path.join(__dirname, '/dist'),
      library: 'lab',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  }

  // Optimize/minimize output
  // by including the corresponding plugins
  if (mode !== 'development') {
    config.optimization = config.optimization || {}
    config.optimization.minimizer = [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          compress: {
            inline: false,
          },
          mangle: {
            reserved: reservedTerms,
          },
        },
      }),
    ]

    if (target === 'analysis') {
      config.plugins.push(new BundleAnalyzerPlugin())
    }
  } else if (target === 'coverage') {
    // Add code coverage instrumentation
    config.module.rules[0].query.plugins.push('istanbul')
  }

  return config
}
