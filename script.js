(()=>{
const keyEl=document.getElementById('key'),srcEl=document.getElementById('src'),dstEl=document.getElementById('dst');
const stat=document.getElementById('stat');
const DICT_TEXT = document.currentScript?.textContent?.includes('DICT_PLACEHOLDER') ? '' : `私
喫茶店
で
コーヒー
を
飲み
ながら
新聞
を
読んだ
綿種
吉事
で
コーラ
を
のめり込み
ながら
真文字
金銀
を
よらわれけり`;

// 辞書準備
const nkfc=s=>{try{return s.normalize('NFKC')}catch{return s}};
let dictRaw=[],dict=[],seen=new Set();
for(const line of DICT_TEXT.split(/\r?\n/)){const w=(line||'').trim(); if(!w) continue;
  const n=nkfc(w); if(seen.has(n)) continue; seen.add(n); dictRaw.push(w); dict.push(n);
}
function buildMap(k){const n=dict.length; if(!n) return new Map(); const km=((k%n)+n)%n; const m=new Map();
  for(let i=0;i<n;i++){const j=(i+km)%n; m.set(dict[i],dictRaw[j])} return m;
}
function tokenize(s){return s.match(/([A-Za-z]+|[0-9]+|[ぁ-んァ-ヶｦ-ﾟー゛゜ー]+|[一-龯々〆ヵヶー]+|[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uff00-\uffef]+|\s+)/g)||[s]}
function shiftOnce(t,k){
  if(!dict.length) return t;
  const map=buildMap(k);
  const toks=tokenize(t);
  let hit=0;
  const out=toks.map(tok=>{const v=map.get(nkfc(tok)); if(v!==undefined){hit++; return v;} return tok;}).join('');
  stat.textContent = `match ${hit}/${toks.length} tokens | dict=${dict.length}`;
  return out;
}
document.getElementById('shiftBtn').addEventListener('click',()=>{
  const k=parseInt(keyEl.value,10)||0;
  dstEl.value = shiftOnce(srcEl.value||'', k);
  console.log('[debug] K=',k);
});
document.getElementById('fillBtn').addEventListener('click',()=>{
  srcEl.value = '私は喫茶店でコーヒーを飲みながら新聞を読んだ';
  stat.textContent='sample loaded';
});
try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}
})();