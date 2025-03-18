// 1.本身没有this，this是定义时所处对象的this
// 2.不能作为构造函数，因为new本质上操作的是this
// 3.不能使用arguments对象
// 不能使用yield命令，即不能作为generator函数

// new操作符的实现原理
function myNew(constructor, ...args) {
  const newObj = Object.create(null)
  Object.setPrototypeOf(newObj, constructor.prototype)
  const res = constructor.apply(newObj, args)
  return typeof res === 'object' && res !== null ? res : newObj
}

// 常规函数的this指向问题


// 尾调用 && 尾递归