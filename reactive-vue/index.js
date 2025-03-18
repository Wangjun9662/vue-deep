const data = {
  text: 'Hello World'
}

// 代理data
const bucket = new WeakMap()

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    // 先修改原值，再trigger
    target[key] = value
    trigger(target, key, value)
    return true
  }
})

const textNode = document.createElement('div')
document.body.appendChild(textNode)


// 副作用函数
const fn = () => {
  textNode.textContent = obj.text
}

let activeEffect = null
const effectStack = []
// 注册副作用函数
// options:
//   scheduler: 调度器
//   lazy: 懒执行
const effect = (fn, options = {}) => {
  // 不能直接修改副作用函数,通过一个函数进行包装
  // fn.deps = []
  const effectFn = () => {
    // 执行之前需要清除依赖，避免有分支时候的冗余副作用执行，执行后会重新收集依赖
    // 想要清除的话，需要知道副作用函数被哪些deps收集了
    cleanup(effectFn)
    activeEffect = effectFn
    // 将副作用函数压入栈中，嵌套情况下可以获取正确的effectFn
    effectStack.push(effectFn)
    // 计算属性可以返回值
    const res = fn()
    // 副作用函数执行完毕后，恢复activeEffect
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.deps = []
  effectFn.options = options
  if (options.lazy) {
    return effectFn
  }
  effectFn()
}

// 通用case
effect(fn)
setTimeout(() => {
  obj.text = 'Hello Vue'
}, 1000)

setTimeout(() => {
  obj.text = 'Hello Vue3'
}, 2000)

// 调度器case1
// effect(() => {
//   console.log(obj.text)
// }, {
//   scheduler: (fn) => {
//     setTimeout(fn, 1000)
//   }
// })

// obj.text = 'Hello Vue'
// console.log('end')

// 调度器case2
// const jobQueue = new Set()
// let isFlushing = false
// const p = Promise.resolve()
// function flushJob() {
//   if (isFlushing) return
//   isFlushing = true
//   p.then(() => {
//     jobQueue.forEach(job => job())
//     isFlushing = false
//   })
// }
// effect(() => {
//   console.log(obj.text)
// }, {
//   scheduler: (fn) => {
//     jobQueue.add(fn)
//     flushJob()
//   }
// })

// obj.text = 'Hello Vue'
// obj.text = 'Hello Vue222'
// console.log('end')

// computed case
const val = computed(() => {
  return obj.text
})

console.log(val.value)

function computed(getter) {
  // 第一次执行的值保存起来
  let value
  // 缓存标志
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true
        // 计算属性嵌套在effect中时，计算属性依赖的变化不会trigger外层的effect，此处手动
        trigger(obj, 'value')
      }
    }
  })
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        // 第一次执行完后，缓存标志置为false
        // 依赖值发生变化时再置为true
        // 在何处修改缓存标志呢？
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }
  return obj
}

// watch case
const watchVal = watch(() => {
  return obj.text
}, (newVal, oldVal) => {
  console.log(newVal, oldVal)
}, { immediate: true })

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let cleanup
  function onCleanup(fn) {
    if (!cleanup) {
      cleanup = fn
    }
  }

  function job() {
    newValue = effectFn()
    if (cleanup) {
      cleanup()
    }
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }

  let oldValue, newValue
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: job
  })
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

// 递归遍历对象，收集依赖
function traverse(source, set = new Set()) {
  if (typeof source !== 'object' || source === null || set.has(source)) {
    return
  }
  set.add(source)
  for(let key in source) {
    traverse(source[key], set)
  }
  return source
}

function track(target, key) {
  // console.log('track')
  // 这样写会堆栈溢出
  // if (!activeEffect) return target[key]
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  // console.log('trigger')
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  if (!effects) return
  // 为了避免set的无限循环，新创建一个set遍历执行
  const effectsToRun = new Set()
  // obj.num++这种副作用函数（相当于obj.num = obj.num + 1）
  // 会产生无限递归，副作用函数执行过程中会同时收集依赖并再次执行（执行自己）
  effects.forEach(fn => {
    if (fn !== activeEffect) {
      effectsToRun.add(fn)
    }
  })
  effectsToRun.forEach(effect => {
    if(effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}

function cleanup(fn) {
  const deps = fn.deps
  for (let i = 0, len = deps.length; i < len; i++) {
    const dep = deps[i]
    if (dep.has(fn)) {
      dep.delete(fn)
    }
  }
  deps.length = 0
}