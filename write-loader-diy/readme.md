### 手写一个loader

#### 为什么需要loader？

&emsp;webpack 实际上只能处理js文件，那么对于除了js文件的其他类型的文件 比如 css sass 等。。我们不能直接用webpack来处理。

&emsp;我们需要一个翻译员（loader）来帮我们的文件处理一下。有时候我们不只需要一个翻译员来工作，比如要把文言文翻译成外语，首先要转换成白话文，然后转换为外语。

&emsp;Loader就像一个翻译员，能将源文件经过转化后输出新的结果，并且一个文件还可以链式的经过多个翻译员翻译。

以scss文件为例：

  &emsp;先将scss源代码交给sass-loader，将scss转换成css;
  &emsp;将sass-loader输出的css提交给css-loader处理，找出css中依赖的资源，压缩css；
  &emsp;将css-loader输出的css提交给style-loader处理，转换成通过脚本加载的javascript代码。

  &emsp;最终的结果一定是javascript代码。

#### 编写loader的原则

&emsp; 职责单一： 一个loader只做一件事情。优点：容易维护且能够链式调用
&emsp; 模块化：
保证输出模块化，loader生成的模块与普通块遵循的相同的设计原则
&emsp; 无状态：
确保loader在不同模块转换之间，不保存状态。每次运行都应该独立于其他编译模块以及相同模块之前的编译结果。

#### 动手写一个基础loader

&emsp;webpack运行在Node上，一个loader其实就是一个node模块，这个模块需要导出一个函数。这个导出的函数输入的就是处理前的原内容，对内容处理之后 然后输出被处理过的内容。

我们现在写一个简单的javascript loader，这个loader的作用就是将js文件内容里面的字符串 like 转换成 ❤ 。

直接上代码，我们将这个loader命名为`k-loader.js`

```
module.exports = function (source) {
  const regExp = new RegExp("like", "ig")
  const result = source.replace(regExp, "❤")
  return result
}
```

怎么调试我们的loader，我们使用官方推荐的一种：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: path.resolve('path/to/loader.js'),
            options: {/* ... */}
          }
        ]
      }
    ]
  }
};
```

&emsp;定义好loader然后找到该loader相对于webpack配置文件的路径即可。
&emsp;我们看k-loader.js 做了什么，获取到source，source就是加载的js文件的文件内容，然后做了一次数据清洗，将like全部转换成❤，然后返回字符串。 完事儿！这就ok了，你可以做一个测试，你会发现js文件里面的like全部被替换成了❤，是不是很简单。。是的。



#### 基础loader上增加一些配置
&emsp;我们一般的loader是有option配置的，就是说用户需要自定义一些功能。
我们把这个like 和 ❤，配置在option里面，这样的话，就可以灵活的使用了，我们只需要改like 和 ❤的值即可。我们使用到了webpack提供的辅助模块`loder-util`,我们通过getOPtions(this)方法可以获取到webpack配置loader的时候传递的option值。
代码长这样：

```javascript
const loaderUtils = require("loader-utils")

module.exports = function (source) {

  const options = loaderUtils.getOptions(this) || {}
  // 假定option只有一个key value
  // 这里应该对option做一次验证。
  const key = Object.keys(options)[0]
  const value = options[key]

  const regExp = new RegExp(key, "ig")
  const result = source.replace(regExp, value)
  return result
}

```

这样我们将options的值配置成`{ like: "❤" }`就会和我们上面的hard code 达到一样的效果，我们将options改成`{like: "love"}`这样就会把所有js文件里面的like替换成love。

到这一步，我们就已经可以自己编写一个loader了。

----



#### 返回多个值
&emsp;我们上面写的loader只是返回了一个值，在一些特殊的场景我们需要用this.callback（）返回多个值。

以用babel-loader转换ES6代码为例，它需要输出转换后的ES5代码对应的SourceMap 以方便调试源码。 为了将Source Map也一起随着ES5代码返回给Webpack，还可以这样写：

```
module.exports = function(source) {
    this.callback(null, source, sourceMaps)
    return; // 当调用 callback() 时总是返回 undefined
}
```
[this.callback](https://www.webpackjs.com/api/loaders/#this-callback) API长下面的样子：
```javascript
this.callback(
  err: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
);

```

#### 同步或异步

loader有同步和异步之分，这时候我们需要使用`this.async()`来获取`callback`函数。

```javascript
module.exports = function(content, map, meta) {
  var callback = this.async();
  someAsyncOperation(content, function(err, result) {
    if (err) return callback(err);
    callback(null, result, map, meta);
  });
};

```

参考：

[编写一个loader](https://www.webpackjs.com/api/loaders/)
[loader-api](https://www.webpackjs.com/api/loaders/)
















