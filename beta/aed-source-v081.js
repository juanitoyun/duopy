'use strict';
(() => {
let manifest=null;
const root='https://raw.githubusercontent.com/ivansipiran/AED-Apuntes/';
const github='https://github.com/ivansipiran/AED-Apuntes/blob/';
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
function setManifest(m){if(m.repository!=='ivansipiran/AED-Apuntes'||!/^[0-9a-f]{40}$/.test(m.revision)||!Array.isArray(m.files))throw Error('Índice AED inválido');manifest=m}
function rawUrl(path){return root+manifest.revision+'/'+enc(path)}
function sourceUrl(path){return github+manifest.revision+'/'+enc(path)}
function title(path){const n=path.split('/').pop().replace(/\.ipynb$/,'');return n.normalize('NFC').replace(/_/g,' ')}
async function readNotebook(item){if(!manifest||!item||!manifest.files.some(f=>f.path===item.path&&f.sha===item.sha))throw Error('Notebook no indexado');const res=await fetch(rawUrl(item.path),{mode:'cors'});if(!res.ok)throw Error('AED · HTTP '+res.status);const bytes=new Uint8Array(await res.arrayBuffer());if(bytes.length!==item.size)throw Error('Tamaño del original incorrecto');if(crypto.subtle){const header=new TextEncoder().encode('blob '+bytes.length+'\0'),buf=new Uint8Array(header.length+bytes.length);buf.set(header);buf.set(bytes,header.length);const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1',buf)),b=>b.toString(16).padStart(2,'0')).join('');if(sha!==item.sha)throw Error('Integridad del original incorrecta')}return JSON.parse(new TextDecoder().decode(bytes))}
function resolve(url,source,forImage=false){if(typeof url!=='string')return '';if(url.startsWith('#'))return url;if(/^attachment:/i.test(url))return url;
 const own=url.match(/^https?:\/\/(?:github\.com\/ivansipiran\/AED-Apuntes\/(?:blob|raw)\/|raw\.githubusercontent\.com\/ivansipiran\/AED-Apuntes\/)[^/]+\/([^?#]+)(?:[?#].*)?$/i);
 if(own&&manifest){let path;try{path=decodeURIComponent(own[1])}catch{return ''}return forImage?rawUrl(path):sourceUrl(path)}
 if(/^https?:\/\//i.test(url))return url;
 if(!source||!manifest||/^[a-z][a-z0-9+.-]*:/i.test(url)||url.startsWith('//'))return '';
 try{const u=new URL(url,'https://aed.invalid/'+enc(source));if(u.origin!=='https://aed.invalid')return '';const path=decodeURIComponent(u.pathname.slice(1));if(!manifest.files.some(f=>f.path===path))return '';return forImage?rawUrl(path):sourceUrl(path)+u.hash}catch{return ''}}
function renderMarkdown(src,source,fallback,attachments){if(!window.markdownit)return fallback(src);const div=document.createElement('div');div.className='nb-markdown';const md=window.markdownit({html:false,linkify:true,breaks:false});const formulas=[];
 // Protect TeX from Markdown's escape and emphasis rules. Leave code spans/fences untouched.
 const protectedSource=src.replace(/(\x60\x60\x60[\s\S]*?\x60\x60\x60|\x60[^\x60\n]*\x60)|(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([^\n]+?\\\)|(?<!\\)\$(?!\$)(?:\\.|[^$\n\\])+\$)/g,(match,code,math)=>{if(code)return code;const display=math.startsWith('$$')||math.startsWith('\\[');const trim=math.startsWith('$$')||math.startsWith('\\[')||math.startsWith('\\(')?2:1;const i=formulas.push({tex:math.slice(trim,-trim),display,raw:math})-1;return 'DUOPYMATHPLACEHOLDER'+i+'ENDTOKEN'});
 // Markdown-it disables raw HTML and dangerous URL schemes. Resolve course-relative resources.
 div.innerHTML=md.render(protectedSource);
 for(const a of div.querySelectorAll('a')){const url=resolve(a.getAttribute('href'),source);if(url){a.href=url;if(!url.startsWith('#')){a.target='_blank';a.rel='noopener noreferrer'}}else a.removeAttribute('href')}
 for(const img of div.querySelectorAll('img')){const original=img.getAttribute('src');let url=resolve(original,source,true);if(url.startsWith('attachment:')){const entry=attachments?.[url.slice(11)];const mime=['image/png','image/jpeg','image/gif'].find(m=>entry?.[m]);const data=mime?(Array.isArray(entry[mime])?entry[mime].join(''):entry[mime]):'';url=data&&/^[A-Za-z0-9+/=\s]+$/.test(data)?'data:'+mime+';base64,'+data.replace(/\s/g,''):''}if(!url){img.replaceWith(document.createTextNode(img.alt||'[imagen]'));continue}img.removeAttribute('src');img.crossOrigin='anonymous';img.loading='lazy';img.src=url}
 const walker=document.createTreeWalker(div,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){if(!node.data.includes('DUOPYMATHPLACEHOLDER'))continue;const frag=document.createDocumentFragment();let end=0;for(const m of node.data.matchAll(/DUOPYMATHPLACEHOLDER(\d+)ENDTOKEN/g)){frag.append(document.createTextNode(node.data.slice(end,m.index)));const f=formulas[Number(m[1])];const s=document.createElement('span');if(!f){s.textContent=m[0]}else if(window.katex){try{window.katex.render(f.tex,s,{displayMode:f.display,throwOnError:false,trust:false,strict:'ignore'})}catch{s.textContent=f.raw;s.className='math-fallback'}}else{s.textContent=f.raw;s.className='math-fallback'}frag.append(s);end=m.index+m[0].length}frag.append(document.createTextNode(node.data.slice(end)));node.replaceWith(frag)}
 return div}
window.DuoAED={setManifest,readNotebook,sourceUrl,title,renderMarkdown};
})();
