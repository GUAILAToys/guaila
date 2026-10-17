# 数据与凭证保护

- 禁止提交客户 PDF、邮件正文、导入/导出记录、数据库、备份、访问令牌、OAuth client secret 或 refresh token。
- 本地业务资料放入被忽略的 `private/`、`data/`、`uploads/`、`exports/`、`backups/`；线上数据留在受保护的数据库或对象存储。
- `.env.example` 只可放空值与说明。实际凭证只在服务端密钥管理系统配置，不进入浏览器、日志、URL、GitHub Issues 或构建产物。
- `.gitignore` 不能阻止 `git add -f` 或保护已跟踪文件；每次提交前检查 `git diff --cached` 和 `git status`。示例仅使用虚构数据。
- 发现泄露时先撤销/轮换凭证，再清理 Git 历史；仅删除当前文件不够。
- 当前 API 的访问控制依赖 Sites 仅本人访问配置。迁移部署或多人使用前必须增加服务端身份认证和数据归属校验。
- Gmail 后续默认只读、最小权限、客户范围同步。发送邮件需要单独授权和审核。
- 不要在公开 Issue 中贴客户资料或密钥；通过内部渠道报告。
