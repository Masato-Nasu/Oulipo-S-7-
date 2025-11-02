(()=>{
const keyEl = document.getElementById('key');
const srcEl = document.getElementById('src');
const dstEl = document.getElementById('dst');
const stat  = document.getElementById('stat');
const dictFile = document.getElementById('dictFile');
const loadBtn  = document.getElementById('loadBtn');

// ===== Embedded base dictionary =====
const BASE_DICT_TEXT = `は
が
に
を
で
と
も
や
から
まで
より
へ
の
だ
です
ます
する
した
して
いる
いない
そして
また
しかし
など
この
その
あの
私
あなた
人
世界
宇宙
真空
空
有
無
存在
量子
ビット
始まり
終わり
永遠
揺らぎ
川
三途
合歓木
缶
カニ缶
作品
芸術
詩
言葉
意味
時間
情報
神
仏
彼岸
此岸
境界
光
闇
夢
眠り
目覚め
花
葉
開く
閉じる
読む
読んだ
新聞
喫茶店
コーヒー
飲む
飲み
ながら
綺麗
洗う
内側
外側
ラベル
張る
張り直す
蓋
はんだ
付け直す
説明
面白い
思う
考える
表す
示す
記号
数
一
零
一つ
無数
永劫
神道
八百万
素材
同じ
違う
塊
連続
離散
観測
観察
可能
不可能
隣り合わせ
存在する
存在しない
作る
作った
描く
描いた
作りました`;

const nkfc = s => { try { return s.normalize('NFKC'); } catch { return s; } };

let dictRaw=[], dict=[], indexObj=Object.create(null), ready=false;

// Bootstrap with embedded dict so it "just works"
(function bootstrap(){
  const seen = new Set();
  for(const line of BASE_DICT_TEXT.split(/\r?\n/)){
    const w=(line||'').trim(); if(!w) continue;
    const n=nkfc(w); if(seen.has(n)) continue;
    seen.add(n); dictRaw.push(w); dict.push(n);
  }
  dict.forEach((w,i)=>{ if(indexObj[w]===undefined) indexObj[w]=i; });
  ready = true;
  stat.textContent = `辞書：${dict.length}語（埋め込み）`;
})();

// Tokenize by dictionary-priority max match
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
    if(matched){ out.push(matched); i+=mlen; continue; }
    const m = s.slice(i).match(/^([ぁ-んァ-ヶｦ-ﾟー一-龯々〆ヵヶ]+|[A-Za-z]+|[0-9]+)/);
    if(m){ out.push(m[1]); i+=m[1].length; }
    else { out.push(s[i]); i++; }
  }
  return out;
}

// Session-learn for unknown tokens (to guarantee shift)
function learnUnknownTokens(tokens){
  let added=0;
  for(const tok of tokens){
    const key = nkfc(tok);
    if(indexObj[key]===undefined && /\S/.test(tok)){
      indexObj[key] = dict.length;
      dict.push(key);
      dictRaw.push(tok);
      added++;
    }
  }
  return added;
}

// Shift (+/-K)
function shift(text,k){
  if(!ready) return text;
  const toks = tokenizeByDictMaxMatch(text);
  const added = learnUnknownTokens(toks.filter(t=>!/\s/.test(t)));
  const n = dict.length;
  const km = ((k%n)+n)%n;
  let hit=0;
  const out = toks.map(tok=>{
    if(/\s/.test(tok)) return tok;
    const id = indexObj[nkfc(tok)];
    if(id!==undefined){ hit++; return dictRaw[(id+km)%n]; }
    return tok;
  }).join('');
  stat.textContent = `match ${hit}/${toks.length} tokens | dict=${n}（+${added} learned）`;
  return out;
}

// Reverse
function shiftReverse(text,k){ return shift(text, -k); }

// Read local dictionary (txt or gz) and rebuild via worker
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
      alert('このブラウザは gzip 展開に未対応です。txt を選んでください。');
      throw new Error('gzip not supported');
    }
  }else{
    return new TextDecoder('utf-8',{fatal:false}).decode(bytes);
  }
}

let worker=null;
function buildWithWorker(text){
  return new Promise((resolve,reject)=>{
    worker = worker || new Worker('worker.js');
    worker.onmessage = (e)=>{
      const {ok,size,dictRaw:dr,dict:d,index} = e.data||{};
      if(!ok){ reject(new Error('worker failed')); return; }
      dictRaw = dr; dict = d; indexObj = index; ready = true;
      resolve(size);
    };
    worker.onerror = (e)=>reject(e);
    worker.postMessage({cmd:'build', payload:{text}});
  });
}

async function handleLoad(){
  const f = dictFile.files && dictFile.files[0];
  if(!f){ alert('巨大辞書ファイル（.txt / .gz）を選択してください。'); return; }
  stat.textContent = '辞書読み込み中…（gz可／ワーカー処理）';
  try{
    const text = await readFileAsText(f);
    const size = await buildWithWorker(text);
    stat.textContent = `辞書読み込み完了：${size.toLocaleString()}語（ローカル）`;
  }catch(e){
    console.error(e);
    stat.textContent = '辞書読み込みに失敗';
    alert('読み込みに失敗しました。ファイル形式をご確認ください。');
  }
}

// UI handlers
document.getElementById('shiftBtn').addEventListener('click',()=>{
  const k = parseInt(keyEl.value,10)||0;
  dstEl.value = shift(srcEl.value||'', k);
});
document.getElementById('revBtn').addEventListener('click',()=>{
  const k = parseInt(keyEl.value,10)||0;
  dstEl.value = shiftReverse(srcEl.value||'', k);
});
document.getElementById('sampleBtn').addEventListener('click',()=>{
  srcEl.value = '赤瀬川原平の宇宙の缶詰という作品があります。合歓木の　在りて終日　三途にて。私は喫茶店でコーヒーを飲みながら新聞を読んだ。';
  stat.textContent = 'sample loaded';
});
document.getElementById('copyBtn').addEventListener('click',async()=>{
  try{ await navigator.clipboard.writeText(dstEl.value||''); alert('コピーしました'); }catch{ alert('コピーに失敗しました'); }
});
loadBtn.addEventListener('click', handleLoad);

// PWA register
try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}

})();