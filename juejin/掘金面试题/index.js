// 1. 从一道面试题说起：GET 请求能传图片吗？                note1/note1-1     (https://juejin.im/post/6860253625030017031)

// 2. 一道价值 25k 的蚂蚁金服异步串行面试题                  note1/note1-2     (https://juejin.im/post/6860646761392930830)
function createFlow(effects = []) {
  let sources = effects.slice().flat();
  function run(callback) {
    while (sources.length) {
      const task = sources.shift();
      // 把callback放到下一个flow的callback时机里执行
      const next = () => createFlow(sources).run(callback);
      if (typeof task === "function") {
        const res = task();
        if (res && res.then) {
          res.then(next);
          return;
        }
      } else if (task && task.isFlow) {
        task.run(next);
        return;
      }
    }
    callback && callback();
  }
  return {
    run,
    isFlow: true,
  };
}
const delay = () => new Promise((resolve) => setTimeout(resolve, 1000));
createFlow([
  () => console.log("a"),
  () => console.log("b"),
  createFlow([() => console.log("c")]),
  [() => delay().then(() => console.log("d")), () => console.log("e")],
]).run();
