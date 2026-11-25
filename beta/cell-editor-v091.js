'use strict';
(()=>{
const $=id=>document.getElementById(id);
const stage=$('duoStage'),scene=$('cellEditor'),study=$('notebookDeck'),code=$('ceCode'),ev=$('ceView'),pad=$('cePad');
let session=null,script='',pos=0,anchor=null,undo=[],clip='',mode='edit',layer='abc',shift=false;
let sensitivity=.4,padId=null,lastX=0,lastY=0,targetX=0,targetY=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function updatePosition(){const left=script.slice(0,pos);$('cePosition').textContent=left.split('\n').length+':'+(pos-left.lastIndexOf('\n'))}
function span(text,cls){const el=document.createElement('span');el.textContent=text;if(cls)el.className=cls;return el}
const tokens=/(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|is|import|from|as|pass|break|continue|try|except|finally|raise|with|lambda|assert|True|False|None|yield|del|global|nonlocal)\b|\b\d+(?:\.\d+)?\b)/g;
function tokenClass(s){return s[0]==='#'?'comment':s[0]==='"'||s[0]==="'"?'string':/^\d/.test(s)?'number':'keyword'}
function renderEditor(follow=true){
 const frag=document.createDocumentFragment();let offset=0, caret=null;
 const lo=anchor===null?pos:Math.min(anchor,pos),hi=anchor===null?pos:Math.max(anchor,pos);
 script.split('\n').forEach((line,i)=>{
  const row=document.createElement('span');row.className='line';row.dataset.start=offset;row.dataset.length=line.length;row.append(span(String(i+1),'num'));
  const ranges=[...line.matchAll(tokens)].map(m=>[m.index,m.index+m[0].length,tokenClass(m[0])]);
  const cuts=new Set([0,line.length]);ranges.forEach(r=>{cuts.add(r[0]);cuts.add(r[1])});
  for(const v of [pos,lo,hi])if(v>=offset&&v<=offset+line.length)cuts.add(v-offset);
  const points=[...cuts].sort((a,b)=>a-b);
  for(let j=0;j<points.length;j++){const a=points[j],b=points[j+1];if(mode==='edit'&&offset+a===pos){caret=span('','cursor');row.append(caret)}if(b===undefined)break;const r=ranges.find(t=>a>=t[0]&&a<t[1]);const part=span(line.slice(a,b),(r?r[2]:'')+(offset+a>=lo&&offset+a<hi?' selected':''));part.dataset.offset=offset+a;row.append(part)}
  frag.append(row);offset+=line.length+1;
 });code.replaceChildren(frag);if(follow&&caret)caret.scrollIntoView({block:'nearest',inline:'nearest'});updatePosition()
}
function snapshot(){undo.push([script,pos]);if(undo.length>150)undo.shift()}
function replace(text){if(mode!=='edit')return;snapshot();const a=anchor===null?pos:Math.min(anchor,pos),b=anchor===null?pos:Math.max(anchor,pos);script=script.slice(0,a)+text+script.slice(b);pos=a+text.length;anchor=null;renderEditor();syncClicks()}

function backspace(){if(anchor!==null&&anchor!==pos){replace('');return}if(pos){anchor=pos-1;replace('')}}
function insert(s){replace(s)}
function enter(){const line=script.slice(script.lastIndexOf('\n',pos-1)+1,pos);replace('\n'+(line.match(/^\s*/)||[''])[0]+(line.trimEnd().endsWith(':')?'    ':''))}
function move(dir){
 const start=script.lastIndexOf('\n',pos-1)+1,end=script.indexOf('\n',pos),col=pos-start;
 if(dir==='left')pos=Math.max(0,pos-1);if(dir==='right')pos=Math.min(script.length,pos+1);
 if(dir==='up'&&start>0){const prev=script.lastIndexOf('\n',start-2)+1;pos=prev+Math.min(col,start-1-prev)}
 if(dir==='down'&&end!==-1){const next=script.indexOf('\n',end+1);pos=end+1+Math.min(col,(next===-1?script.length:next)-end-1)}renderEditor();syncClicks()
}

function syncClicks(){$('ceSelect').classList.toggle('on',anchor!==null);$('ceSelect').setAttribute('aria-pressed',String(anchor!==null));$('cePaste').textContent=anchor!==null&&anchor!==pos?'CPY':'PST';$('cePaste').setAttribute('aria-label',anchor!==null&&anchor!==pos?'Copiar':'Pegar');$('ceUndo').disabled=!undo.length}
function selection(){anchor=anchor===null?pos:null;renderEditor();syncClicks()}
function copyPaste(){if(anchor!==null&&anchor!==pos){clip=script.slice(Math.min(anchor,pos),Math.max(anchor,pos));anchor=null;renderEditor();syncClicks();try{navigator.clipboard?.writeText(clip).catch(()=>{})}catch{}}
 else if(clip)replace(clip);else if(navigator.clipboard?.readText){const current=session;navigator.clipboard.readText().then(s=>{if(s&&session===current&&session)replace(s)}).catch(()=>{})}}
const key=(label,value=label,w=1,cls='')=>({label,value,w,cls});
function keyboard(){
 const letters=layer==='abc'?[...'qwertyuiop']:['+','-','*','/','//','%','**','=','==','!='];
 const mid=layer==='abc'?[...'asdfghjkl']:['<','>','<=','>=','&','|','^','~','@'];
 const low=layer==='abc'?[...'zxcvbnm']:['\\','!','?','#','$',';',':'];
 const chars=a=>a.map(c=>key(shift&&layer==='abc'?c.toUpperCase():c));
 const rows=[
  [...'1234567890'].map(x=>key(x)).concat(key('⌫','back',1.4,'fn')),
  ['(',')','[',']','{','}',':',',','.','_',"'",'"'].map(x=>key(x)),
  chars(letters).concat(key('TAB','tab',1.3,'aux')),
  chars(mid).concat(key('↵','enter',1.7,'enter')),
  [key('⇧','shift',1.2,'aux'),...chars(low),key(layer==='abc'?'SYM':'ABC','layer',1.5,'fn')],
  [key('def','def ',1,'fn'),key('if','if ',1,'fn'),key('for','for ',1,'fn'),key('',' ',4.3,'space'),key('=','=',1),key('+','+',1),key('-','-',1)]
 ];
 const fragment=document.createDocumentFragment();for(const row of rows){const r=document.createElement('div');r.className='keyrow';for(const k of row){const b=document.createElement('button');b.type='button';b.textContent=k.label;b.className=k.cls;b.style.setProperty('--w',k.w);b.dataset.key=k.value;b.setAttribute('aria-label',k.value===' '?'Espacio':k.label);if(k.value==='shift')b.classList.toggle('on',shift);r.append(b)}fragment.append(r)}$('ceKeyboard').replaceChildren(fragment)
}
function action(k){if(k==='back')backspace();else if(k==='enter')enter();else if(k==='tab')insert('    ');else if(k==='shift'){shift=!shift;keyboard()}else if(k==='layer'){layer=layer==='abc'?'sym':'abc';shift=false;keyboard()}else if(k==='left'||k==='right')move(k);else{insert(k);if(shift&&layer==='abc'&&/^[A-Z]$/.test(k)){shift=false;keyboard()}}}
$('ceKeyboard').addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(b)action(b.dataset.key)});

scene.querySelectorAll('[data-cell-move]').forEach(b=>b.onclick=()=>move(b.dataset.cellMove));
$('ceSelect').onclick=selection;$('cePaste').onclick=copyPaste;
$('ceUndo').onclick=()=>{if(undo.length){[script,pos]=undo.pop();anchor=null;renderEditor();syncClicks()}};
document.addEventListener('keydown',e=>{if(!session||e.isComposing||e.target.tagName==='INPUT')return;if(e.key==='Escape'){e.preventDefault();finish(false);return}if(e.ctrlKey||e.metaKey){if(e.key.toLowerCase()==='z'){e.preventDefault();$('ceUndo').click()}return}
 if(e.key.startsWith('Arrow')){e.preventDefault();if(!e.repeat)move(e.key.slice(5).toLowerCase())}else if(e.key==='Enter'){e.preventDefault();enter()}else if(e.key==='Backspace'){e.preventDefault();backspace()}else if(e.key==='Tab'&&e.target.tagName!=='BUTTON'){e.preventDefault();insert('    ')}else if(e.key.length===1&&!e.altKey){e.preventDefault();insert(e.key)}});
document.addEventListener('paste',e=>{if(!session||e.target.tagName==='INPUT')return;const s=e.clipboardData?.getData('text/plain');if(s!==undefined){e.preventDefault();insert(s)}});
function cancelPad(){const id=padId;padId=null;pad.classList.remove('dragging');if(id!==null&&pad.hasPointerCapture(id))pad.releasePointerCapture(id)}
pad.addEventListener('pointerdown',e=>{if(!session||padId!==null||e.button!==0)return;e.preventDefault();padId=e.pointerId;lastX=e.clientX;lastY=e.clientY;targetX=ev.scrollLeft;targetY=ev.scrollTop;pad.setPointerCapture(padId);pad.classList.add('dragging')});
pad.addEventListener('pointermove',e=>{if(e.pointerId!==padId)return;e.preventDefault();targetX=clamp(targetX-(e.clientX-lastX)*sensitivity,0,Math.max(0,ev.scrollWidth-ev.clientWidth));targetY=clamp(targetY-(e.clientY-lastY)*sensitivity,0,Math.max(0,ev.scrollHeight-ev.clientHeight));lastX=e.clientX;lastY=e.clientY;ev.scrollLeft=targetX;ev.scrollTop=targetY});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>pad.addEventListener(n,e=>{if(e.pointerId===padId)cancelPad()}));
window.addEventListener('blur',cancelPad);window.addEventListener('resize',cancelPad);
pad.addEventListener('wheel',e=>{e.preventDefault();const factor=e.deltaMode===1?parseFloat(getComputedStyle(ev).lineHeight):e.deltaMode===2?ev.clientHeight:1;ev.scrollBy(e.deltaX*factor*sensitivity,e.deltaY*factor*sensitivity)},{passive:false});
scene.addEventListener('contextmenu',e=>{if(!e.target.closest('.viewport'))e.preventDefault()});
scene.addEventListener('selectstart',e=>{if(!e.target.closest('.viewport'))e.preventDefault()});
function open(config){
 if(session||stage.dataset.page!=='notebook')return false;
 session=config;script=config.source;pos=0;anchor=null;undo=[];clip='';layer='abc';shift=false;
 try{const n=Number(localStorage.getItem('duopy.scroll.sensitivity'));sensitivity=[.4,.7,1,1.4,2,3].includes(n)?n:.4}catch{sensitivity=.4}
 $('ceTitle').textContent=config.title+' · '+(config.kind==='code'?'Python':config.kind==='markdown'?'Markdown':'Texto');$('ceGlyph').textContent=config.kind==='code'?'.py':'.md';
 ev.scrollTop=0;ev.scrollLeft=0;keyboard();renderEditor(false);syncClicks();
 document.activeElement?.blur();study.inert=true;study.setAttribute('aria-hidden','true');scene.inert=false;scene.setAttribute('aria-hidden','false');stage.classList.add('cell-edit-open');return true
}
function finish(apply){if(!session)return;const current=session,value=script;session=null;cancelPad();document.activeElement?.blur();scene.inert=true;scene.setAttribute('aria-hidden','true');study.inert=false;study.setAttribute('aria-hidden','false');stage.classList.remove('cell-edit-open');script='';pos=0;anchor=null;undo=[];clip='';code.replaceChildren();if(apply)current.apply(value)}
$('ceApply').onclick=()=>finish(true);$('ceCancel').onclick=()=>finish(false);
window.DuoCellEditor={open,get active(){return session!==null}};
})();
