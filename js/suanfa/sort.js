const arr = [5, 7, 9, 0, -1, 2, 4, 3, 44, 23, 11]

// 冒泡排序
function bubleSort(arr) {
    const len = arr.length
    let flag = false
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                flag = true
            }
        }
        if (!flag) {
            return arr
        }
    }
    return arr
}

// console.log('冒泡排序：', bubleSort(arr))

function selectSort(arr) {
    const len = arr.length
    let minIndex
    for (let i = 0; i < len - 1; i++) {
        minIndex = i
        for (let j = i; j < len; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j
            }
        }
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
        }
    }
    return arr
}

// console.log('选择排序：', selectSort(arr))

// 插入排序
function insertSort(arr) {
    const len = arr.length
    let temp
    for (let i = 1; i < len; i++) {
        let j = i
        temp = arr[i]
        while (j > 0 && arr[j - 1] > temp) {
            arr[j] = arr[j - 1]
            j--
        }
        arr[j] = temp
    }

    return arr
}

// console.log('插入排序：', insertSort(arr))

// 归并排序
function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr
    }
    const len = arr.length
    const mid = Math.floor(len / 2)

    const leftArr = mergeSort(arr.slice(0, mid))
    const rightArr = mergeSort(arr.slice(mid, len))

    return mergeArr(leftArr, rightArr)
}

function mergeArr(left, right) {
    const len1 = left.length, len2 = right.length
    let i = j = 0
    const res = []
    while (i < len1 && j < len2) {
        if (left[i] > right[j]) {
            res.push(right[j])
            j++
        } else {
            res.push(left[i])
            i++
        }
    }

    while (i < len1) {
        res.push(left[i])
        i++
    }

    while (j < len2) {
        res.push(right[j])
        j++
    }

    return res
}

// console.log('归并排序', mergeSort(arr))

// 快速排序
function quickSort(arr, left = 0, right = arr.length - 1) {
    if (arr.length <= 1) {
        return arr
    }
    
    const lineIndex = partition(arr, left, right)

    if (lineIndex - 1 > left) {
        quickSort(arr, left, lineIndex - 1)
    }

    if (lineIndex < right) {
        quickSort(arr, lineIndex, right)
    }

    return arr
}

function partition(arr, left, right) {
    const mid = Math.floor(left + (right - left) / 2)
    const val = arr[mid]
    let i = left, j = right
    while (i <= j) {
        while(arr[i] < val) {
            i++
        }

        while (arr[j] > val) {
            j--
        }

        if (i <= j) {
            [arr[i], arr[j]] = [arr[j], arr[i]]
            i++
            j--
        } 
    }

    return i
}

console.log('快速排序：', quickSort(arr))