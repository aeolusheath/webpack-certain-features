const webpack = require('webpack')
module.exports = {
  // 入口
  entry: './main.js', 
  // 输出
  output: {
    filename: '[name].js'
  },
  // 如何解析js文件
  resolve: {
    mainFields: ['jsnext:main', 'browser', 'main']
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}