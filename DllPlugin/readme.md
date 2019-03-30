# 使用DllPlugin

标签（空格分隔）： webpack

---

### 什么是Dll

&emsp;windows系统里面，你肯定看到过.dll后缀的文件，这些文件叫做动态链接库，其他模块可以调用此库里面的内容。

&emsp;我们在web项目中的dll也是类似的概念，将web项目依赖的`基础`模块给抽离出来，打包到一个个单独的动态链接库中。并且一个动态链接库可以包含多个基础模块。

&emsp;当需要导入的模块存在于某个动态链接库中，这个模块不能被webpack再次打包，而且直接去动态链接(基础)库中去寻找。


### 为什么需要在web项目中引入这个概念

&emsp;因为大部分基础模块只需要被编译一次，而之后的构建过程中被动态链接库包含的模块不会重新被编译，而是直接只用动态链接库中的代码。

&emsp;由于动态链接库中大多数包含的是我们项目依赖的第三方代码比如 react/react-dom或者 vue/vuex等包，这些包在除了大版本升级之外，不需要在每一次构建的时候都去编译。

&emsp;大白话： 将不常变动的第三方库，单独打包成dll文件，不用每次构建都去编译这些不会变动的文件，提升构建速度。

### 如何使用

&emsp;需要通过两个webpack内置的插件来完成。

&emsp;DllPlugin插件： 在独立的配置文件webpack_dll.config.js中使用，用来打包一个个独立的dll文件。

&emsp;DllReferencePlugin插件： 用于在主要的配置文件（一般是webpack.config.js）中引用DllPlugin插件打包好的动态链接库文件。


言简意赅：

&emsp;1， 首先我们要先用webpack去导入webpack_dll.config.js中的配置，然后根据配置生成动态链接库文件，生成的文件是单独的js文件。

&emsp;2， 然后我们在webpack.config.js配置文件中使用DllReferencePlugin去引入这些第一步生成的动态链接库文件，并且告知webpack不要再去编译这些文件。

tips： 下面这个配置是基于vue-cli创建的webpack模板项目来做，你可以完全根据你自己的结构来做，核心只有上面两点

---

### 第一步，根据wepack_dll.config.js生成dll文件

&emsp;新建好这个配置文件，位置在build目录下，内容如下：
```javascript
const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');

module.exports = {
  // JS 执行入口文件
  entry: {
    // 把 vue 相关的放到一个单独的动态链接库
    vue: ['vue', 'vue-router'],
  },
  output: {
    // 动态链接库的文件名称，[name] 代表当前动态链接库的名称，也就是 entry 中配置的 vue
    filename: '[name].dll.js',
    // 输出的文件都放到 dist 目录下
    path: path.resolve(__dirname, '../dist'),
    // 存放动态链接库的全局变量名称，例如对应 vue 来说就是 _dll_vue
    // 加上 _dll_ 是为了防止全局变量冲突
    library: '_dll_[name]',
  },
  plugins: [
    // 引入 DllPlugin
    new DllPlugin({
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      // 例如 vue.manifest.json 中就有 "name": "_dll_vue"
      name: '_dll_[name]',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(__dirname, '../dist', '[name].manifest.json'),
    }),
  ],
};


```

&emsp;然后执行

```javascript
 npx webpack --config .\build\webpack_dll.config.js
```
&emsp;在根目录 dist下面就会多了vue.dll.js 和 vue.manifest.json文件。

&emsp;vue.manifest.json文件是用来描述动态链接库文件中模块的映射信息【自行打开文件查看】。

###  第二步，在webpack.config.js中使用DllPluginReference引用

&emsp;我们在build的webpack.prod.conf.js中添加：
```javascript
    const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');

```

&emsp;然后 plugins里面添加:
```javascript
    // 告诉 Webpack 使用了哪些动态链接库
    new DllReferencePlugin({
      manifest: require('../dist/vue.manifest.json'),
    }),

```


### 第三步，编译项目然后引入dll文件

`注意`：

&emsp;我们这个例子，使用的是vue-cli创建的项目，在我们编译打包之前，也就是执行`npm run build`之前，要做两件事：

&emsp;1，请将build/webpack.prod.conf.js下面的removeAttributeQuotes设置为false，不然最后在dist目录生成的html文件引入css和js资源的时候没有引号。

&emsp;2，然后将config/index.js里面的build对象的`assetsPublicPath`修改为"./"，不然生成的index.html的资源引入会是src = "/static/xxx"这种形式【这也没有问题】，但是为了方便我们快速在webstorm或者intellij 打开这个文件启动临时web服务，建议这样做。

&emsp;如果你知道如何快速通过nginx启动web服务，也可以不修改上面两个步骤。


&emsp;在vscode中，使用ctrl + k + f 将html格式化一下，然后加上我们之前生成的vue.dll.js文件。

&emsp;最终的结果长这样：

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>webpack-dll-vue</title>
  <link href="./static/css/app.30790115300ab27614ce176899523b62.css" rel="stylesheet">
</head>

<body>
  <div id="app"></div>
  <!-- 手动引入or脚本加入 -->
  <script type="text/javascript" src="./vue.dll.js"></script>
  <script type="text/javascript" src="./static/js/manifest.2ae2e69a05c33dfc65f8.js"></script>
  <script type="text/javascript" src="./static/js/vendor.91c9fd66de1730bb7905.js"></script>
  <script type="text/javascript" src="./static/js/app.49ea5ef6129195015be7.js"></script>
</body>

</html>

```


bingo，这样我们就不必每次去编译不常变动的第三方基础库了！





