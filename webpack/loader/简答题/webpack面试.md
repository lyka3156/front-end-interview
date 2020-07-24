# 1.有哪些常见的 Loader？你用过哪些 Loader？

1. sass-loader: 将 SCSS/SASS 代码转换成 CSS
2. less-loader: 将 LESS 代码转换成 CSS
3. css-loader: 加载 CSS，支持模块化、压缩、文件导入等特性
4. style-loader: 把 CSS 代码注入到 JavaScript 中，通过 DOM 操作去加载 CSS
5. postcss-loader: 扩展 CSS 语法，使用下一代 CSS，可以配合 autoprefixer 插件自动补齐 CSS3 前缀
6. file-loader: 把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件 (处理图片和字体)
7. url-loader: 与 file-loader 类似，区别是用户可以设置一个阈值，大于阈值会交给 file-loader 处理，小于阈值时返回 DataURLs 资源形式编码 (处理图片和字体)
8. image-loader：加载并且压缩图片文件
9. babel-loader： 把 ES 新特性 转换成 ES5
10. eslint-loader: 通过 ESLint 检查 JavaScript 代码
11. tslint-loader：通过 TSLint 检查 TypeScript 代码
12. vue-loader：加载 Vue.js 单文件组件
13. ts-loader: 将 TypeScript 转换成 JavaScript
14. awesome-typescript-loader：将 TypeScript 转换成 JavaScript，性能优于 ts-loader
15. svg-inline-loader：将压缩后的 SVG 内容注入代码中
16. source-map-loader：加载额外的 Source Map 文件，以方便断点调试
17. mocha-loader：加载 Mocha 测试用例的代码
18. i18n-loader: 国际化
19. mocha-loader：加载 Mocha 测试用例的代码
20. coverjs-loader：计算测试的覆盖率
21. raw-loader：加载文件原始内容（utf-8）
22. cache-loader: 可以在一些性能开销较大的 Loader 之前添加，目的是将结果缓存到磁盘里

# 2. 有哪些常见的 Plugin？你用过哪些 Plugin？

1. html-webpack-plugin：简化 HTML 文件创建 (依赖于 html-loader)
2. web-webpack-plugin：可方便地为单页应用输出 HTML，比 html-webpack-plugin 好用 (npm 上一年没维护了)
3. mini-css-extract-plugin: 分离样式文件，CSS 提取为独立文件，支持按需加载 (替代 extract-text-webpack-plugin)
4. clean-webpack-plugin: 目录清理
5. copy-webpack-plugin: 拷贝目录到指定输出目录
6. define-plugin：定义环境变量 (Webpack4 之后指定 mode 会自动配置)
7. uglifyjs-webpack-plugin：不支持 ES6 压缩 (Webpack4 以前) (npm 上一年没维护了)
8. terser-webpack-plugin: 支持压缩 ES6 (Webpack4) (webpack4.0 的 mode 为 production 模式内部会自动开启这个插件)
9. webpack-parallel-uglify-plugin: 多进程执行代码压缩，提升构建速度
10. ignore-plugin：忽略部分文件
11. serviceworker-webpack-plugin：为网页应用增加离线缓存功能
12. ModuleConcatenationPlugin: 开启 Scope Hoisting
13. speed-measure-webpack-plugin: 可以看到每个 Loader 和 Plugin 执行耗时 (整个打包耗时、每个 Plugin 和 Loader 耗时)
14. webpack-bundle-analyzer: 可视化 Webpack 输出文件的体积 (业务组件、依赖第三方模块)

# 3. 说说 Loader 和 Plugin 的区别？

1. 用法上

- Loader 在 module.rules 中配置，作为模块的解析规则，类型为数组。每一项都是一个 Object,内部包含了 test (类型文件)、loader、options (参数)等属性。
- Plugin 在 plugins 中单独配置，类型为数组，每一项是一个 Plugin 的实例，参数都通过构造函数传入。

2. 实现上

- Loader 本质上就是一个函数，他接受一个文件内容的参数进行转换，返回转换后的结果。 因为 Webpack 只认识 JS 模块，所以 Loader 就成了翻译官，对其他的资源文件进行转译的预处理工作。
- Plugin 就是插件，基于事件流框架 Tapable，他可以扩展 Webpack 的功能，在 Webpack 的生命周期中会广播出许多事件，他可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果

# 4.Webpack 构建流程简单说一下

Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

- 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数
- 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译
- 确定入口：根据配置中的 entry 找出所有的入口文件
- 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
- 完成模块编译：在经过第 4 步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
- 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
- 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

简单说

- 初始化：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler
- 编译：从 Entry 出发，针对每个 Module 串行调用对应的 Loader 去翻译文件的内容，再找到该 Module 依赖的 Module，递归地进行编译处理
- 输出：将编译后的 Module 组合成 Chunk，将 Chunk 转换成文件，输出到文件系统中

对源码感兴趣的同学可以移步我的另一篇专栏[从源码窥探 Webpack4.x 原理](https://juejin.im/post/5e1b2f77e51d454d5177a69d)

# 5. 使用 webpack 开发时，你用过哪些可以提高效率的插件？

(这道题还蛮注重实际，用户的体验还是要从小抓起的)

- HotModuleReplacementPlugin：模块热替换
- webpack-merge：提取公共配置，减少重复配置代码
- size-plugin：监控资源体积变化，尽早发现问题 (9 个月前没更新了)
- webpack-dashboard：可以更友好的展示相关打包信息。 (10 个月前没更新了)
- speed-measure-webpack-plugin：简称 SMP，分析出 Webpack 打包过程中 Loader 和 Plugin 的耗时，有助于找到构建过程中的性能瓶颈。
