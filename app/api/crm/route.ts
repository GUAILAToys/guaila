import {env} from 'cloudflare:workers';
import {findMatches,mergeCustomer,STAGES,REPLIES,domain,normalEmail} from '@/lib/crm.mjs';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
// Owner-private Site only. Dispatch enforces owner sign-in or its service bearer.
// Do not change Site audience without adding tenant-level authorization.
function checkOrigin(req:Request){const o=req.headers.get('origin');if(o&&o!==new URL(req.url).origin)throw new Error('跨站请求已拒绝');if(req.headers.get('sec-fetch-site')==='cross-site')throw new Error('跨站请求已拒绝');}
async function rows(table:string){const r=await env.DB!.prepare(`SELECT * FROM ${table}`).all();return r.results.map((x:any)=>({...JSON.parse(x.data),id:x.id,...(x.revision?{revision:x.revision}:{} )}));}
export async function GET(){try{return json({customers:await rows('customers'),sources:await rows('sources'),messages:await rows('messages'),events:await rows('events'),liveSync:false})}catch{return json({error:'数据读取失败，请稍后重试。'},503)}}
export async function POST(req:Request){try{
 checkOrigin(req);const raw=await req.text();if(raw.length>6000000)return json({error:'导入内容过大，请分批导入'},413);const b=JSON.parse(raw),now=new Date().toISOString(),db=env.DB!;
 if(b.action==='edit'){
  const old:any=await db.prepare('SELECT * FROM customers WHERE id=?').bind(String(b.id)).first();if(!old)return json({error:'客户不存在'},404);if(old.revision!==b.revision)return json({error:'客户已在其他窗口更新，请刷新后重试'},409);
  const data=JSON.parse(old.data),p=b.patch||{};const fields=['name','country','address','summary','stage','reply','waiting','nextAction','owner','due','notes','priority','qualification','reviewed'];for(const k of fields)if(k in p){if(k==='reviewed'){data[k]=Boolean(p[k]);continue}if(typeof p[k]!=='string'||p[k].length>15000)throw Error('字段格式不正确');data[k]=p[k]}
  if(!STAGES.includes(data.stage)||!REPLIES.includes(data.reply)||!data.name.trim())throw Error('客户名称或分类无效');if(data.due&&!/^\d{4}-\d{2}-\d{2}$/.test(data.due))throw Error('日期格式无效');
  if(data.reply==='拒绝/退订'){data.stage='已结束';data.waiting='不再联系';data.nextAction='公司范围停止联系';}
  const changed=await db.prepare('UPDATE customers SET data=?,revision=revision+1,updated=? WHERE id=? AND revision=?').bind(JSON.stringify(data),now,b.id,b.revision).run();if(!changed.meta.changes)return json({error:'编辑冲突，请刷新'},409);
  await db.prepare('INSERT INTO events VALUES (?,?,?,?)').bind(crypto.randomUUID(),b.id,JSON.stringify({kind:'人工编辑',detail:p,time:now}),now).run();return json({ok:true});
 }
 if(b.action==='import'){
  if(!Array.isArray(b.customers)||b.customers.length>150||!Array.isArray(b.sources)||b.sources.length>20||!Array.isArray(b.messages)||b.messages.length>1000)throw Error('导入格式或批量大小无效');
  const existing:any[]=await rows('customers'),plans:any[]=[],conflicts:any[]=[],sourceSet=new Set((await rows('sources')).map((s:any)=>s.id));let added=0,merged=0;
  for(const c of b.customers){if(!c.name||typeof c.name!=='string'||c.name.length>200)throw Error('客户名称无效');c.domain=domain(c.domain||c.website||'');c.emails=(c.emails||[]).map(normalEmail);const matches=findMatches(c,existing);if(matches.length>1){conflicts.push(c.name);continue}const old=matches[0];const data=mergeCustomer(old,c);const id=old?.id||c.id||crypto.randomUUID();data.id=id;if(!old){data.stage=STAGES.includes(data.stage)?data.stage:'待审核';data.reply=REPLIES.includes(data.reply)?data.reply:'未核验';}plans.push({id,data,old});if(old)merged++;else added++;existing.push(...(old?[]:[data]));}
  // One transaction for sources, records and messages. Re-importing message IDs is idempotent.
  const stmts:any[]=[];
  for(const s of b.sources){if(!s.id||!s.name)throw Error('来源缺少 ID 或名称');if(!sourceSet.has(s.id))stmts.push(db.prepare('INSERT OR IGNORE INTO sources VALUES (?,?,?)').bind(s.id,JSON.stringify(s),now));}
  for(const p of plans)stmts.push(p.old?db.prepare('UPDATE customers SET data=?,revision=revision+1,updated=? WHERE id=? AND revision=?').bind(JSON.stringify(p.data),now,p.id,p.old.revision):db.prepare('INSERT OR IGNORE INTO customers VALUES (?,?,1,?)').bind(p.id,JSON.stringify(p.data),now));
  for(const m of b.messages){if(!m.id||!m.customerId||!existing.some(c=>c.id===m.customerId))throw Error('邮件缺少有效客户关联');stmts.push(db.prepare('INSERT OR IGNORE INTO messages VALUES (?,?,?)').bind(m.id,m.customerId,JSON.stringify(m)));}
  if(stmts.length)await db.batch(stmts);
  return json({ok:true,added,merged,conflicts});
 }
 return json({error:'不支持的操作'},400);
 }catch(e){return json({error:e instanceof Error?e.message:'保存失败'},400)}}
