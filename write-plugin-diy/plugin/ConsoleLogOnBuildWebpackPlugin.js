const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  constructor(options) {
    console.log("current plugin option is" + JSON.stringify(options))
  }
  apply(compiler) {
    // compiler 继承自 tapable
    // tapable  提供了多种 hooks  https://github.com/webpack/tapable#hook-types
    // run      是 AsyncSeriesHook 实例
    compiler.hooks.run.tap(pluginName, compilation => {
      console.log('webpack 构建过程开始！');
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin