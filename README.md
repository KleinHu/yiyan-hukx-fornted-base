#### yiyan-app



#### 介绍

1. 这里是易研app基础项目，在此编写自己的业务代码，快速实现前端应用。

2. 使用vue3 + typescript实现。

3. 推荐使用node版本16，推荐使用编辑器`vscode`



#### 项目启动 

```powershell
# 执行指令为项目安装依赖包
npm install

# 运行启动项目
npm run dev
```



#### 项目结构

```bash
├── README.md
├── package.json
├── index.html
├── src
│   ├── api  # 请求接口
│   ├── assets  # 静态资源
│          └── style 全局样式
│   ├── components  # 通用业务组件
│   ├── config  # 全局配置(包含echarts主题)
│          └── settings.json  # 配置文件
│   ├── directives # 指令集（如需，可自行补充）
│   ├── filters # 过滤器（如需，可自行补充）
│   ├── hooks # 全局hooks
│   ├── layout  # 布局
│   ├── locale  # 国际化语言包
│   ├── mock  # 模拟数据
│   ├── views  # 页面模板
│   	   └── system # 基础管理页面所在目录
│   ├── router # 路由配置
│   ├── store  # 状态管理中心
│   ├── types  # Typescript 类型
│   └── utils  # 工具库
│   └── App.vue  # 视图入口
│   └── main.ts  # 入口文件
└── tsconfig.json
```



#### 开始使用

1. 在`/src/config/settings.json`中修改`projectName`值为应用名称
2. 在 [易研管理平台](http://10.1.1.120:31102) > 平台管理 > 令牌管理，创建令牌进行应用注册
3. 在`/src/config/settings.json`中修改`appKey`和`appSecret`的值为新建令牌的客户端ID与客户端密钥



#### 代码提交

项目添加了husky，进行commit时请遵守格式填写commit message

```powershell
git commit "feat: 添加的更改信息"
# feat, fix, build...
```



#### 打包部署

```powershell
# 执行指令打包
npm run build
```



#### 特性

1. 更多特性参看 [易研DxE](http://10.1.1.120:31116/introduction)
2. 私有代码仓库 `http://10.1.1.33:8081/repository/npm-repo`