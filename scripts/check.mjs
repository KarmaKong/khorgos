import fs from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {parseHTML} from 'linkedom';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const report=JSON.parse(fs.readFileSync(path.join(root,'migration-report.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'source/manifest.json')));
const errors=[];let links=0,blocks=0;
const clean=s=>s.replaceAll('Aliboby88','Kannchung').replaceAll('sales@chinairantrucks.com','sales@khorgosirantruck.com').replaceAll('8613237401856','8615876207182').replace(/(?<![@\w])chinairantrucks(?:\.com)?(?![\w])/g,'khorgosirantruck').replace(/\s+/g,'').trim();
const fileFor=p=>path.join(out,decodeURI(p.endsWith('/')?p+'index.html':p));
const parsed=new Map();
for(const {route} of report)parsed.set(route,parseHTML(fs.readFileSync(fileFor(route),'utf8')).document);
for(const {route} of report){
  const d=parsed.get(route),src=path.join(root,'source',route.endsWith('/')?route+'index.html':route);
  const original=parseHTML(fs.readFileSync(src,'utf8')).document;
  if(/sales@chinairantrucks\.com|13237401856|Aliboby88/.test(d.toString()))errors.push(`Old contact remains: ${route}`);
  const text=clean(d.querySelector('main').textContent);
  for(const e of original.querySelectorAll('main p,main h1,main h2,main h3,main li,main td,main th,main caption,main figcaption,main label,main legend,main option,main summary,main .fig,main .stat-label,main .ttl')){
    if(route.endsWith('/privacy/')&&e.textContent.includes('GoatCounter'))continue;
    const expected=clean(e.textContent);blocks++;
    if(expected&&!text.includes(expected))errors.push(`Missing content ${route}: ${expected.slice(0,70)}`);
  }
  for(const a of d.querySelectorAll('[href],[src],[srcset]')){
    const refs=['href','src'].map(x=>a.getAttribute(x)).filter(Boolean);
    if(a.hasAttribute('srcset'))refs.push(...a.getAttribute('srcset').split(',').map(x=>x.trim().split(/\s+/)[0]));
    for(const ref of refs){
      if(!ref.startsWith('/')&&!ref.startsWith('#'))continue;
      links++;const u=new URL(ref,'http://local'+route),f=fileFor(u.pathname);
      if(!fs.existsSync(f)){errors.push(`Missing target ${route}: ${ref}`);continue;}
      if(u.hash){const target=parsed.get(u.pathname);if(target&&!target.getElementById(decodeURIComponent(u.hash.slice(1))))errors.push(`Missing anchor ${route}: ${ref}`);}
    }
  }
  if(!d.querySelector('h1'))errors.push(`Missing H1 ${route}`);
  for(const script of d.querySelectorAll('script[src]'))if(script.getAttribute('src')!=='/assets/quote-form.js')errors.push(`Unexpected runtime script ${route}`);
  for(const a of d.querySelectorAll('header .languages a')){
    const target=a.getAttribute('href'),expected=a.getAttribute('lang');
    if(parsed.has(target)&&parsed.get(target).documentElement.lang!==expected)errors.push(`Language mismatch ${route}: ${target}`);
  }
}
for(const m of fs.readFileSync(path.join(out,'assets/site.css'),'utf8').matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g))if(!fs.existsSync(fileFor(m[1])))errors.push(`Missing CSS asset ${m[1]}`);
if(manifest.errors.length)errors.push('Source snapshot has download failures');
for(const url of manifest.pages){const p=new URL(url).pathname;if(!fs.existsSync(fileFor(p)))errors.push(`Unmigrated source page: ${p}`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
// Exercise the preserved mailto builder without opening a mail app or sending data.
const fields=new Map(Object.entries({hub:'Yiwu (Suxi)',dest:'Tehran West Customs (Gomrok Gharb)',hs:'850440',kg:'1000',cbm:'5',notes:'中文 & فارسی',contact:'',lithium:'yes'}));
let submit,invalid=0;
const form={addEventListener:(event,fn)=>{if(event==='submit')submit=fn;},reportValidity:()=>invalid++};
const context={document:{querySelector:()=>form},FormData:class{get(k){return fields.get(k);}},location:{href:''}};
vm.runInNewContext(fs.readFileSync(path.join(out,'assets/quote-form.js'),'utf8'),context);
submit({preventDefault(){}});
const mail=new URL(context.location.href);
assert.equal(mail.protocol,'mailto:');assert.equal(mail.pathname,'sales@khorgosirantruck.com');
assert.ok(mail.searchParams.get('body').includes('中文 & فارسی'));
assert.ok(mail.searchParams.get('body').includes('Gross weight kg: 1000'));
fields.delete('kg');context.location.href='';submit({preventDefault(){}});
assert.equal(invalid,1);assert.equal(context.location.href,'');
console.log(`PASS: ${report.length} content pages + Chinese alias; ${blocks} source content blocks retained (3 analytics notices adapted); ${links} local links/assets/anchors checked; all language destinations valid.`);
console.log('PASS: quote mailto encoding, updated recipient and required-field guard; no old contacts in generated pages. No email sent.');
// Redesign contracts: locales, contact data, SEO, asset provenance and accessible forms.
for(const [route,d] of parsed){
 assert.equal(d.querySelectorAll('h1').length,1,`One H1: ${route}`);
 const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);
 assert.equal(new Set(ids).size,ids.length,`Unique IDs: ${route}`);
 const canonical=d.querySelector('link[rel=canonical]')?.getAttribute('href');
 assert.ok(canonical?.startsWith(process.env.SITE_ORIGIN||'https://khorgosirantruck.com'),`Canonical: ${route}`);
 assert.ok(d.querySelector('meta[property="og:image"]'),`Open Graph image: ${route}`);
 assert.ok(d.querySelector('header img[src$="khorgos-logo-horizontal.svg"]'));
 for(const a of d.querySelectorAll('a[href^="https://wa.me/"]'))assert.equal(a.getAttribute('href').split('?')[0],'https://wa.me/8615876207182');
 for(const el of d.querySelectorAll('input:not([type=hidden]),select,textarea'))assert.ok(el.closest('label')||d.querySelector(`label[for="${el.id}"]`),`Form label: ${route}/${el.id}`);
 if(d.body.classList.contains('home')){
  assert.equal(d.querySelectorAll('.service-card').length,3);
  assert.equal(d.querySelectorAll('form[data-quote-form]').length,1);
  assert.equal(d.querySelector('form').getAttribute('action'),'mailto:sales@khorgosirantruck.com');
 }
}
const walkFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkFiles(path.join(dir,e.name)):[path.join(dir,e.name)]);
assert.ok(!walkFiles(out).some(p=>p.includes('source-boards')||p.includes('-ai.')));
const assetHashes=JSON.parse(fs.readFileSync(path.join(root,'assets/khorgos-sha256.json'),'utf8'));
for(const [relative,hash] of Object.entries(assetHashes))assert.equal(createHash('sha256').update(fs.readFileSync(path.join(out,'assets/khorgos',relative))).digest('hex'),hash,`Asset changed: ${relative}`);
console.log('PASS: unique IDs, one H1, localized SEO, form labels, original supplied asset bytes and no source boards in output.');
