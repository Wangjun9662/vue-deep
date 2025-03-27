### Object、object 和 {}
* {} 等价于 Object
  * 代表广义的对象，包括除了undefined和null的所有类型
* object
  * 狭义的对象：对象、函数和数组

都只能访问内置属性和方法，自定义的属性和方法无法访问。


TS中原始值类型定义都建议使用小写开头的类型
* 大写类型同时包含包装对象和字面量两种情况，小写类型只包含字面量情况，绝大部分使用原始值的时候都是使用字面量
* TS内置的类型都是小写

### any 和 unknown
两者属于ts的顶层类型，是所有其他类型的父类型
* any的问题
  * 任何类型都可以赋值给any，失去了类型校验的意义
  * any可以赋值给任意类型，会污染正常类型

为了解决上述问题，新增了unknown类型
unknown的特点：
  * 任意类型都可以赋值给unknown
  * unknown只能赋值给unknown和any，不能赋给其他值，避免了类型污染
  * 不能直接调用unknown类型的属性和方法，只能进行有限的运算，如比较、取反、typeof和instanceof这几个

如果要将unknown赋值给其他类型怎么办？类型缩小后再赋值

### never 和 void
never：函数不能执行完，没有返回类型，两种情况
  * 函数执行过程中抛错
  * 函数无限循环
void：函数执行完了，但是没有除了null和undefined的返回值


### 类型
#### 原始类型
* string
* number
* boolean
* symbol
* bigint

#### 特殊类型
* undefined
* null

#### 非原始类型
* object

#### 其他
* 值类型：string类型的子类型
* 联合类型
* 交叉类型

### 数组和元组

### 函数类型
定义方式:
function func(x: T): void {}

type MyFunc = {
  (x: T): void
}
const func: MyFunc = () => {}

type MyFunc = (x: T) => void
const func: MyFunc = () => {}


### 对象类型
* 严格字面量检查：如果对象使用字面量表示，会触发 TypeScript 的严格字面量检查。如果字面量的结构跟类型定义的不一样（比如多出了未定义的属性），就会报错。
* 结构类型原则：B满足A的结构特征，即认为B兼容A，B为A的子类型，能用A的地方都能用B
* 最小可选属性原则：如果某个类型的所有属性都是可选的，那么该类型的对象必须至少存在一个可选属性，不能所有可选属性都不存在

### interface
* 继承
  * extends interface
  * extends type
  * extends class
* 合并
  * 同名的interface会合并
* interface 和 type 的区别
  * type可以表示非对象类型
  * interface 支持继承，type可以通过 & 扩展，可以相互扩展
  * 同名interface会合并，type同名会报错
  * interface不能包含属性映射，type可以
  * this关键字只能用于interface
  * type可以扩展原始类型
  * type 可以表达复杂类型， 如联合类型和交叉类型

有复杂类型运算使用typeof，否则优先使用interface。

### 类
* implements
  * implements type
  * implements interface
  * implements class

* Class 类型
  * 代表示例类型，不是class自身的类型
  * 自身类型可以通过 typeof 运算符，或者单独定义一个构造函数类型

* 继承
* private、protected、public
  * private：只有类自身能够使用
  * protected：只有类自身和子类内部能使用，实例不能使用
  * public：都能用

### 泛型
* 写法
  * 函数：function func<T>(x: T): void {}
  * 接口：interface Type<T> { content: T }
  * 类：
    class C<T, U> {
      key: T
      value: U
    }

    interface MyC<T> {
      new (x: T): T
    }
  * 别名：type T<T> = T
* 默认值
  type Type<T = string> = T

* 类型参数的约束条件
  * T extends xxxx
  * 结合默认值：T extends xxxx = string
尽量少用泛型、类型参数越少越好

### 类型断言
A as B
条件：A是B的子类型，或者B是A的子类型，即二者需要类型兼容
* 断言函数
  * asserts a as string

### 模块
* import type 

### declare
* function
* variable
* class
* module/namespace
* global
* enum

### d.ts类型声明文件
* 来源
  * 编译自动生成：tsc --declaration
  * 内置声明文件
  * 外部声明文件
    * 模块自带xxx.d.ts
    * @types/xxx
    * 自己declare
* 模块发布
  * types/typings制定类型声明文件
* ///三斜杠
  * 分拆类型声明文件
    * ///<reference path='' /> 依赖的本地声明文件
    * ///<reference type='' /> @types/xxx声明文件
    * ///<reference lib='' /> 内置声明文件

### 类型运算符
* keyof：对象类型的属性组成的联合类型
  * keyof any => number|string|symbol
  * 用途
    * 去除对象的属性值，精确类型定义
    * 属性映射
* in：遍历联合类型的每个成员类型
* []：取出键值类型，参数是联合类型，取出的也是联合类型，如：type Keys = Obj[keyof Obj]
* extends ... ?: ：条件运算符
* is：函数返回布尔值的时候，可以使用is运算符，限定返回值与参数之间的关系。（类型保护）


### 类型映射
* type ToBoolean<Type> = { [prop in keyof Type]?: boolean }
* 映射重命名：type ToString<Type> = { [prop in keyof Type as `new${prop}`]: string }
* 属性过滤：type ToString<Type> = { [K in keyof T as T[K] extends string ? K : never]: string }

### 类型工具
* Partial<Type>：都变为可选属性
* Records<Keys，Type>：返回一个类型对象，Keys作为减名，Type作为类型，可以是联合键名和类型
* Omit<Type, Keys>：删除指定的Keys，返回新的类型对象
* Pick<Type, Keys>：选出指定的keys，返回新的类型对象
* Exclude<UnionType, Keys>：删除联合类型中指定的Keys，返回新的类型对象
* Extract<Type, Keys>：从联合类型中提取指定Keys，返回新的类型对象