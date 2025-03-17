function debounce(fn, delay, immediate) {
    let timer = null
    return function(...args) {
        if (timer) {
            clearTimeout(timer)
        }
        const _this = this
        if (!immediate) {
            timer = setTimeout(() => {
                fn.call(_this, ...args)
            }, delay)
        } else {
            let callNow = !timer
            timer = setTimeout(() => {
                timer = null
            }, delay);
            if (callNow) {
                fn.call(_this, ...args)
            }
        }

    }
}