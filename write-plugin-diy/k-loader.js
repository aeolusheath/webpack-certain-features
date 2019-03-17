// 这个js-loader的作用是将传递进来的option 的匹配到的key 全部替换成value
// webpack 当前配置的是将like 切换成 ❤
const loaderUtils = require("loader-utils")

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  // 假定只能有一个option选项
  const key = Object.keys(options)[0]
  const value = options[key]

  const regExp = new RegExp(key, "ig")
  const result = source.replace(regExp, value)
  return result
}