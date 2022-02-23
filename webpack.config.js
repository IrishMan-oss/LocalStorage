const path = require('path');

module.exports = {
    devtool: 'source-map',
    watch: true,
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module:{
        rules: [
        {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
            presets: [
                ['@babel/preset-env', { targets: "defaults" }]
            ]
            }
        }
        }
        ]   
}   
};