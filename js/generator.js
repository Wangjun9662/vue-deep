// function* gen1() {
//   console.log('start')
//   yield console.log(1)
//   console.log(10)
//   yield console.log(2)
//   yield console.log(3)
//   console.log(4)
//   return 5
// }

// const ite = gen1()
// console.log(ite.next())
// console.log(ite.next())
// console.log(ite.next())
// console.log(ite.next())

// const obj = {}
// obj[Symbol.iterator] = function* () {
//   yield 1;
//   yield 2;
//   yield 3;
// }
// for (let k of obj) {
//   console.log(k)
// }

// yield的默认返回值是undefined
function* gen2() {
  const a = yield 1
  console.log('a', a)
  return 2
}
const ite = gen2()
ite.next()
ite.next()

// 使用for of 遍历对象
function* objectEntries(obj) {
  const keys = Reflect.ownKeys(obj)
  for (let key of keys) {
    yield [key, obj[key]]
  }
}

const obj = {
  name: 'Jason',
  age: 10
}

for (let [key, value] of objectEntries(obj)) {
  console.log([key, value])
}

// 嵌套数组的平铺
const arr = [1, [2, 3], [4, 5], 6, 7, 8]
function* flatArr(arr) {
  for (let i = 0; i < arr.length; i++) {
    const temp = arr[i]
    if (Array.isArray(temp)) {
      yield* flatArr(temp)
    } else {
      yield temp
    }
  }
}

console.log([...flatArr(arr)])

// 封装异步请求
// function* gen() {
//   const url = 'xxx'
//   const response = yield fetch(url)
//   return response
// }

// const it = gen()
// it.next().then(data => {
//   return data.json()
// }).then(data => {
//   it.next(data)
// })

// Thunk 函数：把函数参数包装成一个函数，将该函数当做参数传递给函数
// js 中的Thunk函数：将多参数函数替换为只接受回调函数的单参数函数
function thunkify(fn) {
  return function(...args) {
    return function(callback) {
      fn.call(null, ...args, callback)
    }
  }
}

function c(val, cb) {
  cb(val)
}

const fn = thunkify(c)
fn(1111)(console.log)

// thunk函数在js中的应用：异步操作thunkify后，可以自动执行generator函数，yield后面必须是thunkify后的函数
// 正常执行
function* gen() {
  const r1 = yield thunkifyReadfile('xxxx')
  console.log(r1)
  const r2 = yield thunkifyReadfile('xxxx')
  console.log(r2)
}

const g = gen()
g.next().value(function (err, data){
  if (err) throw err
  const r = g.next(data)
  r.value(function (err, data){
    if (err) throw err
    g.next(data)
  })
})

// 自动执行（回调函数）
function run(gen) {
  const g = gen()

  function next(err, data) {
    if (err) throw err
    const res = g.next(data)
    if (res.done) return
    res.value(next)
  }

  next()
}

// promise版本(async实现版本)
function spawn(gen) {
  return new Promise((resolve, reject) => {
    const g = gen()

    function step(nextFn) {
      let next
      try {
        next = nextFn()
      } catch(err) {
        reject(err)
      }

      if (next.done) return resolve(next.value)
      Promise.resolve(next.value).then(res => {
        step(function() { g.next(res) })
      }, err => {
        step(function() { g.throw(err) })
      })
    }

    step(function() {return g.next(undefined)})
  })
}