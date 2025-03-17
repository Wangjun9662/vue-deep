Function.prototype.myApply = function (thisArg, args) {
    // 默认时window
    thisArg = thisArg || window
    // 将函数绑定到this上执行
    const fn = Symbol('fn')
    thisArg[fn] = this

    const res = thisArg[fn](...args)

    // 别忘了删除
    delete thisArg[fn]

    return res
}