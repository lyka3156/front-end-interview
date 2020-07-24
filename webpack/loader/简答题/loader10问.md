# 1. loader 面试题

[loader 面试题 1](https://juejin.im/post/5bc1a73df265da0a8d36b74f)

## 1.1 loader 面试 10 问

### 1.1 webpack 默认配置是在哪处理的，loader 有什么默认配置么？

1. webpack 的默认配置放在 [WebpackOptionsDefaulter.js](https://github.com/webpack/webpack/blob/master/lib/WebpackOptionsDefaulter.js) 文件处理的，他会把默认配置和和正常配置合并起来并返回

```js
// 1. lib/webpack.js 入口文件
options = new WebpackOptionsDefaulter().process(options); // 将默认配置和用户的配置整合起来
compiler = new Compiler(options.context);
compiler.options = options;

// 2. WebpackOptionsDefaulter.js
const { applyWebpackOptionsDefaults } = require("./config/defaults"); // webpack的默认配置
const { getNormalizedWebpackOptions } = require("./config/normalization"); // 得到标准化的webpack配置
class WebpackOptionsDefaulter {
  process(options) {
    options = getNormalizedWebpackOptions(options); // 将用户传递的配置封装取得标准化的webpack配置
    applyWebpackOptionsDefaults(options); // 将默认配置和用户传递的配置整合起来
    return options;
  }
}
module.exports = WebpackOptionsDefaulter;
```

2. loader 的默认配置

```js
this.set("module.rules", []);
this.set("module.defaultRules", "make", (options) => [
  {
    type: "javascript/auto",
    resolve: {},
  },
  {
    test: /\.mjs$/i,
    type: "javascript/esm",
    resolve: {
      mainFields:
        options.target === "web" ||
        options.target === "webworker" ||
        options.target === "electron-renderer"
          ? ["browser", "main"]
          : ["main"],
    },
  },
  {
    test: /\.json$/i,
    type: "json",
  },
  {
    test: /\.wasm$/i,
    type: "webassembly/experimental",
  },
]);
```

> 此外值得一提的是，WebpackOptionsDefaulter 继承自 OptionsDefaulter，而 OptionsDefaulter 则是一个封装的配置项存取器，封装了一些特殊的方法来操作配置对象

## 1.2 webpack 中有一个 resolver 的概念，用于解析模块文件的真实绝对路径，那么 loader 和普通模块的 resolver 使用的是同一个么？

不是同一个

- resolver 有两种，分别是 loaderResolver 和 normalResolver。

```js
module.exports = {
  // 解析loader的resolve
  resolveLoader: {
    // 配置loader的查找路劲
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "loader"),
    ],
  },
  // 普通模块的loader
  resolve: {
    // 通过访问别名取查找别名对应的路劲
    alias: {
      "@": path.resolve(__dirname, "../src/"),
    },
    extensions: [".js", ".less"], // 后缀名
  },
};
```

## 1.3 我们知道，除了 config 中的 loader，还可以写 inline 的 loader，那么 inline loader 和 normal config loader 执行的先后顺序是什么？

[Webpack Loader 种类以及执行顺序](https://blog.csdn.net/weixin_30782293/article/details/101471551)

由于除了 config 文件中可以配置 loader 外，还有 inline loader 的写法，因此，对 loader 文件的路径解析也分为两种：inline loader 和 config 文件中的 loader。resolver 钩子中会先处理 inline loader。

所有的 loader 的执行顺序都有两个阶段：pitching 和 normal 阶段，类似于 js 中的事件冒泡、捕获阶段（有人嫌官方的词描述的比较晦涩，修改为 loader 的标记阶段（mark stage）和执行阶段（execution/run stage））。

1. Pitching 阶段： post，inline，normal，pre
2. Normal 阶段：pre，normal，inline，post

那么问题来了，如果我们采用了两种解析 loader 的方式，他们的执行是什么样的呢？答案是 inline loader 优先级高于 config 配置文件中的 loader

webpack 官方文档推荐不使用 inline loader，最好在配置文件中使用 loader（注意：loader 处理的代码中是含有 inline loader 的）。另外，在特殊情况下我们可以在 inline loader 间接改变 loader 的执行顺序（禁止某些另外 3 种 loader），比如在我们的自己公司某个同事的不是很规范的 js 库在引入的时候需要禁止掉 eslint-loader 对其进行处理

1. 加入 ! 前缀禁用配置文件中的普通 loader，比如：require("!raw!./script.coffee")
2. 加入 !! 前缀禁用配置文件中所有的 loader，比如：require("!!raw!./script.coffee")
3. 加入 -! 前缀禁用配置文件中的 pre loader 和普通 loader，但是不包括 post loader，比如：require("!!raw!./script.coffee")

关于 loader 的禁用，webpack 官方的建议是：除非从另一个 loader 处理生成的，一般不建议主动使用

1. pre loader 配置：图片压缩
2. 普通 loader 配置：coffee-script 转换
3. inline loader 配置：bundle loader
4. post loader 配置： 代码覆盖率工具

## 1.4 配置中的 module.rules 在 webpack 中是如何生效与实现的？

webpack 使用 RuleSet 对象来匹配模块所需的 loader。RuleSet 相当于一个规则过滤器，会将 resourcePath 应用于所有的 module.rules 规则，从而筛选出所需的 loader。其中最重要的两个方法是：

- 类静态方法.normalizeRule()
- 实例方法.exec()

webpack 编译会根据用户配置与默认配置，实例化一个 RuleSet。首先，通过其上的静态方法.normalizeRule()将配置值转换为标准化的 test 对象；其上还会存储一个 this.references 属性，是一个 map 类型的存储，key 是 loader 在配置中的类型和位置，例如，ref-2 表示 loader 配置数组中的第三个。

> p.s. 如果你在.compilation 中某个钩子上打印出一些 NormalModule 上 request 相关字段，那些用到 loader 的模块会出现类似 ref-的值。从这里就可以看出一个模块是否使用了 loader，命中了哪个配置规则。

实例化后的 RuleSet 就可以用于为每个模块获取对应的 loader。这个实例化的 RuleSet 就是我们上面提到的 NormalModuleFactory 实例上的 this.ruleSet 属性。工厂每次创建一个新的 NormalModule 时都会调用 RuleSet 实例的.exec()方法，只有当通过了各类测试条件，才会将该 loader push 到结果数组中。

## 1.5 webpack 编译流程中 loader 是如何以及在何时发挥作用的？

loader 是在编译

## 1.6 loader 为什么是自右向左执行的？

## 1.7 如果在某个 pitch 中返回值，具体会发生什么？

## 1.8 如果你写过 loader，那么可能在 loader function 中用到了 this，这里的 this 究竟是什么，是 webpack 实例么？

其实这里的 this 既不是 webpack 实例，也不是 compiler、compilation、normalModule 等这些实例。而是一个叫 loaderContext 的 loader-runner 特有对象。

每次调用 runLoaders()方法时，如果不显式传入 context，则会默认创建一个新的 loaderContext。所以在官网上提到的各种 loader API（callback、data、loaderIndex、addContextDependency 等）都是该对象上的属性。

## 1.9 loader function 中的 this.data 是如何实现的？

知道了 loader 中的 this 其实是一个叫 loaderContext 的对象，那么 this.data 的实现其实就是 loaderContext.data 的实现 [(source code)](https://github.com/webpack/loader-runner/blob/master/lib/LoaderRunner.js#L346-L351)：

```js
Object.defineProperty(loaderContext, "data", {
  enumerable: true,
  get: function () {
    return loaderContext.loaders[loaderContext.loaderIndex].data;
  },
});
```

这里定义了一个.data 的（存）取器。可以看出，调用 this.data 时，不同的 normal loader 由于 loaderIndex 不同，会得到不同的值；而 pitch 方法的形参 data 也是不同的 loader 下的 data [(source code)](https://github.com/webpack/loader-runner/blob/master/lib/LoaderRunner.js#L177)。

```js
runSyncOrAsync(
  fn,
  loaderContext,
  [
    loaderContext.remainingRequest,
    loaderContext.previousRequest,
    (currentLoaderObject.data = {}),
  ],
  function (err) {
    // ……
  }
);
```

## 1.10 如何写一个异步 loader，webpack 又是如何实现 loader 的异步化的？

1. 根据 webpack 文档，当我们调用 this.async()时，会将 loader 变为一个异步的 loader，并返回一个异步回调。

2. webpack 又是如何实现 loader 的异步化的

在具体实现上，runSyncOrAsync()内部有一个 isSync 变量，默认为 true；当我们调用 this.async()时，它会被置为 false，并返回一个 innerCallback 作为异步执行完后的回调通知：

```js
context.async = function async() {
  if (isDone) {
    if (reportedError) return; // ignore
    throw new Error("async(): The callback was already called.");
  }
  isSync = false;
  return innerCallback;
};
```

我们一般都使用 this.async()返回的 callback 来通知异步完成，但实际上，执行 this.callback()也是一样的效果：

```js
var innerCallback = (context.callback = function () {
  // ……
});
```

同时，在 runSyncOrAsync()中，只有 isSync 标识为 true 时，才会在 loader function 执行完毕后立即（同步）回调 callback 来继续 loader-runner。

```js
if (isSync) {
  isDone = true;
  if (result === undefined) return callback();
  if (
    result &&
    typeof result === "object" &&
    typeof result.then === "function"
  ) {
    return result.catch(callback).then(function (r) {
      callback(null, r);
    });
  }
  return callback(null, result);
}
```

看到这里你会发现，代码里有一处会判断返回值是否是 Promise（typeof result.then === "function"），如果是 Promise 则会异步调用 callback。因此，想要获得一个异步的 loader，除了 webpack 文档里提到的 this.async()方法，还可以直接返回一个 Promise。
