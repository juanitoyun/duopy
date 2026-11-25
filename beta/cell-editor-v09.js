'use strict';
(()=>{
const $=id=>document.getElementById(id);
const stage=$('duoStage'),scene=$('cellEditor'),study=$('notebookDeck'),area=$('ceText'),gutter=$('ceGutter'),pad=$('cePad');
let session=null,layer='abc',shift=false,undo=[],mark=null,clip='',native=false,last=null,pointer=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(v,b));
function snapshot(){return {text:area.value,start:area.selectionStart,end:area.selectionEnd,direction:area.selectionDirection}}
function push(s=snapshot()){const prev=undo[undo.length-1];if(!prev||prev.text!==s.text||prev.start!==s.start||prev.end!==s.end){undo.push(s);if(undo.length>150)undo.shift()}}
function render(){
 const value=area.value,lines=value.split('\n'),point=area.selectionDirection==='backward'?area.selectionStart:area.selectionEnd;
 gutter.textContent=lines.map((_,i)=>String(i+1)).join('\n');gutter.scrollTop=area.scrollTop;
 const left=value.slice(0,point),line=left.split('\n').length,col=point-(left.lastIndexOf('\n')+1)+1;
 $('cePosition').textContent=line+':'+col;$('ceUndo').disabled=!undo.length;
 $('ceSelect').setAttribute('aria-pressed',String(mark!==null));$('ceSelect').classList.toggle('on',mark!==null);
 $('cePaste').textContent=area.selectionStart!==area.selectionEnd?'CPY':'PST';last=snapshot();
}
function caretVisible(){
 const style=getComputedStyle(area),lh=parseFloat(style.lineHeight)||18;
 const pos=area.selectionDirection==='backward'?area.selectionStart:area.selectionEnd;
 const before=area.value.slice(0,pos),row=before.split('\n').length-1,col=before.length-before.lastIndexOf('\n')-1;
 const y=row*lh, x=col*parseFloat(style.fontSize)*.62;
 if(y<area.scrollTop)area.scrollTop=y;else if(y+lh>area.scrollTop+area.clientHeight-8)area.scrollTop=y+lh-area.clientHeight+8;
 if(x<area.scrollLeft)area.scrollLeft=x;else if(x+16>area.scrollLeft+area.clientWidth)area.scrollLeft=x+16-area.clientWidth;
 gutter.scrollTop=area.scrollTop;
}
function replace(text,start=area.selectionStart,end=area.selectionEnd){
 if(!session)return;push();area.setRangeText(text,start,end,'end');mark=null;render();caretVisible()
}
function backspace(){let a=area.selectionStart,b=area.selectionEnd;if(a===b){if(!a)return;const prev=Array.from(area.value.slice(0,a)).pop()||'';a-=prev.length}replace('',a,b)}
function enter(){const p=area.selectionStart,line=area.value.slice(area.value.lastIndexOf('\n',p-1)+1,p);const indent=session.kind==='code'?((line.match(/^\s*/)||[''])[0]+(line.trimEnd().endsWith(':')?'    ':'')):'';replace('\n'+indent)}
function move(dir){
 if(!session)return;
 const s=area.value,a=area.selectionStart,b=area.selectionEnd;let p=area.selectionDirection==='backward'?a:b;
 if(mark===null&&a!==b&&(dir==='left'||dir==='right'))p=dir==='left'?a:b;
 else if(dir==='left')p-=Array.from(s.slice(0,p)).pop()?.length||0;
 else if(dir==='right')p+=Array.from(s.slice(p))[0]?.length||0;
 else{const start=s.lastIndexOf('\n',p-1)+1,end=s.indexOf('\n',p),col=p-start;
 if(dir==='up'&&start>0){const prev=s.lastIndexOf('\n',start-2)+1;p=prev+Math.min(col,start-1-prev)}
 if(dir==='down'&&end!==-1){const next=s.indexOf('\n',end+1);p=end+1+Math.min(col,(next===-1?s.length:next)-end-1)}}
 p=clamp(p,0,s.length);if(mark===null)area.setSelectionRange(p,p);else area.setSelectionRange(Math.min(mark,p),Math.max(mark,p),p<mark?'backward':'forward');render();caretVisible()
}
function restore(){if(!undo.length)return;const v=undo.pop();area.value=v.text;area.setSelectionRange(v.start,v.end,v.direction);mark=null;render();caretVisible()}
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

function action(k){if(!session)return;if(k==='back')backspace();else if(k==='enter')enter();else if(k==='tab')replace('    ');else if(k==='shift'){shift=!shift;keyboard()}else if(k==='layer'){layer=layer==='abc'?'sym':'abc';shift=false;keyboard()}else{replace(k);if(shift&&layer==='abc'&&/^[A-Z]$/.test(k)){shift=false;keyboard()}}}
$('ceKeyboard').addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(b)action(b.dataset.key)});
scene.querySelectorAll('[data-cell-move]').forEach(b=>b.onclick=()=>move(b.dataset.cellMove));
scene.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&e.target.id!=='ceNative')e.preventDefault()});
$('ceUndo').onclick=restore;
$('ceSelect').onclick=()=>{if(!session)return;mark=mark===null?area.selectionEnd:null;render()};
$('cePaste').onclick=async()=>{if(!session)return;if(area.selectionStart!==area.selectionEnd){clip=area.value.slice(area.selectionStart,area.selectionEnd);mark=null;area.setSelectionRange(area.selectionEnd,area.selectionEnd);render();try{await navigator.clipboard?.writeText(clip)}catch{}}else if(clip)replace(clip);else{const token=session;try{const t=await navigator.clipboard?.readText();if(t&&session===token)replace(t)}catch{}}};
$('ceNative').onclick=()=>{native=!native;area.inputMode=native?'text':'none';$('ceNative').setAttribute('aria-pressed',String(native));$('ceNative').classList.toggle('on',native);if(native){area.blur();area.focus()}else area.blur()};
area.addEventListener('beforeinput',()=>{if(session)push()});
area.addEventListener('input',()=>{mark=null;render()});
area.addEventListener('select',()=>{if(session)render()});
area.addEventListener('click',()=>{mark=null;render()});
area.addEventListener('scroll',()=>{gutter.scrollTop=area.scrollTop});
area.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='Tab'){e.preventDefault();replace('    ')}else if(e.key==='Enter'&&!native){e.preventDefault();enter()}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();restore()}});
scene.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.isComposing){e.preventDefault();finish(false)}});
pad.addEventListener('pointerdown',e=>{if(pointer||e.button!==0)return;e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY};pad.setPointerCapture(e.pointerId);pad.classList.add('dragging')});
pad.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();area.scrollLeft-=(e.clientX-pointer.x)*.4;area.scrollTop-=(e.clientY-pointer.y)*.4;pointer.x=e.clientX;pointer.y=e.clientY});
function release(){if(!pointer)return;const id=pointer.id;pointer=null;pad.classList.remove('dragging');if(pad.hasPointerCapture(id))pad.releasePointerCapture(id)}
for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,release);
window.addEventListener('blur',release);
function open(config){
 if(session||stage.dataset.page!=='notebook')return false;
 session=config;undo=[];mark=null;clip='';native=false;layer='abc';shift=false;
 $('ceTitle').textContent=config.title+' · '+(config.kind==='code'?'Python':config.kind==='markdown'?'Markdown':'Texto');
 area.value=config.source;area.inputMode='none';$('ceNative').setAttribute('aria-pressed','false');$('ceNative').classList.remove('on');
 area.setSelectionRange(0,0);area.scrollTop=0;area.scrollLeft=0;keyboard();render();
 document.activeElement?.blur();study.inert=true;study.setAttribute('aria-hidden','true');scene.inert=false;scene.setAttribute('aria-hidden','false');stage.classList.add('cell-edit-open');return true
}
function finish(apply){if(!session)return;const current=session,value=area.value;session=null;release();area.blur();scene.inert=true;scene.setAttribute('aria-hidden','true');study.inert=false;study.setAttribute('aria-hidden','false');stage.classList.remove('cell-edit-open');area.value='';undo=[];mark=null;clip='';if(apply)current.apply(value)}
$('ceApply').onclick=()=>finish(true);$('ceCancel').onclick=()=>finish(false);
window.DuoCellEditor={open,get active(){return session!==null}};
})();
