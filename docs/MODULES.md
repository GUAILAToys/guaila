# 模块接入地图

- `modules/imports/`：客户资料导入：现有 app/desk.tsx 与 lib/crm.mjs。扩展解析器应沿用预览确认、去重和来源页码。

- `modules/gmail/`：Gmail 同步预留：当前只有记录导入与跳转，没有实时连接。后续服务端实现最小权限授权、增量游标、message ID 幂等、退订保护；不得在前端保存令牌。

- `modules/customers/`：客户分类：现有 lib/crm.mjs 的 STAGES/REPLIES 与 app/api/crm/route.ts。保持业务阶段、回复类别独立。

- `modules/follow-ups/`：跟进记录：现有 API edit 与 events 表；沿用责任人、下一步、到期日期、revision 冲突校验。

优先在现有实现上迭代；只有功能需要时才拆分文件。数据库使用结构迁移，不提交数据导出。
