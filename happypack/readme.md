# 使用happypack/thread-loader加速构建

标签： webpack

---


### 为什么需要happypack/thread loader


&emsp;webpack需要处理的文件是非常多的，构建过程是一个涉及大量文件读写的过程。项目复杂起来了，文件数量变多之后，webpack构建就会特别满，而且运行在nodeJS上的webpack是单线程模型的，也就是说Webpack一个时刻只能处理一个任务，不能同时处理多个任务。

 &emsp;文件读写和计算操作是无法避免的，那能不能让Webpack在同一时刻处理多个任务发挥多核CPU电脑的功能，以提升构建速度呢？

### happypack


 &emsp;[HappyPack](https://github.com/amireh/happypack#how-it-works)就能让Webpack做到这一点，它将任务分解给多个子进程去并发执行，子进程处理完后再将结果发给主进程。


 happypack的用法：

```javascript
// @file: webpack.config.js
const HappyPack = require('happypack');

exports.module = {
  rules: [
    {
      test: /.js$/,
      // 1) replace your original list of loaders with "happypack/loader":
      // loaders: [ 'babel-loader?presets[]=es2015' ],
      use: ['happypack/loader'?id=babel], // 这里的id 就是定义在plugin里面HappyPack实例构造参数传入的id
      include: [ /* ... */ ],
      exclude: [ /* ... */ ]
    }
  ]
};

exports.plugins = [
  // 2) create the plugin:
  new HappyPack({
    // 3) re-add the loaders you replaced above in #1:
    loaders: [ 'babel-loader?presets[]=es2015' ],
    id: 'babel'
  })
];
```

&emsp;创建HappyPack实例除了id/loaders【注意，一些loader的API，happypack并不支持,[看这里](https://github.com/amireh/happypack/wiki/Webpack-Loader-API-Support)】还有其他参数，我们列举相对重要的几个参数：

threads:

&emsp;代表开启几个子进程去编译源文件【执行当前的任务】，默认是3。

threaPool：

&emsp;代表进程共享池，多个HappyPack实例去使用同一个进程共享池中的子进程去处理任务，防止资源占用太多。

&emsp;代码长这样：

```
// @file: webpack.config.js
const HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 5 });

exports.module = {
  rules: [
    {
      test: /.js$/,
      // 1) replace your original list of loaders with "happypack/loader":
      // loaders: [ 'babel-loader?presets[]=es2015' ],
      use: ['happypack/loader'?id=babel], // 这里的id 就是定义在plugin里面HappyPack实例构造参数传入的id
      include: [ /* ... */ ],
      exclude: [ /* ... */ ]
    },
    {
      test: /\.less$/,
      use: 'happypack/loader?id=styles'
    },
  ]
};

exports.plugins = [
  // 2) create the plugin:
  new HappyPack({
    // 3) re-add the loaders you replaced above in #1:
    loaders: [ 'babel-loader?presets[]=es2015' ],
    threadPool: happyThreadPool,
    id: 'babel'
  }),
  new HappyPack({
    id: 'styles',
    threadPool: happyThreadPool,
    loaders: [ 'style-loader', 'css-loader', 'less-loader' ]
  })
];

```

&emsp;实际上我们做的工作就是将所有需要通过loader处理的文件，都先交给hapypack，它我们做了一个工作的调度。调度器的逻辑是在主进程中，也就是运行着webpack的node进程中。它将子任务分配给当前空闲的子进程，子进程处理完毕之后将结果返给核心调度器，它们之间的数据传输是通过进程间的通信API来实现的。

----

### thread loader

&emsp;但是webpack4 官方提供了一个[thread loader](https://github.com/amireh/happypack#how-it-works)


&emsp;把这个 loader 放置在其他 loader 之前， 放置在这个 loader 之后的 loader 就会在一个单独的 worker【worker pool】 池里运行，一个worker 就是一个nodeJS 进程【node.js proces】，每个单独进程处理时间上限为600ms，各个进程的数据交换也会限制在这个时间内。

&emsp;配置长这样：

```javascript

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve("src"),
        use: [
          "thread-loader",
          // your expensive loader (e.g babel-loader)
        ]
      }
    ]
  }
}

```


 &emsp;带有option的配置:


```
use: [
  {
    loader: "thread-loader",
    // loaders with equal options will share worker pools
    // 设置同样option的loaders会共享
    options: {
      // worker的数量，默认是cpu核心数
      workers: 2,

      // 一个worker并行的job数量，默认为20
      workerParallelJobs: 50,

      // 添加额外的node js 参数
      workerNodeArgs: ['--max-old-space-size=1024'],


      // 允许重新生成一个dead work pool
      // 这个过程会降低整体编译速度
      // 开发环境应该设置为false
      poolRespawn: false,


      //空闲多少秒后，干掉work 进程
      // 默认是500ms
      // 当处于监听模式下，可以设置为无限大，让worker一直存在
      poolTimeout: 2000,

      // number of jobs the poll distributes to the workers
      // defaults to 200
      // decrease of less efficient but more fair distribution
      // worker
      // pool 分配给workder的job数量
      // 默认是200
      // 设置的越低效率会更低，但是job分布会更均匀
      poolParallelJobs: 50,

      // name of the pool
      // can be used to create different pools with elsewise identical options
      // pool 的名字
      //
      name: "my-pool"
    }
  },
  // your expensive loader (e.g babel-loader)
]
```
