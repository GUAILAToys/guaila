# Guaila Toys 外贸客户管理系统

复用已开发的「Guaila Toys 客户工作台」源码，未重新开发现有功能。此仓库保存代码，不保存真实客户资料或邮箱凭证。

## 当前功能

- 客户搜索、筛选、基本信息、阶段与回复分类。
- 标准可选中文本客户开发 PDF：浏览器解析 → 预览校正 → 导入；扫描件需预处理。
- 以域名、邮箱、名称匹配客户；身份冲突交人工处理，保留人工跟进字段。
- 跟进责任人、日期、下一步、备注及编辑事件；区分人工回复、自动回复、退信、退订。
- 邮件记录关联、Gmail 跳转、CSV 导出与 JSON 备份。

**尚未实现实时 Gmail OAuth 接入、增量同步或自动发信。刷新仅读取已存记录。** 已发送不代表已送达或已读。JSON 导入不能完整恢复历史事件。

## 目录

| 路径 | 用途 |
| --- | --- |
| `app/desk.tsx` | 现有工作台界面、PDF 导入与导出 |
| `app/api/crm/route.ts` | 客户读写、合并、邮件记录、编辑事件 |
| `lib/crm.mjs` | 解析、匹配、分类常量、人工字段保护 |
| `modules/` | 后续模块接入位置与现有代码映射，避免重复实现 |
| `db/`、`drizzle/` | 数据结构与迁移，不含数据库内容 |
| `tests/` | 已有业务规则测试 |
| `build/`、`scripts/` | 保留的 Sites/Vinext 构建基础设施 |
| `.openai/hosting.json` | 原站点绑定，非凭证；勿随意修改或用于其他站点 |
| `docs/` | 来源、接入及安全说明 |

## 开发与验证

沿用 Node >=22.13.0、pnpm 11.25.0 和已有锁文件；不升级依赖。

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm dev
corepack pnpm build
```

本项目依赖 Sites / Cloudflare Workers 的 D1 `DB` 绑定及平台鉴权，不是纯静态网页，不能直接部署到 GitHub Pages。普通电脑的本地预览使用模拟身份，只可在可信本地环境使用。数据库迁移文件仅定义结构；运行环境需配置 D1 并应用 `drizzle/` 迁移。

## 安全边界

线上 `/api/crm` 依赖原 Sites 的仅本人访问边界。公开代码不代表公开客户系统。迁移到其他托管环境、开放其他用户之前，必须增加可信服务端身份校验和逐条数据归属检查，不能直接信任外部请求头。

请阅读 [安全规则](SECURITY.md)、[模块接入](docs/MODULES.md) 和 [源码来源](docs/SOURCE.md)。本次仅同步代码至 GitHub，不变更线上站点或其访问权限。
