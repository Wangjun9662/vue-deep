// 实现函数的链式调用
function pipe(value) {
  const funcStack = []
  const oproxy = new Proxy({}, {
    get(proxyObj, fnName) {
      if (fnName === 'run') {
        return funcStack.reduce((pre, fn) => {
          return obj[fn](pre)
        }, value)
      }
      funcStack.push(fnName)
      return oproxy
    }
  })
  return oproxy
}
var double = val => val * 2
var pow = val => val * val
var rev = val => val.toString().split('').reverse().join('')

const obj = {
  double,
  pow,
  rev
}

const res = pipe(3).double.pow.rev.run
console.log('res:::', res)