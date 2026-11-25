'use strict';
const CDN='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let py,ns,channel,ready,decoder=new TextDecoder(),count=0;
const packageOptions={messageCallback:text=>send('progress',String(text)),errorCallback:text=>{send('progress',String(text));console.warn(text)}};
let studyLoading=false;
function send(type,text){postMessage({type,text})}
function write(bytes){
 if(studyLoading){return bytes.length}
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
 if(m.type!=='script'&&m.type!=='repl'&&m.type!=='cell')return;
 let ok=true;
 try{await ready;count=0;decoder=new TextDecoder();if(m.type==='script'||m.isolated)reset();
 // Standard library is bundled; supported external packages can be loaded on demand.
 let executable=m.code;
 if(m.type==='cell'){studyLoading=true;const lines=executable.split('\n');const kept=[];for(const line of lines){if(/^!pip install (?:--upgrade )?aed[-_]utilities\s*$/.test(line.trim())){await py.loadPackage('micropip',packageOptions);await py.runPythonAsync("import micropip\nawait micropip.install('aed-utilities')");send('out','aed-utilities instalado\n');continue}if(/^%matplotlib inline\s*$/.test(line.trim())){await py.loadPackage('matplotlib',packageOptions);await py.runPythonAsync("import matplotlib\nmatplotlib.use('Agg')");continue}if(/^%pylab inline\s*$/.test(line.trim())){await py.loadPackage(['numpy','matplotlib'],packageOptions);kept.push("import matplotlib\nmatplotlib.use('Agg')\nfrom numpy import *\nfrom matplotlib.pyplot import *\nimport numpy as np\nimport matplotlib.pyplot as plt");continue}kept.push(line)}executable=kept.join('\n')}
 await py.loadPackagesFromImports(executable,m.type==='cell'?packageOptions:{});
 studyLoading=false;
 if(m.type==='cell'){
  // Use a headless backend before importing pyplot. The browser backend needs a DOM.
  if('matplotlib' in py.loadedPackages||'matplotlib-pyodide' in py.loadedPackages){
   py.runPython("import matplotlib as _duo_mpl\n_duo_mpl.use('Agg', force=True)\nimport matplotlib.pyplot as _duo_plt\n_duo_plt.show=lambda *a, **k: None");
  }
  if(m.course&&!py.FS.analyzePath(py.FS.cwd()+'/cap1.txt').exists&&/\bcap1\.txt\b/.test(executable)){const r=await fetch('https://raw.githubusercontent.com/ivansipiran/AED-Apuntes/7d8ef60e45a1923f855b5777b60696b074a7a445/recursos/cap1.txt');if(r.ok){const bytes=new Uint8Array(await r.arrayBuffer());py.FS.writeFile('cap1.txt',bytes)}}
  // Capture IPython rich display and Graphviz source when the Python package is available.
  if(/aed_utilities|IPython|graphviz/.test(executable)){try{await py.loadPackage('micropip');await py.runPythonAsync("import micropip\nimport importlib.util\nif importlib.util.find_spec('IPython') is None:\n    await micropip.install('ipython')")}catch(e){send('out','[IPython opcional: '+String(e)+']\n')}}
  await py.runPythonAsync("import sys as _s, importlib.util as _iu\nif _iu.find_spec('IPython') is not None:\n    import IPython.display as _d\n    from js import postMessage as _post\n    from pyodide.ffi import to_js as _to_js\n    def _duo_display(*objects, **kwargs):\n        for obj in objects:\n            try:\n                src=getattr(obj,'source',None)\n                if isinstance(src,str):\n                    _post(_to_js({'type':'dot','data':src,'engine':getattr(obj,'engine','dot')},dict_converter=__import__('js').Object.fromEntries)); continue\n                method=getattr(obj,'_repr_svg_',None)\n                svg=method() if callable(method) else None\n                if isinstance(svg,tuple): svg=svg[0]\n                if not svg:\n                    data=getattr(obj,'data',None)\n                    if isinstance(data,str) and '<svg' in data: svg=data\n                if isinstance(svg,str) and '<svg' in svg:\n                    _post(_to_js({'type':'svg','data':svg},dict_converter=__import__('js').Object.fromEntries)); continue\n                print(str(obj))\n            except Exception as e: print('[Visualización]',e)\n    _d.display=_duo_display\n    try:\n        import IPython.core.display_functions as _df\n        _df.display=_duo_display\n    except ImportError: pass");
 }
 const result=await py.runPythonAsync(executable,{globals:ns,filename:m.type==='script'?(m.filename||'programa.py'):'<console>'});
 if((m.type==='repl'||m.type==='cell')&&result!==undefined){if(result===null){}else if(typeof result==='object'&&typeof result.destroy==='function'){ns.set('__duopy_result__',result);try{py.runPython('print(repr(__duopy_result__))',{globals:ns})}finally{ns.delete('__duopy_result__')}}else{ns.set('__duopy_result__',result);try{py.runPython('print(repr(__duopy_result__))',{globals:ns})}finally{ns.delete('__duopy_result__')}}}
 if(result&&typeof result.destroy==='function')result.destroy();
 if(m.type==='cell'){for(const [key,type] of [['__eywa_svg','svg'],['__eywa_dot','dot']]){try{if(!ns.has(key))continue;const value=ns.get(key);if(typeof value==='string'&&value.length<4000000)postMessage({type,data:value});else if(value&&typeof value.destroy==='function')value.destroy();ns.delete(key)}catch{}}}

 if(m.type==='cell'){try{const figs=JSON.parse(py.runPython("import sys as _s, json as _j, io as _io, base64 as _b\n_duo_imgs=[]\nif 'matplotlib.pyplot' in _s.modules:\n    _p=_s.modules['matplotlib.pyplot']\n    for _n in _p.get_fignums()[:8]:\n        _buf=_io.BytesIO()\n        _p.figure(_n).savefig(_buf,format='png',dpi=110,bbox_inches='tight')\n        _duo_imgs.append(_b.b64encode(_buf.getvalue()).decode('ascii'))\n    _p.close('all')\n_j.dumps(_duo_imgs)"));for(const data of figs){if(data.length<8000000)postMessage({type:'image',data})}}catch(e){send('out','[Gráfico no disponible: '+String(e)+']\n')}}
 }catch(err){studyLoading=false;ok=false;send('out',String(err)+'\n')}finally{studyLoading=false;const rest=decoder.decode();if(rest)send('out',rest);reportMeta();postMessage({type:'done',ok})}
};
