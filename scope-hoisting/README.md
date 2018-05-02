>scope hoisting

webpack打包成最后的结果是这样 

```javascript
  (function(modules) {

    // cache module 
    // invoke from entrymodule

  })([
    // entry module
    // modules[0]
    function() {},
    // modules[1]
    function() {}
    // modules[2]
    function() {}
    //...
  ])

```

比如我们entry module也就是函数的第一个参数里面， 引用了第二个module, 而且只有entry module用到了，我们就没有必要将modules[1] 放到参数里面传递进去，让entry module 调用 modules[1],直接将这个函数的定义放到entry module 里面去。

就是去掉冗余的依赖，去掉函数声明语句的代码（webpack加了一些模块化的参数），而且主函数里面也不会去缓存该模块。
创建的函数作用域变少，内存开销变小。

参考webpack.config.js的配置。

如果你不想运行项目，直接对比 result文件夹里面的 after-main 和 before-main 两个js文件，主要是参数的传递，after-main是用了特性之后的打包之后的文件。

但是这个特性 和 tree-shaking 一样 依赖于ES6的静态结构属性.ES6模块化语法是静态的。