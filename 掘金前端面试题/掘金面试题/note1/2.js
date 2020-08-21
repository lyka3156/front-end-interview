//
//
//
///
//
//
//

// 实现数组的 flat 方法             node的10版本没有flat
if (!Array.prototype.flat) {
  Object.defineProperty(Array.prototype, "flat", {
    value: function (depth) {
      let res = [],
        depthArg = depth || 1,
        depthNum = 0,
        flatMap = (arr) => {
          arr.map((element, index, array) => {
            if (
              Object.prototype.toString.call(element).slice(8, -1) === "Array"
            ) {
              if (depthNum < depthArg) {
                depthNum++;
                flatMap(element);
              } else {
                res.push(element);
              }
            } else {
              res.push(element);
              if (index === array.length - 1) depthNum = 0;
            }
          });
        };
      flatMap(this);
      return res;
    },
  });
}
const log = console.log;

// 延迟执行 Promise 的 resolve 方法
const delay = (ms) =>
  new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });

//
const subFlow = createFlow([
  () => {
    delay(1000).then(() => log("c"));
  },
]);

createFlow([
  () => log("a"),
  () => log("b"),
  subFlow,
  [() => delay(1000).then(() => log("d")), () => log("e")],
]).run(() => {
  console.log("done");
});

// 需要按照 a,b,延迟1秒,c,延迟1秒,d,e, done 的顺序打印

// 步骤分析
// 1. 参数形式
// 1.1 普通函数：                   () => log("a");
// 1.2 延迟函数（Promise）：        () => delay(1000).then(() => log("d"));
// 1.3 另一个 flow：                const subFlow = createFlow([() => delay(1000).then(() => log("c"))]);
// 1.4 用数组包裹的上述三项。

// 2. 观察题意，createFlow 并不会让方法开始执行，需要 .run() 之后才会开始执行，所以先定义好这个函数：

// 按照上面的测试用例，实现 createFlow：
function createFlow(effects = []) {
  if (!Array.isArray(effects)) return; // 不是数组直接返回
  // 先把参数浅拷贝一份（编写库函数，尽量不要影响用户传入的参数是个原则），再简单的扁平化 flat 一下。
  let sources = effects.slice().flat();
  //   console.log(effects, sources);
  // 2 执行 run 方法才会开始执行 createFlow 方法
  function run(callback) {
    // 这里选择用 while 循环依次处理数组中的每个 effect，便于随时中断。
    while (sources.length) {
      // 拿到每一个任务，并移除此项任务
      const task = sources.shift();
      // 把callback放到下一个flow的callback时机里执行
      const next = () => createFlow(sources).run(callback);
      // 如果是函数直接执行
      if (typeof task === "function") {
        const res = task(); // 拿到执行结果
        // 如果是 promise
        if (res && res.then) {
          res.then(next); // 执行 promise 的 then 方法
          return;
        }
      } else if (task.isFlow) {
        // 如果是 createFlow 函数调用run方法执行
        task.run(next);
        return;
      }
    }
    // 在所有任务执行完毕后 执行run方法传入的回调函数
    callback && callback();
  }

  // 返回一个对象，有一个 run 方法
  return {
    run,
    isFlow: true,
  };
}
