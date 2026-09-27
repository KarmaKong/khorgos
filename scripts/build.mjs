import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { redesign } from './redesign.mjs';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'source');
const out = path.join(root, 'dist');
const origin = 'https://chinairantrucks.com';
const domain = (process.env.SITE_ORIGIN || 'https://khorgosirantruck.com').replace(/\/$/, '');
if (domain && !/^https:\/\/[a-z0-9.-]+$/i.test(domain)) throw new Error('SITE_ORIGIN must be an HTTPS origin');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const files = walk(source).filter(p=>p.endsWith('.html') && !/^google[a-f0-9]+\.html$/i.test(path.basename(p)));
fs.mkdirSync(out,{recursive:true});
for(const dir of ['img','fonts']) if(fs.existsSync(path.join(source,dir))) fs.cpSync(path.join(source,dir),path.join(out,dir),{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true,filter:p=>!p.endsWith('.png')});
const config = {
  fa:{home:'/',articles:'/articles/',route:'مسیر حمل',cargo:'خدمات',faq:'پرسش‌ها',contact:'استعلام قیمت',menu:'فهرست',back:'صفحه اصلی',index:'راهنمای حمل',title:'چین به ایران، از مسیر زمینی.',toc:'در این مقاله',skip:'پرش به محتوا'},
  en:{home:'/en/',articles:'/en/articles/',route:'Routes',cargo:'Cargo',faq:'FAQ',contact:'Get a quote',menu:'Menu',back:'Home',index:'Freight journal',title:'China to Iran. By road.',toc:'On this page',skip:'Skip to content'},
  zh:{home:'/zh.html',articles:'/zh/articles/',route:'运输路线',cargo:'承运货物',faq:'常见问题',contact:'获取报价',menu:'菜单',back:'首页',index:'运输指南',title:'从中国出发，沿公路抵达伊朗。',toc:'文章目录',skip:'跳到正文'}
};
const brand = '<span class="brand" dir="ltr"><img src="/assets/favicon.svg" width="38" height="38" alt="">khorgosirantruck</span>';
function node(doc, html){const t=doc.createElement('template');t.innerHTML=html;return t.content.firstElementChild;}
function routeOf(rel){return '/'+rel.replace(/index\.html$/,'');}
function localURL(value,url){try{const u=new URL(value,url);return u.origin===origin?u.pathname+u.search+u.hash:value;}catch{return value;}}
let audit=[];
for(const file of files){
  const rel=path.relative(source,file), route=routeOf(rel), url=origin+route;
  const {document:d}=parseHTML(fs.readFileSync(file,'utf8')
    .replaceAll('sales@chinairantrucks.com','sales@khorgosirantruck.com')
    .replaceAll('8613237401856','8615876207182')
    .replaceAll('Aliboby88','Kannchung'));
  const main=d.querySelector('main');
  if(!main){
    if(rel!=='zh/index.html')throw new Error(`No main: ${rel}`);
    const dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.writeFileSync(dest,'<!doctype html><html lang="zh-Hans"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="refresh" content="0;url=/zh.html"><meta name="robots" content="noindex,follow"><title>khorgosirantruck 中文</title><a href="/zh.html">进入中文站点</a></html>');continue;
  }
  const lang=d.documentElement.lang.startsWith('zh')?'zh':d.documentElement.lang.startsWith('en')?'en':'fa';
  const c=config[lang], isHome=!!d.querySelector('.home-hero');
  const baseline=main.textContent.replace(/\s+/g,' ').trim();
  const alternates=[...d.querySelectorAll('link[rel="alternate"][hreflang]')].map(e=>({lang:e.getAttribute('hreflang'),url:localURL(e.getAttribute('href'),url)}));
  const oldLang=[...d.querySelectorAll('.lang-menu a')].map(e=>({lang:e.getAttribute('hreflang'),url:localURL(e.getAttribute('href'),url)}));
  const langs=[['fa','فارسی'],['en','EN'],['zh-Hans','中文']].map(([l,label])=>{
    const isCurrent=l.startsWith(lang);
    const target=isCurrent?route:(alternates.find(x=>x.lang===l)||oldLang.find(x=>x.lang===l))?.url||config[l==='zh-Hans'?'zh':l].home;
    return `<a href="${target}" lang="${l}" ${isCurrent?'aria-current="page"':''}>${label}</a>`;
  }).join('');
  // Keep copy and business links, but remove the previous site's styling and telemetry.
  d.querySelectorAll('script,style,link[rel="stylesheet"],link[rel*="icon"]').forEach(e=>e.remove());
  d.querySelectorAll('noscript').forEach(e=>{if(!e.closest('main'))e.remove();});
  if(main.querySelector('[data-quote-form]'))d.body.appendChild(node(d,'<script defer src="/assets/quote-form.js"></script>'));
  d.querySelectorAll('link[rel="canonical"],meta[property="og:url"],meta[property="og:image"],meta[property="og:image:width"],meta[property="og:image:height"],meta[name="twitter:image"]').forEach(e=>e.remove());
  d.querySelectorAll('meta[property="og:site_name"]').forEach(e=>e.setAttribute('content','khorgosirantruck'));
  d.querySelectorAll('meta[name="twitter:card"]').forEach(e=>e.setAttribute('content','summary'));
  d.querySelectorAll('link[rel="alternate"]').forEach(e=>{const p=localURL(e.getAttribute('href'),url);if(domain)e.setAttribute('href',domain+p);else e.remove();});
  if(domain)d.head.appendChild(node(d,`<link rel="canonical" href="${domain+route}">`));
  d.title=d.title.replaceAll('chinairantrucks','khorgosirantruck');if(!d.title.includes('khorgosirantruck'))d.title+=' | khorgosirantruck';
  d.querySelectorAll('meta[content]').forEach(e=>e.setAttribute('content',e.getAttribute('content').replace(/(?<!@)chinairantrucks/g,'khorgosirantruck')));
  d.head.appendChild(node(d,'<link rel="stylesheet" href="/assets/site.css">'));
  d.head.appendChild(node(d,'<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">'));
  for(const e of d.querySelectorAll('[href],[src],[srcset]')){
    for(const attr of ['href','src'])if(e.hasAttribute(attr))e.setAttribute(attr,localURL(e.getAttribute(attr),url));
    if(e.hasAttribute('srcset'))e.setAttribute('srcset',e.getAttribute('srcset').split(',').map(s=>{const [u,...rest]=s.trim().split(/\s+/);return [localURL(u,url),...rest].join(' ');}).join(', '));
  }
  const header=node(d,`<header class="site-header"><div class="header-inner"><a class="home-link" href="${c.home}" aria-label="khorgosirantruck — ${c.back}">${brand}</a><nav class="desktop-nav" aria-label="${c.menu}"><a href="${c.home}#lanes">${c.route}</a><a href="${c.home}#cargo">${c.cargo}</a><a href="${c.articles}">${c.index}</a></nav><div class="languages" aria-label="Language">${langs}</div><a class="header-quote" href="${c.home}#quote">${c.contact} <span aria-hidden="true">↗</span></a><details class="mobile-menu"><summary>${c.menu}</summary><nav><a href="${c.home}#lanes">${c.route}</a><a href="${c.home}#cargo">${c.cargo}</a><a href="${c.articles}">${c.index}</a><a href="${c.home}#quote">${c.contact}</a></nav></details></div></header>`);
  d.querySelector('header').replaceWith(header);
  const foot=d.querySelector('footer');
  const legal=foot?.querySelector('.footer-legal')?.outerHTML||'';
  if(foot)foot.replaceWith(node(d,`<footer class="site-footer"><div class="footer-top"><a href="${c.home}" aria-label="khorgosirantruck">${brand}</a><span class="footer-route" dir="ltr">CHINA <span>→</span> IRAN</span><a href="${c.home}#quote">${c.contact} ↗</a></div><div class="footer-bottom"><span>© 2026 khorgosirantruck</span>${legal}<div class="languages">${langs}</div></div></footer>`));
  const skip=d.querySelector('.skip');if(skip)skip.textContent=c.skip;
  if(isHome){
    d.body.classList.add('home');
    const hero=d.querySelector('.home-hero');
    hero.querySelector('picture')?.remove();
    hero.querySelector('.hero-copy').prepend(node(d,'<p class="eyebrow" dir="ltr">CHINA — IRAN <span> / </span> TIR ROAD FREIGHT</p>'));
    hero.prepend(node(d,'<div class="hero-visual"><img src="/assets/hero-road.webp" alt="" width="1536" height="1024" fetchpriority="high"><div class="image-label" dir="ltr"><span>01 / THE OVERLAND CONNECTION</span><span>CN → IR</span></div></div>'));
    const stats=d.querySelector('.cargo-stats');if(stats){const strip=node(d,'<section class="stat-band"></section>');strip.append(stats);hero.after(strip);}
    const sections=['lanes','cargo','route','compare','fleet','faq','quote'];
    for(const [i,id] of sections.entries()){
      const s=d.getElementById(id);if(!s)continue;
      const label=s.querySelector('.sec-label');if(label){const h=d.createElement('h2');h.className='sec-label';h.innerHTML=label.innerHTML;label.replaceWith(h);h.prepend(node(d,`<span class="section-number" aria-hidden="true">${String(i+1).padStart(2,'0')} /</span>`));}
    }
    // New reading order; keep every source block intact.
    for(const id of sections){const s=d.getElementById(id);if(s)main.append(s);}
    const timeline=d.querySelector('.timeline');if(timeline)for(const [i,li] of [...timeline.children].entries())li.prepend(node(d,`<span class="step-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>`));
    const lanes=d.getElementById('lanes');
    if(lanes)lanes.querySelector('.sec-label')?.after(node(d,'<div class="route-ribbon" dir="ltr" aria-label="Wuqia corridor"><span>CHINA<small>Wuqia</small></span><b aria-hidden="true">→</b><span>KYRGYZSTAN<small>Transit</small></span><b aria-hidden="true">→</b><span>UZBEKISTAN<small>Bukhara</small></span><b aria-hidden="true">→</b><span>TURKMENISTAN<small>Transit</small></span><b aria-hidden="true">→</b><span>IRAN<small>Tehran / Mashhad</small></span></div>'));
  }else{
    d.body.classList.add('reading-page');
    const isIndex=/\/articles\/$/.test(route);d.body.classList.add(isIndex?'journal-index':'article-page');
    const h1=main.querySelector('h1');if(h1)h1.before(node(d,`<p class="breadcrumbs"><a href="${c.home}">${c.back}</a><span>/</span><a href="${c.articles}">${c.index}</a></p>`));
    if(isIndex){const rows=[...main.querySelectorAll('.way-row')];if(rows.length){const grid=node(d,'<div class="waybill"></div>');rows[0].before(grid);rows.forEach(r=>grid.append(r));}}
    if(!isIndex){
      const headings=[...main.querySelectorAll('h2')];
      if(headings.length){const toc=node(d,`<details class="contents"><summary>${c.toc}</summary><ol></ol></details>`);headings.forEach((h,i)=>{if(!h.id)h.id='section-'+(i+1);const li=d.createElement('li'),a=d.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;li.append(a);toc.querySelector('ol').append(li);});h1?.after(toc);}
    }
  }
  // Replace legacy brand labels in the retained business copy.
  const replaceText=n=>{for(const child of [...n.childNodes]){if(child.nodeType===3)child.textContent=child.textContent.replace(/(?<![@\w])chinairantrucks(?:\.com)?(?![\w])/g,'khorgosirantruck');else replaceText(child);}};replaceText(main);
  if(route.endsWith('/privacy/'))for(const p of main.querySelectorAll('p'))if(p.textContent.includes('GoatCounter'))p.textContent={
    zh:'本网站当前未启用 GoatCounter 或其他访客统计脚本。联系按钮会打开相应的第三方服务，其数据处理方式以该服务的隐私政策为准。',
    en:'This website currently does not enable GoatCounter or other visitor analytics scripts. Contact links open third-party services, whose own privacy policies govern their data processing.',
    fa:'در حال حاضر GoatCounter یا اسکریپت دیگری برای آمار بازدیدکنندگان در این وب‌سایت فعال نیست. پیوندهای تماس، خدمات شخص ثالث را باز می‌کنند و پردازش داده در آن‌ها تابع سیاست حریم خصوصی همان خدمات است.'
  }[lang];
  for(const table of main.querySelectorAll('table'))if(!table.parentElement.classList.contains('compare-scroll')){const wrap=d.createElement('div');wrap.className='compare-scroll';table.replaceWith(wrap);wrap.append(table);}
  for(const img of main.querySelectorAll('img')){if(!img.hasAttribute('loading')&&!img.hasAttribute('fetchpriority'))img.loading='lazy';}
  redesign(d,{lang,isHome,root,c,domain,route});
  const dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,'<!DOCTYPE html>\n'+d.documentElement.outerHTML);
  audit.push({route,lang,sourceChars:baseline.length});
}
for (const name of fs.readdirSync(source).filter(n => /^google[a-f0-9]+\.html$/i.test(n))) {
  fs.copyFileSync(path.join(source, name), path.join(out, name));
}
fs.writeFileSync(path.join(out,'_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n${domain?'Sitemap: '+domain+'/sitemap.xml\n':''}`);
if(domain)fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+audit.map(x=>`<url><loc>${domain+x.route}</loc></url>`).join('')+'</urlset>');
fs.writeFileSync(path.join(out,'404.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page not found | khorgosirantruck</title><link rel="stylesheet" href="/assets/site.css"><main class="error-page"><p class="eyebrow">KHORGOSIRANTRUCK / 404</p><h1>This road ends here.</h1><p>The page could not be found.</p><a class="btn" href="/">فارسی</a> <a class="btn" href="/en/">English</a> <a class="btn" href="/zh.html">中文</a></main></html>`);
fs.writeFileSync(path.join(root,'migration-report.json'),JSON.stringify(audit,null,2));
console.log(`Built ${audit.length} pages in dist/. Domain: ${domain||'not yet supplied; canonical/sitemap omitted'}`);
