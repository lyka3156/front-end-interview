// Mixin 手写实现

var LogMixin = {};
LogMixin.prototype = {
  actionLog: function () {
    console.log("action...");
  },
  requestLog: function () {
    console.log("request...");
  },
};
function User() {
  /*..*/
}
function Goods() {
  /*..*/
}
setMixin(User, LogMixin);
setMixin(Goods, LogMixin);
var user = new User();
var good = new Goods();
user.actionLog();
good.requestLog();

function setMixin(target, mixin) {
  if (!mixin) return;
  // 有第三个参数
  if (arguments[2]) {
    // 1. 遍历将第3个参数开始需要混入的属性赋值到target中
    for (let i = 2; i < arguments.length; i++) {
      target.prototype[arguments[i]] = mixin.prototype[arguments[i]];
    }
  } else {
    // 2. 遍历将mixin的原型对象中的属性添加到target对象的原型对象上
    for (let prop in mixin.prototype) {
      // mixin原型上的属性在target原型上找不到对应的属性
      if (!Object.hasOwnProperty(target.prototype, prop)) {
        target.prototype[prop] = mixin.prototype[prop];
      }
    }
  }
}
