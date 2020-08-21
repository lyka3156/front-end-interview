// https://juejin.im/post/6856419501777846279

// 1. 手写 call
let sum = function (a, b) {
  console.log("this", this); // {}
  return a + b;
};

/**
 * 模拟实现call方法
 * context 上下文对象
 * args 参数列表
 */
Function.prototype.myCall = function (context, ...args) {
  // 1. context 存在就使用 context，否则是 window
  // 需要注意的是可能传递的是原始值，所以需要使用Object拿到原始值的封装对象
  context = context ? Object(context) : window;
  // 2. 通过 context.fn 将 this 指向 context
  // 使用symbol当属性名，防止覆盖context上下文对象的属性名，属性值为this，也就是函数
  const fn = Symbol();
  context[fn] = this; // 要执行的函数
  // 3. 执行函数，并拿到结果
  let res = context[fn](...args);
  // 4. 删除属性引用，释放空间
  delete context.fn;
  // 5. 返回函数执行的结果
  return res;
};

// console.log(sum(1, 2)); // this 指向 [Number: 1]
console.log(sum.call(1, 1, 2)); // this 指向 {[Number: 1]}
console.log(sum.myCall(1, 1, 2)); // this 指向 {}

// 2. 手写 apply
/**
 * 模拟实现apply方法
 * context 上下文对象
 * args 参数列表
 */
Function.prototype.myApply = function (context, args) {
  // 1. context 存在就使用 context，否则是 window
  // 需要注意的是可能传递的是原始值，所以需要使用Object拿到原始值的封装对象
  context = context ? Object(context) : window;
  // 2. 通过 context.fn 将 this 指向 context
  // 使用symbol当属性名，防止覆盖context上下文对象的属性名，属性值为this，也就是函数
  const fn = Symbol();
  context[fn] = this; // 要执行的函数
  // 3. 执行函数，并拿到结果
  let res = context[fn](...args);
  // 4. 删除属性引用，释放空间
  delete context.fn;
  // 5. 返回函数执行的结果
  return res;
};
// console.log(sum(1, 2)); // this 指向全局对象
console.log(sum.apply(1, [1, 2])); // this 指向 {}
console.log(sum.myApply(1, [1, 2])); // this 指向 {}
