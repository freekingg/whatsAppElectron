/* eslint-disable no-template-curly-in-string */

module.exports = {
  pluginOptions: {
    autoRouting: {
      chunkNamePrefix: 'page-',
    },

    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        publish: {
          provider: 'generic',
          url: 'https://cdn.d2.pub/mirrors/d2-projects/electron-vue-template/releases/latest/',
        },
        productName: '站长工具',
        artifactName: '${productName}-${version}.${ext}',
        win: {
          signAndEditExecutable: false,
          target: ['nsis', 'portable'],
          icon: 'icon.png',
        },
        portable: {
          artifactName: '${productName}-portable-${version}.${ext}',
        },
      },
    },
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.transformAssetUrls = {
          img: 'src',
          image: 'xlink:href',
          'a-avatar': 'src',
        }
        return options
      })
  },
}
