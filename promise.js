const STATE_PENDING = 'pending';
const STATE_FULLFILLED = 'fulfilled';
const STATE_REJECTED = 'rejected';

// let p = new Promise((resolve, reject) => {
//   resolve(123);
//   console.log(2222);
// });
// p.then((res) => {
//   console.log(res);
//   return res;
// }).then((res) => console.log(res));

function CusPromise(callback) {
  this.state = STATE_PENDING;
  this.value = undefined;
  let fulfilledFun = (params) => {
    // console.log('执行完毕');
    this.state = STATE_FULLFILLED;
    this.value = params;
  };

  let rejectFun = (params) => {
    this.state = STATE_REJECTED;
    this.value = params;
  };

  callback(fulfilledFun, rejectFun);

  this.then = function (callback2) {
    let res = callback2(this.value);
    return new CusPromise((resolve) => resolve(res));
  };
}

let p = new CusPromise((resolve, reject) => {
  resolve(123);
  console.log(2222);
});
console.log(p);
p.then((res) => {
  console.log(res);
  return res;
}).then((res) => console.log(res));
