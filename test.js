const arr = [1, 2, 3]
arr.reduce((pre, cur) => {
  return new Promise((resolve) => {
    pre.then(() => {
      setTimeout(() => {
        console.log(cur)
        resolve()
      }, 1000)
    })
  })
}, Promise.resolve())