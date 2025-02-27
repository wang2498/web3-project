// foo(typeof a);
// function foo(p) {
//   console.log(this);
//   console.log(p);
//   console.log(typeof b);
//   let b = 0;
// }

Function.prototype.myBind = function (bindThis, ...args) {
  if (typeof this !== 'function') {
    throw new Error('Error');
  }
  const prototypeFunc = function () {};

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let self = this;
  const returnFunc = function () {
    return self.apply(this instanceof prototypeFunc ? self : bindThis, args.concat(Array.from(arguments)));
  };
  prototypeFunc.prototype = this.prototype;
  returnFunc.prototype = new prototypeFunc();
  return returnFunc;
};


const obj = {
  fn1: () => console.log(this),
  fn2: function () {
    console.log(this);
  },
};

obj.fn1();
obj.fn2();

// const x = new obj.fn1();
// const y = new obj.fn2();
