### 低代码平台
#### 项目概述
一站式中后台系统开发解决方案，可以通过平台进行应用的可视化搭建、部署和管理，提升中后台系统的整体运营和交付效率。
愿景：解放中后台产品建设的生产力，解放业务运营的生产力。

中后台系统的特点：
1. 重复性研发工作。不同的业务有重复性的研发工作。
2. 堆人力的现状。没有呈现应有的规模效应，维护人力随着系统和页面数量等比增长。
3. 度量运营不统一。中后台系统是业务运营效率的关键，缺少技术/业务指标体系的度量和运营能力。

#### 个人职责
负责模板、自定义物料和页面块三个模块的设计、开发和运营（对客），负责渲染器的开发和迭代（基建）。

模板：抽象业务高频场景的业务模板，满足用户快速搭建页面的需求。
自定义物料：提供定制业务物料的功能，满足通用物料不足以覆盖业务需求场景下的建设需求。
页面块：提供复杂页面的拆分功能（组件化），提升页面的搭建和维护效率。
渲染器：低代码平台的核心功能之一，将JSON转为页面元素并渲染。

#### 项目难点
模板：
1. 权衡取舍。在通用模板设计过程中，如何在不丢失通用性的情况下，更贴近业务的定制化诉求。如果是尽可能多的堆砌常用功能，那么用户在此基础上的修改就会很费劲。如果过于简单，则无法有效提效。可配置模板，引导用户选择功能，动态生成所需模板。
2. 模板识别。堆人力快速识别。
3. 技术实现。
  * 架构设计。模板的开发、托管、版本管理、维护的整体技术方案设计，采用包的形式统一管理组件、模板及其他相关资源。
    物料包的设计：物料的版本体系，可以回滚、灰度等，提升稳定性。
      * 一个项目一个包。所有页面共用，升级问题。
      * 一个页面一个包。跟大版本绑定，可以更精细的控制。
  * 服务端接口。node实现相关接口。
  * 实时mock。模板中表格、列表等所需展示数据，实时mock。调用mock平台公共接口，根据用户配置实时生成mock接口和数据。

自定义物料：
1. 使用体验的保障。将源码物料转化为低代码物料或者开发低代码物料，存在比较高的成本。如何将成本降低，保障使用体验？主要成本点：
  * 源码开发（转化）。安装cli，初始化模板，开发组件。
  * 协议配置和调试。为组件配置在低代码平台上使用需要的描述协议（相较于源码开发，成本最高的地方），并在低代码平台上调试。
  提供轻量易用的cli，避免繁琐的接入环节，开箱即用，内置丰富的命令，便于快速创建、删除、调试、构建、发布和托管组件。
  可视化协议配置和实时调试，协议自动初始化。
2. 技术实现。
  * cli设计与开发。新建链路中，快速完成环境资源准备，低成本开发、调试、构建和发布组件。
  * 自动化导入用户组件库npm包，自动完成资源的导入和协议的初始化。
  * 协议实时调试。本地开发是线上调试，或者直接线上调试。本地启动服务提供js和css资源，页面根据query参数，在使用本地调试的情况下，加载本地资源进行调试。本地资源注入到调试页面中（调试页面的判断：query参数）
3. 跨团队合作。

cli实现采用commander库，核心流程：
创建：判断npm包是否已经存在 -> 创建组件仓库 -> 添加仓库权限 -> 添加分支权限 -> 下载模板（node的spawn方法执行shell脚本克隆组件仓库）-> 从npm上下载模板压缩包并解压到缓存目录下 -> 将解压后的文件拷贝到仓库目录下 -> 初始化模板：根据用户配置修改模板的初始化内容 -> push代码

添加：判断组件名是否重复 -> 更新组件列表 -> 拼接每个文件的内容 -> 写入组件目录下。

删除：删除文件

本地服务：启动http服务提供本地资源，用于调试

构建：shell执行vue cli的构建命令

发布：版本选择 -> 构建：执行构建shell -> 将构建后的资源上传cdn -> 组件库发布npm：先commit、push，再publish


* 细节：node相关的知识点补充

页面块：
1. 权衡取舍。用户类型：前端 or 前后端 + 产品；通信方式：要还是不要？需要怎么做？实现方式：低代码组件方式 or 容器方式？
  属性传递的方式：只读、配置props、标记为prop、共享所有变量（严重的维护问题）
2. 对全局的学习和把控。突破边界和舒适区，全面学习引擎、编辑器、渲染器和管理平台等模块的设计和实现。
3. 技术实现。
  * 服务端开发。数据库设计。
  * 渲染器开发。支持低代码组件。
  * 编辑器开发。功能点开发，新建、加载、更新、删除等。
  * 协同落地。
    开发：每日进度同步，及时抛出风险
    测试：准备自测用例、测试并通过后，提交代码PR
    验收：四方验收

    不熟悉模块的设计风险。
    方案没有完全对齐。

渲染器：
1. 深入Vue底层。
2. 语法糖的实现。

渲染器架构（右下到上）：
协议层：物料协议、搭建协议和物料包协议，这里主要是搭建协议
能力层：提供组件、区块、页面等渲染所需的核心能力，包括 props解析、样式注入和条件渲染等。
适配层：运行时框架不统一（Vue、React等），使用适配层将不同框架的差异部分，通过接口对外，让渲染层注册/适配对应所需的方法。
渲染层：提供核心的渲染方法，通过适配层进行注入，只需提供适配层所需的接口，即可实现渲染。
应用层：根据渲染层提供的方法，可以应用到项目中，根据使用的方法和规模即可实现应用、页面、区块的渲染。

多模式渲染：
预览模式渲染：将Schema和components渲染成页面即可
设计模式渲染：将编排生成的协议渲染成视图，且视图是可以交互的，需要处理颞部数据流、生命周期、事件绑定、国际化等。也称为画布的渲染，画布是编排的核心，它一般融合了页面的渲染以及组件/区块的拖拽、选择、快捷配置。和预览态渲染的区别是，画布的渲染是和设计器之间有交互的。所以新增一层Simulator作为设计器和渲染的连接器。Simulator是将设计器传入的DocumentModel和组件/库描述转成相应的Schema和组件类，再调用Render完成渲染。

Project：顶层的Project，管理所有文档模型Document，应用级Schema的导入和导出
Document：包括数据模型和Simulator两部分。Simulator通过Simulator Host协议与数据模型通信，达到修改UI驱动数据模型变化。
Simulator：特定运行时页面的渲染及模型层的通信。
Node：组件/区块的抽象，封装了一系列针对组件的API，如修改、编辑、保存、拖拽、复制等
Props：属性集合，提供一系列修改、遍历和操作的方法
Prop：具体属性，提供一系列操作该属性的方法
Settings：SettingField的集合
SettingField：连接设置器Setter和属性名模型Prop

基于沙箱隔离（Iframe）技术实现多运行时环境（Vue、React、Rax等）、多模式（流式布局、理由布局）、多场景（页面编排、逻辑编排等）的UI编排。

引擎架构：
1. 协议栈
2. 低代码引擎
3. 引擎生态
4. 上层应用

低代码引擎四大模块：
1. 入料。将外部物料通过物料描述协议进行描述，注册后可以在编排中使用。
2. 编排。编排UI生成搭建协议。
3. 渲染。将搭建协议处理成视图。
4. 出码。将应用描述解析并转换为代码。

引擎生态：
1. 物料
2. 插件：组成设计器
3. 设置器


通用难点：
1. 设计体验良好和能够提效的产品功能。

阿里低代码架构：
1. 模拟器
2. 渲染器
3. 编辑器
4. core
5. 协议规范

#### 成果
……
