const webpack = require('webpack')

module.exports = {
  devServer: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    output: {
      filename: 'vue-turntable.js',
      chunkFilename: 'vue-turntable.js'
    }
  },
  chainWebpack: (config) => {
    if(config.plugins.has('extract-css')) {
      const extractCSSPlugin = config.plugin('extract-css')
      extractCSSPlugin && extractCSSPlugin.tap(() => [{
        filename: 'vue-turntable.css',
        chunkFilename: 'vue-turntable.css'
      }])
    }
    if (process.env.NODE_ENV === 'development') {
      config.plugins.delete('preload')
    }
  },
}