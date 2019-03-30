# webpack-dll-vue

> 一个webpack dllplugin的例子

## Build Setup

### 这个项目使用vue-cli生成

只需要关注两个内容

1，config/webpack_dll.config.js

2，config/webpack.prod.conf.js里面关于DllReferencePlugin相关的代码


``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
#编译成功之后，需要手动在dist/index.html引入vue.dll.js文件
npm run build



