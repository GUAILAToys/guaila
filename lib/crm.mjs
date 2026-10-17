import { getDomain } from 'tldts';
export const STAGES=['待审核','已开发','初步沟通','MOQ咨询','需求确认','待报价','报价已发','打样','订单','未来培育','已结束'];
export const REPLIES=['未核验','未见人工回复','仅自动回复','人工回复','仅转部门','拒绝/退订','退信'];
export function normalEmail(v){return String(v||'').trim().toLowerCase()}
export function domain(v){try{let h=new URL(v.includes('://')?v:'https://'+v).hostname.toLowerCase().replace(/^www\./,'');return /\.(artstation|carrd|bigcartel|myshopify)\.com$/.test(h)?h:(getDomain(h,{allowPrivateDomains:true})||h)}catch{return ''}}
export function keyName(v){return String(v||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')}
const emailRx=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
export function parseReport(pages,sourceId){
 const out=[],seen=new Set();
 pages.forEach((text,i)=>{
  const m=text.match(/(?:^|\n)\s*(0[1-9]|10)\s+([^\n]+)\n/);if(!m)return;
  const name=m[2].trim(); if(name.length>95||/\d\s*\/\s*\d\s*\/\s*\d|草稿|中文释义|：/.test(name)||seen.has(keyName(name)))return;
  if(!/规模|已核验|公开联系方式|采购信号/.test(text))return;
  const after=text.slice(m.index+m[0].length).trim(),countryLine=after.split('\n')[0].trim();
  const clean=text.replace(/\n\s*/g,' ');
  let website=(text.match(/官网[：:]\s*(https?:\/\/[^\s]+)/)||text.match(/\n\s*(https?:\/\/[^\s]+)/)||[])[1]||'';
  let dom=(text.match(/(?:根域名／主体键|根域名|去重键)[：:]\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)||[])[1]||(text.match(/\n\s*([a-zA-Z0-9.-]+\.(?:com|net|co|shop|uk|life)(?:\.[a-z]{2})?)\s*\n/)||[])[1]||domain(website);
  if(!website&&dom)website='https://'+dom;
  const emails=[...new Set((text.match(emailRx)||[]).map(normalEmail))].filter(x=>!['guailatoys@gmail.com','hello@domain.com'].includes(x));
  const summary=(clean.match(/(?:已核验事实|已核验产品|产品／角色与活动事实|已核验业务及产品)[：:｜]?\s*(.*?)(?=规模|日期与当前状态|$)/)||[])[1]||'';
  const aliases=(clean.match(/(?:去重主体|主体／别名)[：:]\s*(.*?)(?=根域名|已核验|$)/)||[])[1]||name;
  const country=(countryLine.match(/美国|加拿大|英国|澳大利亚|新加坡|马来西亚|韩国|日本|荷兰|法国|德国|西班牙|阿联酋|沙特阿拉伯|卡塔尔|科威特|巴林|阿曼/)||[])[0]||'待核实';
  const category=/美妆礼品/.test(countryLine)?'美妆礼品':'IP玩具文创';
  const priority=(countryLine.match(/\b[AB][123+\-]?\b/)||[])[0]||'B';
  out.push({name,aliases,domain:domain(dom||website),website,emails,country,address:'',location:countryLine,category,priority,summary:summary.trim(),stage:'待审核',reply:'未核验',waiting:'待核验往来',nextAction:'核对 Gmail 往来与发送资格',owner:'Xie',due:'',notes:'',sources:[{id:sourceId,page:i+1,excerpt:text}],qualification:/仅表单/.test(text)?'仅表单':/缓存|邮箱.*复核/.test(text)?'联系入口待复核':'待人工审核',lastInbound:'',lastOutbound:'',reviewed:false});seen.add(keyName(name));
 });return out;
}
export function findMatches(c,existing){const e=(c.emails||[]).map(normalEmail),n=[c.name,...String(c.aliases||'').split(/[;；/]/)].map(keyName).filter(x=>x.length>2);return existing.filter(x=>(c.domain&&x.domain===c.domain)||(x.emails||[]).some(a=>e.includes(normalEmail(a)))||[x.name,...String(x.aliases||'').split(/[;；/]/)].map(keyName).some(a=>n.includes(a)))}
export function mergeCustomer(old,fresh){if(!old)return fresh;return {...old,emails:[...new Set([...(old.emails||[]),...(fresh.emails||[])])],sources:[...(old.sources||[]),...(fresh.sources||[]).filter(s=>!(old.sources||[]).some(t=>s.id===t.id&&s.page===t.page))],summary:old.summary||fresh.summary,website:old.website||fresh.website,domain:old.domain||fresh.domain};}
