const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'none',
  devtool: 'source-map',

  entry: {
    liek: ['babel-regenerator-runtime', './src/liek.js']
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './[name].js'
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      { from: './src/index.html', to: "./index.html" },
      { from: './src/liek.css', to: "./liek.css" },
      { from: './svg/liek.svg', to: "./liek.svg" }
    ])
  ],

  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    open: true,
    port: 8081,
    compress: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};