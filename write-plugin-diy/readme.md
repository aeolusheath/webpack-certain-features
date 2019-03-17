# 手写一个webpack plugin

tag： webpack

---

## 手写一个plugin

### webpack中的plugin这个概念

&emsp;插件是webpack的“支柱”功能，在项目中你肯定使用到了插件系统，比如：

`html-webpack-plugin`以及webpack内置的：`HotModuleReplacementPlugin`  和 `DefinePlugin`

&emsp;我们既然已经有loader了，为什么还需要插件呢，plugin是用来扩展webpack功能，他在构建流程里注入钩子来实现，为webpack带来了很大的灵活性。

&emsp;在webpack运行的声明周期中会广播许多事件，plugin可以监听这些事件，在特定的时刻调用webpack提供的API执行相应的操作。

----


&emsp;当前的项目基于之前的write-loader-diy项目而来，里面有一些loader的配置，我们将这个文件放在plugin目录下面：

```
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  // 构造器参数，用于传递options
  constructor(options) {
    console.log("current plugin option is" + JSON.stringify(options))
  }
  // apply 方法是一个插件所必须的
  apply(compiler) {
    // compiler 继承自 tapable
    // tapable  提供了多种 hooks  https://github.com/webpack/tapable#hook-types
    // run      是 AsyncSeriesHook实例 [tapable提供的多种hooks的一种]
    compiler.hooks.run.tap(pluginName, compilation => {
      console.log('webpack 构建过程开始！');
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin

```
&emsp;webpack 插件是一个具有<font color="skyblue"> apply </font> 方法的 JavaScript 对象。apply 方法会被 <font color="skyblue"> webpack compiler</font> 调用，并且 compiler 对象可在整个编译生命周期访问。


&emsp;然后在webpack.config.js里面增加plugin的配置。

```
var ConsoleLogOnBuildWebpackPlugin = require("./plugin/ConsoleLogOnBuildWebpackPlugin")
// 期待代码略去
//...

module.exports = {
    plugins: [
        new ConsoleLogOnBuildWebpackPlugin({value: "$$"})
    ]
}

```

&emsp;然后我们运行
```
npx webpack
```
&emsp;就能在console中看到打印的日志信息了。

## compiler

&emsp;但是这个compiler是什么呢。。

&emsp;这个compiler扩展自[tapable](https://github.com/webpack/tapable#hook-types)类，这个类暴露了多种hooks钩子，这些钩子可以让我们在编写plugin的时候使用到；不仅如此， 它也包含了webpack的options，loaders，plugins等信息，全局唯一。

&emsp;所以这一句：`compiler.hooks.run.tap` 的`compiler.hoos`是拿到了所有的钩子，`.run`是去拿到了一个特定的钩子`AsyncSeriesHook`实例，从tapable的文档可以看出，这只是其中的一个。最后调用的tap方法是继承自`interface Hook`。

&emsp;[源码](https://github.com/webpack/webpack/blob/master/lib/Compiler.js)看这里：

```
class Compiler extends Tapable {
	constructor(context) {
		super();
		this.hooks = {
			/** @type {SyncBailHook<Compilation>} */
			shouldEmit: new SyncBailHook(["compilation"]),
			/** @type {AsyncSeriesHook<Stats>} */
			done: new AsyncSeriesHook(["stats"]),
			/** @type {AsyncSeriesHook<>} */
			additionalPass: new AsyncSeriesHook([]),
			/** @type {AsyncSeriesHook<Compiler>} */
			beforeRun: new AsyncSeriesHook(["compiler"]),
			/** @type {AsyncSeriesHook<Compiler>} */
			run: new AsyncSeriesHook(["compiler"]),
			/** @type {AsyncSeriesHook<Compilation>} */
			emit: new AsyncSeriesHook(["compilation"]),
			/** @type {AsyncSeriesHook<Compilation>} */
			afterEmit: new AsyncSeriesHook(["compilation"])
			//....
```


&emsp;我们上面的hooks.run实际上调用的是异步钩子，我们可以用其他异步的方式去将hook钩入到compiler实例上。

```
compiler.hooks.run.tapAsync('MyPlugin', (source, target, routesList, callback) => {
  console.log('以异步方式触及 run 钩子。');
  callback();
});

compiler.hooks.run.tapPromise('MyPlugin', (source, target, routesList) => {
  return new Promise(resolve => setTimeout(resolve, 10000)).then(() => {
    console.log('以具有延迟的异步方式触及 run 钩子。');
  });
});

compiler.hooks.run.tapPromise('MyPlugin', async (source, target, routesList) => {
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('以具有延迟的异步方式触及 run 钩子。');
});

```

分别将这三种方式替换掉 run.tap然后查看效果吧！

## compilation

&emsp;同样的compilation钩子也是继承自Tapable，那么它也具有compiler的同样的方法和特性。Compilation 模块会被 Compiler 用来创建新的编译（或新的构建）。Compiler可以理解为整个webpack生命周期都存在的编译[构建]对象，但是Compliation只代表着某一次的编译[构建]对象。

&emsp;compilation对象包含了当前的模块资源，编译生成资源，变化的文件等。在开发模式下，当检测到一个文件变化，就有一个compilation被创建。compilation对象也提供了很多回调供plugin进行扩展，也可以通过compilation获取到compiler对象。

&emsp;我们来编写一个插件，来记录最终打包生成的文件列表:

```
class FileListPlugin {
  apply(compiler) {
    // emit 是异步 hook，使用 tapAsync 触及它，还可以使用 tapPromise/tap(同步)
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      // 在生成文件中，创建一个头部字符串：
      var filelist = 'In this build:\n\n';

      // 遍历所有编译过的资源文件，
      // 对于每个文件名称，都添加一行内容。
      for (var filename in compilation.assets) {
        filelist += '- ' + filename + '\n';
      }

      // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
      compilation.assets['filelist.md'] = {
        source: function() {
          return filelist;
        },
        size: function() {
          return filelist.length;
        }
      };

      callback();
    });
  }
}

module.exports = FileListPlugin;
```


----

## advanced

[自定义钩子函数](https://webpack.docschina.org/api/plugins/#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%9A%84%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0-custom-hooks-)


-----


参考：
https://webpack.docschina.org/api/plugins/
https://webpack.docschina.org/api/compiler-hooks/#watchrun








