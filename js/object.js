console.log(Object.is(NaN, NaN))

Object.defineProperty(Object, 'myIs', {
  configurable: true,
  enumerable: false,
  writable: true,
  value: function(x, y) {
    if (x === y) {
      // -0 和 +0的时候返回false
      return x !== 0 || 1 / x === 1 / y
    }

    // 都是NaN的时候应该返回true
    return x !== x && y !== y
  }
})