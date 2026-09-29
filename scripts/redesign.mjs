import fs from 'node:fs';
import path from 'node:path';
import {parseHTML} from 'linkedom';
const base='/assets/khorgos';
const copy={
 en:{headline:'Across borders.\nAlong the Silk Road.',eyebrow:'KHORGOS / CHINA — IRAN',intro:'Overland freight through Central Asia, delivered to destination customs in Iran.',routes:'Explore the routes',network:'Two gateways. One overland connection.',corridor:'Khorgos → Kazakhstan → Uzbekistan → Turkmenistan → Iran',map:'Illustrative route artwork; not a geographic reference.',services:'Built around your shipment.',titles:['Iran road freight','Central Asia transit','China consolidation'],desc:['Delivery to Tehran West Customs, Aprin or Mashhad on CPT / DAP terms.','Khorgos via Kazakhstan or Wuqia via Kyrgyzstan, onward through Uzbekistan and Turkmenistan.','Cargo collection in Yiwu, Shenzhen, Guangzhou and Shanghai, with export preparation and loading.'],details:'Explore service',border:'At the border, every detail matters.',borderCopy:'Export checks, cargo inspection and TIR sealing begin the cross-border journey. The Khorgos route runs through Kazakhstan, Uzbekistan and Turkmenistan into Iran. Ask for the current transit schedule.',borderLink:'Documents & preparation',formNote:'This form opens your email app. Review the message and attach your documents before sending.',art:'Illustrative photography',source:'Service scope & current transit times'},
 zh:{headline:'跨越国境，\n沿丝路前行。',eyebrow:'KHORGOS / 中国 — 伊朗',intro:'经中亚通道陆路运输，交付伊朗目的地海关。',routes:'查看运输路线',network:'两条口岸通道，连接中伊贸易。',corridor:'霍尔果斯 → 哈萨克斯坦 → 乌兹别克斯坦 → 土库曼斯坦 → 伊朗',map:'路线艺术示意，非精确地理地图。',services:'围绕每一票货物，安排运输。',titles:['伊朗公路运输','中亚过境运输','中国境内集货'],desc:['按 CPT / DAP 条款交付德黑兰西关、阿普林或马什哈德海关。','霍尔果斯经哈萨克斯坦，乌恰经吉尔吉斯斯坦，继续过境乌兹别克斯坦和土库曼斯坦。','义乌、深圳、广州、上海集货，安排出口准备与装载。'],details:'了解服务',border:'每一次过境，都始于细致准备。',borderCopy:'出口申报、货物查验与 TIR 施封衔接跨境运输。霍尔果斯线经哈萨克斯坦、乌兹别克斯坦和土库曼斯坦进入伊朗，当前时效请单独询价。',borderLink:'单证与发运准备',formNote:'此表单会打开你的邮件应用，请检查内容并附上单证后发送。',art:'运输场景示意图',source:'业务范围与当前运输时效'},
 fa:{headline:'از مرزها می‌گذریم،\nدر مسیر جاده ابریشم.',eyebrow:'KHORGOS / چین — ایران',intro:'حمل زمینی از مسیر آسیای میانه، با تحویل در گمرک مقصد ایران.',routes:'مشاهده مسیرها',network:'دو گذرگاه، یک مسیر زمینی.',corridor:'خورگوس ← قزاقستان ← ازبکستان ← ترکمنستان ← ایران',map:'تصویر نمایشی مسیر؛ مرجع دقیق جغرافیایی نیست.',services:'راهکار حمل برای محموله شما.',titles:['حمل جاده‌ای به ایران','ترانزیت آسیای میانه','تجمیع بار در چین'],desc:['تحویل به گمرک غرب تهران، آپرین یا مشهد با شرایط CPT / DAP.','از خورگوس و قزاقستان یا ووچیا و قرقیزستان، سپس ازبکستان و ترکمنستان.','تجمیع بار در ایوو، شنژن، گوانگژو و شانگهای، آماده‌سازی صادرات و بارگیری.'],details:'اطلاعات بیشتر',border:'در مرز، هر جزئیاتی اهمیت دارد.',borderCopy:'تشریفات صادرات، بازرسی کالا و پلمپ TIR آغاز مسیر بین‌المللی است. مسیر خورگوس از قزاقستان، ازبکستان و ترکمنستان به ایران می‌رسد. زمان حمل فعلی را استعلام کنید.',borderLink:'اسناد و آماده‌سازی',formNote:'این فرم برنامه ایمیل شما را باز می‌کند. پیش از ارسال، متن را بررسی و اسناد را پیوست کنید.',art:'تصویر نمایشی حمل‌ونقل',source:'خدمات و زمان حمل فعلی'}
};
const homeSeo={
 en:{title:'Khorgos to Iran TIR Road Freight via Kazakhstan | khorgosirantruck',description:'China-to-Iran TIR road freight through Khorgos, Kazakhstan, Uzbekistan and Turkmenistan, with CPT/DAP delivery to destination customs in Iran. Current transit schedule available by quote.',facts:['Exit China through Khorgos into Kazakhstan.','Continue through Uzbekistan and Turkmenistan to Iran.','Deliver to Tehran West Customs, Aprin or Mashhad under CPT / DAP terms.','Khorgos transit time is quoted for the current shipment; no fixed day range is published.'],faq:[['What is the Khorgos route?','Khorgos → Kazakhstan → Uzbekistan → Turkmenistan → Iran. The destination is the nominated customs terminal in Tehran, Aprin or Mashhad.'],['How long does Khorgos-to-Iran trucking take?','Ask for the current schedule with your origin, destination and cargo data. We do not publish an unsupported fixed day range for the Khorgos corridor.'],['Does the Kyrgyzstan 0.4% transit tax apply?','No. That tax is specific to the Wuqia route through Kyrgyzstan; the Khorgos route runs through Kazakhstan.']]},
 zh:{title:'霍尔果斯至伊朗 TIR 公路运输｜经哈萨克斯坦中亚通道 | khorgosirantruck',description:'中国经霍尔果斯、哈萨克斯坦、乌兹别克斯坦和土库曼斯坦至伊朗的 TIR 公路运输，按 CPT/DAP 交付伊朗目的地海关；霍尔果斯线当前时效按票询价。',facts:['从霍尔果斯出境，进入哈萨克斯坦。','经乌兹别克斯坦、土库曼斯坦进入伊朗。','按 CPT / DAP 交付德黑兰西关、阿普林或马什哈德海关。','霍尔果斯线时效按当前货物单独询价，不发布未经确认的固定天数。'],faq:[['霍尔果斯至伊朗的路线是什么？','霍尔果斯 → 哈萨克斯坦 → 乌兹别克斯坦 → 土库曼斯坦 → 伊朗，交付德黑兰、阿普林或马什哈德目的地海关。'],['霍尔果斯至伊朗需要多少天？','请提供始发地、目的海关和货物数据，获取当前班次与时效。本站不发布缺乏依据的霍尔果斯固定天数。'],['吉尔吉斯斯坦 0.4% 过境税适用于霍尔果斯线吗？','不适用。该税仅与经吉尔吉斯斯坦的乌恰线相关；霍尔果斯线经哈萨克斯坦。']]},
 fa:{title:'حمل TIR از خورگوس به ایران از مسیر قزاقستان | khorgosirantruck',description:'حمل جاده‌ای TIR از چین به ایران از مسیر خورگوس، قزاقستان، ازبکستان و ترکمنستان با تحویل CPT/DAP در گمرک مقصد؛ برنامه زمانی مسیر خورگوس با استعلام اعلام می‌شود.',facts:['خروج از چین در خورگوس و ورود به قزاقستان.','ادامه مسیر از ازبکستان و ترکمنستان به ایران.','تحویل CPT / DAP در گمرک غرب تهران، آپرین یا مشهد.','زمان مسیر خورگوس برای هر محموله استعلام می‌شود و بازه ثابت منتشر نمی‌کنیم.'],faq:[['مسیر خورگوس به ایران چیست؟','خورگوس ← قزاقستان ← ازبکستان ← ترکمنستان ← ایران، با تحویل در گمرک مقصد تهران، آپرین یا مشهد.'],['حمل از خورگوس تا ایران چند روز طول می‌کشد؟','مبدأ، گمرک مقصد و مشخصات بار را بفرستید تا برنامه فعلی اعلام شود. برای مسیر خورگوس عدد ثابت و تأییدنشده منتشر نمی‌کنیم.'],['آیا عوارض ۰٫۴٪ قرقیزستان برای مسیر خورگوس اعمال می‌شود؟','خیر. این عوارض فقط به مسیر ووچیا از قرقیزستان مربوط است؛ مسیر خورگوس از قزاقستان می‌گذرد.']]}
};
const make=(d,html)=>{const t=d.createElement('template');t.innerHTML=html;return t.content.firstElementChild;};
const picture=(file,w,h,cls='')=>`<img class="${cls}" src="${base}/${file}" width="${w}" height="${h}" loading="lazy" decoding="async" alt="">`;
export function redesign(d,{lang,isHome,root,c,domain,route}){
 const t=copy[lang],main=d.querySelector('main');
 d.querySelector('.footer-route').textContent={fa:'چین ← آسیای میانه ← ایران',zh:'中国 → 中亚 → 伊朗',en:'CHINA → CENTRAL ASIA → IRAN'}[lang];
 d.querySelector('.footer-route').setAttribute('dir',lang==='fa'?'rtl':'ltr');
 for(const fig of d.querySelectorAll('.fig'))fig.innerHTML=fig.innerHTML.replace(/([۰-۹0-9]+[–—][۰-۹0-9]+)/g,'<bdi dir="ltr">$1</bdi>');
 const prefix=lang==='fa'?'':`/${lang}`;
 const article=name=>`${prefix}/articles/${name}/`;
 d.querySelector('header .home-link').innerHTML=`<img class="brand-logo" src="${base}/logo/khorgos-logo-horizontal.svg" width="920" height="220" alt="KHORGOS Iran Truck">`;
 d.querySelector('.footer-top>a').innerHTML=`<img class="brand-logo" src="${base}/logo/khorgos-logo-reverse.svg" width="920" height="220" alt="KHORGOS Iran Truck">`;
 d.querySelector('link[rel="icon"]').setAttribute('href',`${base}/logo/favicon.svg`);
 d.head.append(make(d,`<meta name="theme-color" content="#1F3A5F">`));
 if(domain){
  for(const [prop,value] of [['og:url',domain+route],['og:image',domain+base+'/hero/hero-main.webp'],['og:image:width','1983'],['og:image:height','793']])d.head.append(make(d,`<meta property="${prop}" content="${value}">`));
  d.querySelector('meta[name="twitter:card"]')?.setAttribute('content','summary_large_image');
 }
 d.querySelector('.footer-top').after(make(d,`<div class="footer-contacts"><a dir="ltr" href="https://wa.me/8615876207182">WhatsApp +86 15876207182</a><a dir="ltr" href="mailto:sales@khorgosirantruck.com">sales@khorgosirantruck.com</a></div>`));
 if(isHome){
  const seo=homeSeo[lang];
  d.title=seo.title;
  d.querySelector('meta[name="description"]')?.setAttribute('content',seo.description);
  d.querySelector('meta[property="og:title"]')?.setAttribute('content',seo.title);
  d.querySelector('meta[property="og:description"]')?.setAttribute('content',seo.description);
  d.querySelector('meta[name="twitter:title"]')?.setAttribute('content',seo.title);
  d.querySelector('meta[name="twitter:description"]')?.setAttribute('content',seo.description);
  const hero=d.querySelector('.home-hero');
  hero.querySelector('.hero-visual').innerHTML=`<img src="${base}/hero/hero-main.webp" width="1983" height="793" alt="" fetchpriority="high" decoding="async">`;
  const oldTitle=hero.querySelector('h1');
  oldTitle.innerHTML=t.headline.replace('\n','<br>');
  hero.querySelector('.eyebrow').textContent=t.eyebrow;
  hero.querySelector('.eyebrow').removeAttribute('dir');
  hero.querySelector('.hero-tag').before(make(d,`<p class="hero-intro">${t.intro}</p>`));
  hero.querySelector('.hero-tag')?.remove();
  hero.querySelector('.hero-actions').innerHTML=`<a class="btn" href="#quote">${c.contact} <span aria-hidden="true">↗</span></a><a class="btn btn-ghost" href="#lanes">${t.routes}</a>`;
  const lanes=d.getElementById('lanes'),wrap=lanes.querySelector('.wrap');
  wrap.innerHTML=`<div class="network-intro"><div><p class="eyebrow">${c.route}</p><h2>${t.network}</h2><p class="corridor">${t.corridor}</p><a class="text-link" href="#quote">${c.contact} <span aria-hidden="true">↗</span></a></div><figure>${picture('map/route-map.webp',1983,793)}<figcaption>${t.map}</figcaption></figure></div><ul class="route-facts">${seo.facts.map(f=>`<li>${f}</li>`).join('')}</ul>`;
  const cardFiles=['iran-route','central-asia-route','xinjiang-warehouse'],targets=['china-to-iran-tir-trucking','central-asia-transit','first-shipment'];
  const cardTargets=['#quote','#lanes','#cargo'];
  const serviceDescriptions=[t.desc[0],{en:'Khorgos through Kazakhstan, Uzbekistan and Turkmenistan, with the current schedule confirmed per shipment.',zh:'霍尔果斯经哈萨克斯坦、乌兹别克斯坦和土库曼斯坦，当前班次与时效按票确认。',fa:'از خورگوس، قزاقستان، ازبکستان و ترکمنستان؛ برنامه فعلی برای هر محموله تأیید می‌شود.'}[lang],t.desc[2]];
  lanes.after(make(d,`<section class="section services" id="services"><div class="wrap"><p class="eyebrow">KHORGOS</p><h2>${t.services}</h2><div class="service-grid">${cardFiles.map((file,i)=>`<article class="service-card">${picture('cards/'+file+'.webp',686,764)}<div><span class="card-index">0${i+1}</span><h3>${t.titles[i]}</h3><p>${serviceDescriptions[i]}</p><a class="text-link" href="${cardTargets[i]}">${t.details}<span aria-hidden="true">↗</span></a></div></article>`).join('')}</div></div></section>`));
  const icons=['warehouse','border-gate','truck','truck','customs-document','delivery-terminal'];
  for(const [i,li]of [...d.querySelectorAll('.timeline>li')].entries())li.prepend(make(d,picture('icons/'+icons[i]+'.svg',40,40,'process-icon')));
  d.getElementById('cargo').after(make(d,`<section class="section border-operations"><div class="wrap border-grid"><figure>${picture('border/border-checkpoint-portrait.webp',1024,1536)}<figcaption>${t.art}</figcaption></figure><div><p class="eyebrow">KHORGOS / TIR</p><h2>${t.border}</h2><p>${t.borderCopy}</p><a class="text-link" href="#quote">${c.contact}<span aria-hidden="true">↗</span></a></div></div></section>`));
  d.querySelectorAll('.stat-band,.badges-sec,#route,#compare,#faq').forEach(e=>e.remove());
  const quote=d.getElementById('quote');
  quote.before(make(d,`<section class="section" id="faq"><div class="wrap"><p class="eyebrow">FAQ / KHORGOS</p><h2>${c.faq}</h2><div class="faq">${seo.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>`));
  const formFile=path.join(root,'source',lang==='fa'?'articles/quote/index.html':`${lang}/articles/quote/index.html`);
  const form=parseHTML(fs.readFileSync(formFile,'utf8')).document.querySelector('form[data-quote-form]');
  const formHtml=form.outerHTML.replaceAll('sales@chinairantrucks.com','sales@khorgosirantruck.com').replaceAll('8613237401856','8615876207182');
  quote.querySelector('.wrap').append(make(d,formHtml));
  quote.querySelector('legend').prepend(make(d,picture('icons/email-quote.svg',40,40,'process-icon')));
  d.body.append(make(d,'<script defer src="/assets/quote-form.js"></script>'));
 }
 // Replace illustrative editorial photos with the supplied curtain-side imagery.
 // Historical shipment records retain their original evidence photographs and captions.
 for(const img of main.querySelectorAll('img')){
  if(img.getAttribute('src')?.startsWith(base)||img.closest('.log-photo'))continue;
  const original=img.getAttribute('src')||'';
  const file=/warehouse|forklift|cargo|pallet|crate|resin/.test(original)?'cards/xinjiang-warehouse.webp':'hero/hero-thumbnail-alt.webp';
  img.setAttribute('src',base+'/'+file);img.removeAttribute('srcset');img.setAttribute('width',file.startsWith('cards')?'686':'1774');img.setAttribute('height',file.startsWith('cards')?'764':'887');img.setAttribute('alt',t.art);
  const pic=img.closest('picture');pic?.querySelectorAll('source').forEach(e=>e.remove());
  const fig=img.closest('figure');if(fig&&!fig.querySelector('.illustration-note'))fig.append(make(d,`<span class="illustration-note">${t.art}</span>`));
 }
 if(!isHome&&!d.body.classList.contains('journal-index')&&!/\/(legal|privacy)\/$/.test(route)){
  const h1=main.querySelector('h1');
  h1.after(make(d,`<figure class="article-banner">${picture(/central-asia|uzbekistan/.test(route)?'cards/central-asia-route.webp':/quote|first-shipment|documents/.test(route)?'cards/xinjiang-warehouse.webp':'hero/hero-thumbnail-alt.webp',/central-asia|uzbekistan|quote|first-shipment|documents/.test(route)?686:1774,/central-asia|uzbekistan|quote|first-shipment|documents/.test(route)?764:887)}<figcaption>${t.art}</figcaption></figure>`));
 }
 for(const form of d.querySelectorAll('form[data-quote-form]')){
  form.setAttribute('aria-describedby','quote-note');
  form.querySelector('fieldset').append(make(d,`<p class="hint" id="quote-note">${t.formNote}</p>`));
 }
}
