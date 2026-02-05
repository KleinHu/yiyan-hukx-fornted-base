---
trigger: always_on
---

---

name: yiyan-rules
description: 易研 OA 前端项目开发规范与项目上下文

---

# 易研 OA 前端项目（yiyan-hukx-fronted-oa）

## 项目技术栈

| 类别   | 技术                  | 版本            |
| ------ | --------------------- | --------------- |
| 框架   | Vue                   | 3.2.40          |
| 语言   | TypeScript            | 4.8.4           |
| 构建   | Vite                  | 3.2.5           |
| UI     | Arco Design Vue       | 2.40.0          |
| 状态   | Pinia                 | 2.0.23          |
| 路由   | Vue Router            | 4.0.14          |
| 国际化 | Vue I18n              | 9.2.2           |
| 图表   | ECharts + vue-echarts | 5.4.0 / 6.2.3   |
| 富文本 | @wangeditor/editor    | 5.1.23          |
| 流程   | bpmn-js               | 17.6.4          |
| 工具   | dayjs, lodash         | 1.11.5, 4.17.21 |

## 项目结构

```
src/
├── api/          # bpm、system、form
├── components/   # bpm、cac-components、chart、editor 等
├── views/        # bpm、dashboard、login 等
├── router/       # 模块化路由
├── store/        # app、permission、security、tab-bar
├── hooks/        # 组合式函数
├── utils/        # 请求封装、工具函数
├── types/        # 类型定义
└── config/       # settings.json、szhk.json
```

## 开发配置

**代理：**

- JPAAS：`http://hukx-Macmini.local:9900`（api-bpm、api-form、api-system、api-user）
- 易研平台：`http://hukx-Macmini.local:39996`（/api）
- 人事服务：`http://localhost:10008`（/api/240/hr）

**OAuth：** appKey `hukx-oa` / appSecret `hukx-oa`

## 请求工具选择

| 服务  | 工具                                | 路径                                        |
| ----- | ----------------------------------- | ------------------------------------------- |
| JPAAS | requestJpaas                        | /api-bpm、/api-form、/api-system、/api-user |
| 易研  | request                             | /api                                        |
| 人事  | request                             | /api/240/hr                                 |
| 文件  | requestForFile / requestFileHeaders | -                                           |

## 开发规范要点

1. **三层架构**：API → Hooks → 组件
2. **禁止**在组件中直接调用 API
3. **必须**使用项目封装的 request/requestJpaas
4. **分页**：pageNum、pageSize；返回 list、total
5. **组件**：script setup、Composition API、Arco 组件优先
6. **Git**：Conventional Commits
7. **icon 引入**：已经全局注册，不需要单独引入！

详细规范见 `.cursor/rules/vue3-arcodesign-ts.mdc`。
