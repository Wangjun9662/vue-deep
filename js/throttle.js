function throttle(fn, delay) {
    let last = +new Date()
    let timer
    return function (...args) {
        const _this = thiw
        const now = +new Date()
        const remaining = delay - (now - last)
        clearTimeout(timer)
        if (remaining <= 0) {
            fn.call(null, ...args)
            last = now
        } else {
            timer = setTimeout(() => {
                fn.call(_this, ...args)
            }, remaining);
        }
    }
}