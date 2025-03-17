Function.prototype.call = function (thisArg, ...args) {
    thisArg = thisArg || window

    const fn = Symbol('fn')
    thisArg[fn] = this

    const res = thisArg[fn](...args)

    delete thisArg[fn]

    return res
}