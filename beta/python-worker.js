'use strict';
const CDN='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let py,ns,channel,ready,decoder=new TextDecoder(),count=0;
function send(type,text){postMessage({type,text})}
function write(bytes){
 if(count<100000){const n=Math.min(bytes.length,100000-count);const s=decoder.decode(bytes.subarray(0,n),{stream:true});if(s)send('out',s);count+=n;if(count>=100000)send('out','\n[output limit]\n')}
 return bytes.length;
}
function stdin(){
 if(!channel){send('out','\n[input() requiere abrir DuoPy directamente en HTTPS y recargar]\n');return null}
 const state=new Int32Array(channel,0,2);Atomics.store(state,0,0);send('input');
 while(Atomics.load(state,0)===0)Atomics.wait(state,0,0);
 const len=Atomics.load(state,1);return new TextDecoder().decode(new Uint8Array(channel,8,len))+'\n';
}
function reset(){if(ns)ns.destroy();ns=py.toPy({});ns.set('__name__','__main__')}
function reportMeta(){try{const data=JSON.parse(py.runPython("import sys, json, importlib.util\njson.dumps({'version':sys.version.split()[0], 'modules':[m for m in ('math','random','statistics','itertools','functools','collections','heapq','bisect','re','json','datetime','operator','sys','os') if importlib.util.find_spec(m) is not None]})"));data.cwd=py.FS.cwd();data.packages=Object.keys(py.loadedPackages||{}).sort();postMessage({type:'meta',meta:data})}catch{}}
async function init(){importScripts(CDN+'pyodide.js');py=await loadPyodide({indexURL:CDN});py.setStdout({write});py.setStderr({write});py.setStdin({stdin});reset();reportMeta();send('ready')}
onmessage=async e=>{const m=e.data;
 if(m.type==='init'){channel=m.channel;ready=init();try{await ready}catch(err){send('fatal',String(err))}return}
 if(m.type!=='script'&&m.type!=='repl')return;
 try{await ready;count=0;decoder=new TextDecoder();if(m.type==='script')reset();
 // Standard library is bundled; supported external packages can be loaded on demand.
 await py.loadPackagesFromImports(m.code);
 const result=await py.runPythonAsync(m.code,{globals:ns,filename:m.type==='script'?(m.filename||'programa.py'):'<console>'});
 if(m.type==='repl'&&result!==undefined){if(result===null){}else if(typeof result==='object'&&typeof result.destroy==='function'){ns.set('__duopy_result__',result);try{py.runPython('print(repr(__duopy_result__))',{globals:ns})}finally{ns.delete('__duopy_result__')}}else{ns.set('__duopy_result__',result);try{py.runPython('print(repr(__duopy_result__))',{globals:ns})}finally{ns.delete('__duopy_result__')}}}
 if(result&&typeof result.destroy==='function')result.destroy();
 }catch(err){send('out',String(err)+'\n')}finally{const rest=decoder.decode();if(rest)send('out',rest);reportMeta();send('done')}
};
