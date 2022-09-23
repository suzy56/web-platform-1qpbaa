var zs = { name: 'zhangsan' };
var ls = { name: 'lisi' };

// 自定义bind

function calSalary(base, ...bonus) {
  console.log(`${this.name}的薪水是 ${bonus.reduce((c, r) => c + r, base)}`);
}

Function.prototype.bind = function (obj) {
  console.log('这是自定义bind');
  // console.log(arguments[0]);
  var arr1 = Array.prototype.slice.call(arguments, 1);
  // var obj = arguments[0];
  var fun = this;
  return function () {
    var arr2 = arr1.concat(Array.prototype.slice.call(arguments));
    fun.apply(obj, arr2);
  };
};

calSalary.call(zs, 10000, 500);
calSalary.call(zs, 10000, 800, 1000);
var cal2 = calSalary.bind(zs, 10000);
cal2(500, 600);
cal2(540, 600);
cal2(580);
cal2.bind(ls, 888)(); // 无法替换

var hh = {
  name: 'hh',
  fun: function () {
    this.name = 'jj';
    return [];
  },
};

var jj = new hh.fun();

console.log(hh);
console.log(jj);

var gabi = {
  x: 1,
  y: [{ a: 1 }],
  z: { a: { x: 1 } },
};

/**
 * 1.数组 2.对象 3.null 4.正则表达式对象 5.原始数据类型 （依旧不能覆盖全部边界）
 */
function cloneDeep(target) {
  var copy;
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      copy = [];
      for (var key in target) {
        copy[key] = cloneDeep(target[key]);
      }
    } else if (target === null) {
      copy = null;
    } else if (target.constructor === RegExp) {
      copy = target;
    } else {
      copy = {};
      for (var key in target) {
        copy[key] = cloneDeep(target[key]);
      }
    }
  } else {
    copy = target;
  }
  return copy;
}
var gabi2 = cloneDeep(gabi);
gabi2.y[0].a = [];
console.log(gabi2);
console.log(gabi);

// function mother() {
//   var total = 1000;
//   return function (money) {
//     total -= money;
//     console.log('还剩' + total);
//   };
// }

// var pay = mother();

// pay(100);
// pay(200);
// pay(100);
// pay(100);

// for (var a = 0; a < 3; a++) {
//   (function (a) {
//     setTimeout(function () {
//       console.log(a);
//     }, 1000);
//   })(a);
// }

// function f1() {
//   var sum = 0;
//   function f2() {
//     sum++;
//     return f2;
//   }
//   f2.valueOf = function () {
//     return sum;
//   };
//   return f2;
// }

// console.log(+f1());
// console.log(+f1()());
// console.log(+f1()()());

// var add = function (x) {
//   var sum = x;

//   function fun(x) {
//     sum += x;
//     return fun;
//   }

//   fun.toString = function () {
//     return sum;
//   };
//   return fun;
// };

// console.log(add(1)(2)(3)(4));
// alert(add(1)(2)(3)(4));

// 笔试题 1
// var a = 2;
// var obj = {
//   a: 4,
//   fn1: (function () {
//     this.a *= 2; // 外层a * 2 ->4
//     var a = 3;
//     return function () {
//       this.a *= 2; // 未来调用者的 a * 2
//       a *= 3; // 外层函数作用域
//       console.log(a);
//     };
//   })(),
// };
// var fn1 = obj.fn1;
// console.log(a); // 4
// fn1(); // 9
// obj.fn1(); // 27
// console.log(a); // 8
// console.log(obj.a); // 8

// 笔试题 2
// var a = { n: 1 }; // a  -> ox11 -> {n:1}
// var b = a; // b  -> ox11 -> {n:1}
// a.x /*(=ox11)*/ = a = { n: 2 }; // a -> ox12 -> {n: 2}   (b) -> ox11 -> {n: 1 , x -> ox12}   从左向右解析  从右向左执行
// // a.x /*(=ox11)*/ = a; // 循环引用错误
// console.log(a); // {n: 2}
// console.log(b); // {n: 1 , x -> {n:2}}
// a.n = 3;
// console.log(b); // {n: 1 , x -> {n:3}}

// 笔试题 3
// var a = {}; // 0x10  -> {[object Object] -> '123', [object Object]  -> '456'}
// var b = {
//   // 0x11
//   key: 'a',
// };
// var c = {
//   // 0x12
//   key: 'c',
// };

// a[b] = '123';
// a[c] = '456';
// console.log(a[b]); // 456

// 笔试题4
// function Foo() {
//   // new Function Foo -> 0x10  -> {  0x11 (prototype) }
//   Foo.a = function () {
//     console.log(1);
//   };
//   this.a = function () {
//     console.log(2);
//   };
// }

// Foo.prototype.a = function () {
//   //  0x11 (prototype) -> {a -> fun}
//   console.log(3);
// };

// Foo.a = function () {
//   // Foo -> 0x10 -> { 0x11 (prototype) , a -> fun}
//   console.log(4);
// };1

// Foo.a(); // 4

// let obj = new Foo(); // obj ->  {a -> fun}
// obj.a(); // 2
// Foo.a(); // 1

// 笔试题5
// var x = 0;
// var foo = {
//   // new Object 0x10
//   x: 1,
//   bar: function () {
//     console.log(this); // {x:1,bar:fun}  {x:1,bar:fun}
//     var that = this; // that -> 0x10  that -> 0x10
//     return function () {
//       console.log(this.x); // this -> window  0
//       console.log(that.x); // that -> foo   1
//     };
//   },
// };
// foo.bar();
// foo.bar()();

// 笔试题6
// function fun(n, o) {
//   console.log(o);
//   return {
//     //a  闭包 { n: 0}
//     //b  闭包 { n: 0}   闭包 { n: 1}  闭包 { n: 2}  闭包 { n: 3}
//     //b  闭包 { n: 0}   闭包 { n: 1}
//     fun: function (m) {
//       return fun(m, n); // a 1,0 | 2,0 | 3,0   // b 1,0 | 2,1 | 3,2    // c 1,0 | 2,1 | 3,1
//     },
//   };
// }
// var a = fun(0); // undefined
// a.fun(1); // 0
// a.fun(2); // 0
// a.fun(3); // 0
// var b = fun(0).fun(1).fun(2).fun(3); // undefined  0  1  2

// var c = fun(0).fun(1); // undefined  0
// c.fun(2); // 1
// c.fun(3); // 1

// 笔试题7
// function A() {} // new Func A -> 0x10

// function B() {
//   // new Func B -> 0x11
//   return new A();
// }

// A.prototype = new A(); // 0x10 -> { ox12(prototype) -> 0x13{A} }
// B.prototype = new A(); // 0x11 -> { ox18(prototype) -> 0x14{B} 替换  0x15{A}  }
// var a = new A(); // a -> {0x16 A}   ->  ox12
// var b = new B(); // b -> {0x17 A}   ->  ox12
// console.log(a.__proto__ == b.__proto__); // true
// console.log(B.prototype == b.__proto__); // false

// 笔试题8
// function Foo() {
//   getName = function () {
//     // 覆盖
//     console.log(1);
//   };
//   return this;
// }

// Foo.getName = function () {
//   console.log(2);
// };

// Foo.prototype.getName = function () {
//   console.log(3);
// };

// var getName = function () {
//   // 声明提前
//   console.log(4);
// };

// function getName() {
//   // 声明提前
//   console.log(5);
// }

// Foo.getName(); // 2
// getName(); // 4
// Foo().getName(); // 1
// getName(); // 1
// new Foo.getName(); // 2
// new Foo().getName(); // new Foo()    -> xxx.getName  -> 原型找到getName 3
// new new Foo().getName(); //  new [new Foo().getName] ()     ->在调用（） 输出3  -> 返回 new Foo().getName 构造的空对象

// 笔试题9
// (async function () {
//   function sleep(time) {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve();
//       }, time);
//     });
//   }
//   await sleep(1000);
//   console.log(222);
//   await sleep(2000);
//   console.log(111);
//   await sleep(1000);
//   console.log(333);
// })();

// 笔试题10
// function getPersonInfo(one, two, three) {
//   console.log(one);
//   console.log(two);
//   console.log(three);
// }

// const person = 'Lydia';
// const age = 21;

// getPersonInfo`1${person} is ${age} years old`; // 默认第一个参数是模板字符串拆分数组，后续是模板字符串种的参数

// 笔试题11
// const person = {
//   name: 'Lydia Hallie',
//   age: 21,
//   *[Symbol.iterator]() {
//     yield* Object.values(this);
//   },
// };

// // [...person] 实现对象可迭代
// console.log([...person], { ...person });

// 笔试题12 实现一个简单的模板字符串替换
// var template = '{{name}}很厉害，才{{age}}岁';
// var context = { name: 'bottle', age: '15' };

// function render(template, context) {
//   // 思路 正则匹配 {{}} trim去除空格   非贪婪匹配模式
//   return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key]);
// }

// console.log(render(template, context));

// 笔试题13 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组
// var arr = [[1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14]]]], 10];

// console.log(
//   (arr + '')
//     .split(',')
//     .sort((x, y) => x < y)
//     .reduce((pre, cur) => {
//       return pre.indexOf(cur) > -1 ? pre : pre.concat(Number(cur));
//     }, [])
// );

// console.log(
//   [...new Set((arr + '').split(','))].sort((x, y) => x < y).map(Number)
// );

// console.log(Array.from(new Set(arr.flat(Infinity))).sort((a, b) => a - b));

// 笔试题14 如何让实现一个new
// function _new(fn, ...args) {
//   var obj = Object.create(fn.prototype);
//   var res = fn.apply(obj, args); // call
//   return res instanceof Object ? res : obj;
// }

// function person(name, age) {
//   this.name = name;
//   this.age = age;
// }

// console.log(_new(person, 'lisi', 24));

// 笔试题15 使用迭代的方法实现flatter

// const flatter = function (arr) {
//   while (arr.some((item) => Array.isArray(item))) {
//     // 存在数组元素时，结构数组元素
//     console.log(arr);
//     arr = [].concat(...arr);
//   }
//   return arr;
// };

// const flatter = (array) =>
//   array.reduce(
//     (acc, cur) =>
//       Array.isArray(cur) ? [...acc, ...flatter(cur)] : [...acc, cur],
//     []
//   );
// console.log(
//   flatter([
//     1,
//     [1, 2, 2],
//     [3, 4, 5, 5],
//     [6, 7, 8, 9, [11, 12, [12, 13, [14]]]],
//     10,
//   ])
// );
