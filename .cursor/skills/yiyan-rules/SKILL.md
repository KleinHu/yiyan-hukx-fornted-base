---
name: yiyan-rules
description: This is a new rule
---
1. yiyan-hukx-fronted（微服务前端 Demo）
技术栈：
Vue 3 + TypeScript + Vite
Arco Design 组件库
Pinia 状态管理
Vue Router 路由
其他：ECharts、WangEditor、BPMN.js
项目结构：
src/api/ - API 接口（bpm、system、form 等）
src/components/ - 业务组件
src/views/ - 页面视图（约 58 个文件）
src/router/ - 路由配置
src/store/ - 状态管理
src/hooks/ - 组合式函数
开发配置：
开发服务器：localhost，自动打开浏览器
代理配置：
JPAAS 服务：http://localhost:9900（api-bpm、api-form、api-system、api-user）
易研平台：http://localhost:39996（/api 路径）
代码规范：
Husky + lint-staged：提交前自动检查
Commitlint：规范 commit message
ESLint + Prettier + Stylelint：代码格式化
2. yiyan-hukx-fronted-locally（单机版前端 Demo）
技术栈：
与微服务版本基本相同
额外包含：
@vue-office/* 系列（文档预览：docx、excel、pdf、pptx）
konva + vue-konva（图形绘制）
项目规模：
视图文件：约 240 个（vs 微服务版 58 个）
API 文件：约 90 个（vs 微服务版约 40 个）
组件：约 82 个（vs 微服务版约 50 个）
特殊内容：
guide/ 目录：开发文档和指南
各类功能后端/ 目录：包含多个业务模块的后端代码和文档
人事功能
党建积分
待办清单
文件传阅
桶装水管理
科室计划管控
部门计划
3. my-dxe-backed（微服务后端项目）
项目结构（Maven 多模块）：
my-dxe-backed/├── yiyan-demo-api/      # API 接口定义模块├── yiyan-demo-biz/       # 业务逻辑实现模块├── yiyan-demo-server/    # 服务启动模块└── code-generator/       # 代码生成器模块
技术栈：
Spring Boot 2.3.12.RELEASE
Spring Cloud Hoxton.SR12
Spring Cloud Alibaba 2.2.5.RELEASE
MyBatis/MyBatis Plus
Lombok + MapStruct
微服务组件：
服务注册与发现：Nacos
配置中心：Nacos
API 网关：Spring Cloud Gateway
服务调用：OpenFeign
服务熔断：Sentinel
链路追踪：SkyWalking
分布式事务：Seata
定时任务：XXL-Job
中间件配置：
数据库：MySQL（localhost:3307，数据库：platform）
Redis：localhost:6379
RabbitMQ：localhost:5672
Nacos：localhost:8848（namespace: local）
业务模块示例：
operatelog：操作日志功能（包含完整的 Controller、Service、DAO、Entity、VO 等）
项目关联关系
前端与后端对接：
前端 appKey 和 appSecret：hukx-client / hukx
后端 OAuth 配置：client-id: hukx-client，client-secret: hukx
前端代理指向后端服务：localhost:39996
开发流程：
主要开发：yiyan-hukx-fronted
参考实现：yiyan-hukx-fronted-locally（功能更全）
后端服务：my-dxe-backed

这是这个项目的技术栈，请遵从技术要求写代码
