module.exports = {
  devServer: {
    host: '0.0.0.0',
    public: '0.0.0.0:8080',
    disableHostCheck: true
  },
  chainWebpack: config => {
    config.module
      .rule('worker')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .end();
  }
};
