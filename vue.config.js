const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // ... 其他已有配置 ...
  
  configureWebpack: {
    // ... 已有配置 ...
    
    // 生产环境排除stagewise包
    ...(process.env.NODE_ENV !== 'development' ? {
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules[\\/]@stagewise/
          }
        ]
      }
    } : {})
  },
  
  chainWebpack: config => {
    // ... 已有配置 ...
    
    // 确保生产环境不包含stagewise
    if (process.env.NODE_ENV !== 'development') {
      config.module
        .rule('js')
        .exclude
        .add(/node_modules[\\/]@stagewise/)
        .end()
    }
  }
}) 