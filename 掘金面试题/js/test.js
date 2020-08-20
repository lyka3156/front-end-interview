let weakMap = new WeakMap();

let obj = {
  name: "张三",
  age: 20,
};
weakMap.set(obj, 200);
obj.age = 100;
console.log(weakMap.get(obj)); // 200
