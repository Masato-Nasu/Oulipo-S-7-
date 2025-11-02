(()=>{
const keyEl=document.getElementById('key');
const srcEl=document.getElementById('src');
const dstEl=document.getElementById('dst');
const stat=document.getElementById('stat');
const inputFile=document.getElementById('dictFile');
const loadBtn=document.getElementById('loadBtn');

const nkfc=s=>{try{return s.normalize('NFKC')}catch{return s}};

let dictRaw=[], dict=[], indexObj={}, ready=false;

const FALLBACK = `私
喫茶店
で
コーヒー
を
飲み
ながら
新聞
読んだ
合歓木
終日
三途
在りて`;

let worker=null;
function buildWithWorker(words){
  return new Promise((resolve,reject)=>{
    worker = worker || new Worker('worker.js');
    worker.onmessage = (e)=>{
      const {ok, dictRaw:dr, dict:d, index} = e.data||{};
      if(!ok) return reject(new Error('worker failed'));
      dictRaw = dr; dict = d; indexObj = index; ready=true;
      resolve();
    };
    worker.onerror = (e)=>reject(e);
    worker.postMessage({cmd:'build', payload:{words}});
  });
}

function tokenizeByDictMaxMatch(s){
  const MAXLEN = 24;
  const out=[]; let i=0, N=s.length;
  while(i<N){
    const ch=s[i];
    if(/\s/.test(ch)){ out.push(ch); i++; continue; }
    let matched=null, mlen=0;
    const limit=Math.min(N,i+MAXLEN);
    for(let j=limit;j>i;j--){
      const piece=s.slice(i,j);
      if(indexObj[nkfc(piece)]!==undefined){ matched=piece; mlen=j-i; break; }
    }
    if(matched){ out.push(matched); i+=mlen; }
    else { out.push(s[i]); i++; }
  }
  return out;
}

function shiftOnce(text,k){
  if(!ready){ return text; }
  const toks = tokenizeByDictMaxMatch(text);
  let hit=0;
  const n=dict.length;
  const km=((k%n)+n)%n;
  const out=toks.map(tok=>{
    const id = indexObj[nkfc(tok)];
    if(id!==undefined){ hit++; return dictRaw[(id+km)%n]; }
    return tok;
  }).join('');
  stat.textContent = `match ${hit}/${toks.length} tokens | dict=${n}`;
  return out;
}

async function readFileAsText(file){
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const isGz = bytes.length>=2 && bytes[0]===0x1f && bytes[1]===0x8b;
  if(isGz){
    if('DecompressionStream' in window){
      const ds = new DecompressionStream('gzip');
      const blob = new Blob([bytes]);
      const stream = blob.stream().pipeThrough(ds);
      const text = await new Response(stream).text();
      return text;
    }else{
      alert('gzip展開が未対応のブラウザです。txtに変換して読み込んでください。');
      throw new Error('gzip not supported');
    }
  }else{
    return new TextDecoder('utf-8',{fatal:false}).decode(bytes);
  }
}

async function handleLoad(){
  const f = inputFile.files && inputFile.files[0];
  if(!f){ alert('辞書ファイル（.txt/.gz）を選択してください。'); return; }
  stat.textContent='loading dictionary...';
  try{
    const text = await readFileAsText(f);
    const words = text.split(/\r?\n/).filter(Boolean);
    await buildWithWorker(words);
    stat.textContent = `辞書読み込み完了：${dict.length.toLocaleString()}語`;
  }catch(e){
    console.error(e);
    stat.textContent='load failed';
    alert('辞書読み込みに失敗しました。ファイル形式を確認してください。');
  }
}

document.getElementById('shiftBtn').addEventListener('click',()=>{
  const k=parseInt(keyEl.value,10)||0;
  dstEl.value = shiftOnce(srcEl.value||'', k);
});
document.getElementById('sampleBtn').addEventListener('click',()=>{
  srcEl.value = '合歓木の　在りて終日　三途にて';
  stat.textContent='sample loaded';
});
loadBtn.addEventListener('click', handleLoad);

buildWithWorker(FALLBACK.split(/\r?\n/)).then(()=>{
  stat.textContent = `辞書読み込み完了：${String(dict.length)}語（デモ）`;
}).catch(()=>{
  stat.textContent='init failed';
});

try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}
})();