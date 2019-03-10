const path = require('path')
module.exports = {
  entry: {
    app: './main.js'
  },
  output: {
    path: path.join(__dirname, ""),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: path.resolve('./k-loader.js'),
            options: {
              like: "❤"
            }
          }
        ]
      },
      {
        test: /\.txt$/,
        use: [
          {
            loader: path.resolve('./txt-loader.js'),
            options: {
              like: "don't like"
            }
          }
        ]
      }
    ]
  }
}