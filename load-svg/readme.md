# webpack 加载svg

标签（空格分隔）： webpack

---

如何在我们的项目中加载svg矢量图？

### 使用file-loader

比如像sketch等工具能够导出svg文件，我们可以在css中的background-image属性引用一个svg矢量图为你教案，也可以在html标签img中使用src源引入。
像这样：

```
    .path-svg {
        background-image: url('./svgs/path/path-svg-1.svg')
    }
```

```
    <img src="./svgs/animation/switch.svg">
```

我们可以像使用图片一样来使用svg，我们可以使用`file-loader`和`url-loader` 处理图片一样来处理svg。

webpack的配置如下：

```javascript

module.exports = {
    module: {
        rules: [
            {
                test: '/\.svg/',
                loader: 'file-loader'
            }
        ]
    }
}


```


### 使用raw-loader
raw-loader是将文本文件的内容按照原样读取出来。

```javascript

import svg from "./svg/animation/switch.svg"

console.log(svg)

module.exports = "<svg xmlns=\"http://www.w3.org/2000\">...</svg>"

```

配置长这样：

```javascript
    module.exports = {
        module: {
            rules: [
                test: /\.svg/,
                loader: 'raw-loader',
                options: {
                    //...
                }
            ]
        }
    }

```

### 更进一步，使用svg-inline-loader

[svg-inline-loader](https://github.com/webpack-contrib/svg-inline-loader)类似与raw-loader只是，它会将我们的svg给格式化，去掉多余的无效的svg冗余代码。

```javascript

module.exports = {
    module: {
      rules: [
        {
          test: /\.svg$/,
          // use: [ 'svg-inline-loader']
          // loader: "svg-inline-loader"
          use: [
            {
                loader: "svg-inline-loader",
                options: {
                    // ...
                }
            },
            // "other-loader-name"
          ]
        }
      ]
    }
}

```








