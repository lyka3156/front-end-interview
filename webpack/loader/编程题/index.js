let tmp = [
  {
    aa: 1,
  },
  {
    bb: 2,
  },
  {
    aa: 1,
    bb: 2,
    cc: 3,
  },
];
let this1 = {
  xx: {
    aa: 1,
    bb: 2,
    cc: 3,
  },
};
let result1 = tmp
  .filter((val) => (this1.xx.aa !== "" ? val.aa === this1.xx.aa : true))
  .filter((val) => (this1.xx.bb !== "" ? val.bb === this1.xx.bb : true))
  .filter((val) => (this1.xx.cc !== "" ? val.cc === this1.xx.cc : true));
let result2 = tmp.filter(
  (val) =>
    fn(this1.xx.aa, val.aa) &&
    fn(this1.xx.bb, val.bb) &&
    fn(this1.xx.cc, val.cc)
);
function fn(a, b) {
  return a ? a === b : b;
}
console.log(result1);
console.log(result2);

// 我在IE中使用了@babel/preset-env
