const loaderUtils = require("loader-utils")

module.exports = function (source) {
  //特殊处理换行符和段落换行符，否则 parser error
  const json = JSON.stringify(source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `module.exports = ${json}`;
}