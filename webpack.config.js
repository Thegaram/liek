const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: {
    "liek": ['babel-polyfill', "./app/src/liek.js"],
    "liek.min": ['babel-polyfill', "./app/src/liek.js"],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: "[name].js"
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" }
    ]),
    new MinifyPlugin({}, {
      include: /\.min\.js$/
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.css$/, use: 'css-loader'},
    ]
  },
  // https://github.com/hapijs/joi/issues/665
  node: {
    net: 'empty'
  }
}
