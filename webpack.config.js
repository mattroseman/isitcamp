const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const PROD_ENV = process.env.NODE_ENV === 'production';

const commonConfig = {
  resolve: { extensions: ['*', '.js', '.jsx'] },

  plugins: [
    new MiniCssExtractPlugin(),
    new LoadablePlugin()
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] }
      },
      {
        test: /\.s[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'file-loader'
      }
    ]
  },

  devtool: 'source-map',
}

const clientConfig = {
  entry: path.join(__dirname, 'client/index.js'),
  mode: PROD_ENV ? 'production' : 'development',

  optimization: {
    minimize: PROD_ENV ? true : false
  },

  output: {
    filename: '[name].[chunkhash].bundle.js',
    path: path.resolve(__dirname, 'dist/'),
  }
}

const serverConfig = {
  entry: path.resolve(__dirname, 'server/server.js'),
  mode: PROD_ENV ? 'production' : 'development',
  target: 'node',

  externals: [nodeExternals()],

  optimization: {
    minimize: false
  },

  output: {
    path: path.resolve(__dirname, 'server/dist/'),
    filename: 'server.js'
  },
}

module.exports = [
  Object.assign({}, commonConfig, clientConfig),
  Object.assign({}, commonConfig, serverConfig),
];
