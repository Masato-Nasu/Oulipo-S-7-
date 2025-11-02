(()=>{
const keyEl=document.getElementById('key'),srcEl=document.getElementById('src'),dstEl=document.getElementById('dst');
const stat=document.getElementById('stat');
const DICT_TEXT = `私
喫茶店
で
コーヒー
を
飲み
飲んだ
ながら
新聞
読んだ
読む
読んで
綿種
吉事
コーラ
のめり込み
真文字
金銀
よらわれけり
は
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
な
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
その
この
あの`;

// 正規化
const nkfc=s=>{try{return s.normalize('NFKC')}catch{return s}};

// 辞書構築（重複除去）
let dictRaw=[],dict=[],index=new Map(),seen=new Set();
for(const line of DICT_TEXT.split(/\r?\n/)){const w=(line||'').trim(); if(!w) continue;
  const n=nkfc(w); if(seen.has(n)) continue; seen.add(n); dictRaw.push(w); dict.push(n);
}
dict.forEach((w,i)=>{ if(!index.has(w)) index.set(w,i); });

// 最大一致トークナイズ（辞書優先）
function tokenizeByDictMaxMatch(s){
  const MAXLEN = 24;
  const out=[]; let i=0, N=s.length;
  while(i<N){
    const ch = s[i];
    if(/\s/.test(ch)){ out.push(ch); i++; continue; }
    let matched=null, mlen=0;
    const limit=Math.min(N,i+MAXLEN);
    for(let j=limit;j>i;j--){
      const piece=s.slice(i,j);
      if(index.has(nkfc(piece))){ matched=piece; mlen=j-i; break; }
    }
    if(matched){ out.push(matched); i+=mlen; }
    else { out.push(s[i]); i++; }
  }
  return out;
}

// シフト写像
function buildMap(k){
  const n=dict.length; if(!n) return new Map();
  const km=((k%n)+n)%n; const m=new Map();
  for(let i=0;i<n;i++){ const j=(i+km)%n; m.set(dict[i],dictRaw[j]); }
  return m;
}

function shiftOnce(text,k){
  if(!dict.length) return text;
  const toks = tokenizeByDictMaxMatch(text);
  const map = buildMap(k);
  let hit=0;
  const out = toks.map(tok=>{ const v=map.get(nkfc(tok)); if(v!==undefined){hit++; return v;} return tok;}).join('');
  stat.textContent = `match ${hit}/${toks.length} tokens | dict=${dict.length}`;
  return out;
}

document.getElementById('shiftBtn').addEventListener('click',()=>{
  const k=parseInt(keyEl.value,10)||0;
  dstEl.value = shiftOnce(srcEl.value||'', k);
});
document.getElementById('fillBtn').addEventListener('click',()=>{
  srcEl.value='私は喫茶店でコーヒーを飲みながら新聞を読んだ';
  stat.textContent='sample loaded';
});

try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}
})();