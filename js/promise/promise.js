function MyPromise (exactor) {
    this.status = 'pending'
    this.value = null
    this.reason = null

    this.onResolvedFuncs = []
    this.onRejectedFuncs = []

    const resolve = (value) => {
        if (this.status === 'pending') {
            this.status = 'fulfilled'
            this.value = value
            // 异步结束后，需要resolve，此时逐一执行收集的函数
            this.onResolvedFuncs.forEach(fn => fn())
        }
    }

    const reject = (reason) => {
        if (this.status === 'pending') {
            this.status = 'rejected'
            this.reason = reason
            this.onRejectedFuncs.forEach(fn => fn())
        }
    }

    try {
        exactor(resolve, reject)
    } catch(err) {
        reject(err)
    }
}

MyPromise.prototype.then = function(onResolved, onRejected) {
    onResolved = typeof onResolved === 'function' ? onResolved : (val) => val
    onRejected = typeof onRejected === 'function' ? onRejected : (err) => { throw err }

    // then返回的是一个新的promise
    let promise2 = new MyPromise((resolve, reject) => {
        // 同步的情况
        if (this.status === 'fulfilled') {
            setTimeout(() => {
                try {
                    const x = onResolved(this.value)
                    resolvePromise(promise2, x, resolve, reject)
                } catch(err) {
                    reject(err)
                }
            }, 0)
        }

        if (this.status === 'rejected') {
            setTimeout(() => {
                try {
                    const x = onRejected(this.reason)
                    resolvePromise(promise2, x, resolve, reject)
                } catch(err) {
                    reject(err)
                }
            }, 0);
        }

        // 如果是异步，则状态为pending，收集所有函数
        if (this.status === 'pending') {
            this.onResolvedFuncs.push(() => {
                setTimeout(() => {
                    try {
                        const x = onResolved(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(err) {
                        reject(err)
                    }
                }, 0);
            })

            this.onRejectedFuncs.push(() => {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(err) {
                        reject(err)
                    }
                }, 0);
            })
        }
    })
    return promise2
}

function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject('死循环')
    }

    let called = false
    if (x != null && (typeof x === 'object' || typeof x === 'function')) {
        // promise
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return
                    called = true
                    resolvePromise(promise2, y, resolve, reject)
                }, err => {
                    if (called) return
                    called = true
                    reject(err)
                })
            } else {
                resolve(x)
            }
        } catch(err) {
            if (called) return
            called = true
            reject(err)
        }
    } else {
        // 正常值
        resolve(x)
    }
}

MyPromise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
}
MyPromise.reject = function (reason) {
    return new Promise((resolve, reject) => {
        reject(reason)
    })
}

MyPromise.resolve = function (value) {
    return new Promise((resovle, reject) => {
        resovle(value)
    })
}

MyPromise.all = function (promises) {
    return new MyPromise((resolve, reject) => {
        const result = []
        let count = 0

        promises.forEach((p, idx) => {
            MyPromise.resolve(p).then(res => {
                result[idx] = res
                if (++count === promises.length) {
                    resolve(result)
                }
            }).catch(err => {
                reject(err)
            })
        })
    })
}

MyPromise.allSettled = function(promises) {
    return new MyPromise((resolve, reject) => {
        const result = []
        let count = 0
        promises.forEach((p, idx) => {
            MyPromise.resolve(p).then(res => {
                result[idx] = { status: 'fulfilled', value: res }
            }).catch(err => {
                result[idx] = { status: 'rejected', value: err}
            }).finally(() => {
                count++
                if (count === promises.length) {
                    resolve(result)
                }
            })
        })
        if (promises.length === 0) {
            resolve(result)
        }
    })
}

MyPromise.race = function(promises) {
    return new MyPromise((resolve, reject) => {
        for (let i = 0, len = promises.length; i < len; i++) {
            promises[i].then(resolve, reject)
        }
    })
}

MyPromise.prototype.finally = function (fn) {
    return this.then(value => {
        return MyPromise.resolve(fn()).then(() => value)
    }, reason => {
        return MyPromise.reject(fn()).then(() => { throw reason })
    })
}


const p = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(4)
    }, 1000)
})
p.then((res) => {
    console.log(res)
})
p.then(() => {
    console.log(22222)
})

p.then(() => {
    console.log(33333)
})