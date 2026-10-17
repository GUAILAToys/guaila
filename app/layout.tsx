import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Guaila Toys · 客户工作台',description:'客户、往来与下一步，在一个工作台里。'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
