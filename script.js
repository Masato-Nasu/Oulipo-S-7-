(()=>{
const keyEl = document.getElementById('key');
const srcEl = document.getElementById('src');
const dstEl = document.getElementById('dst');
const stat  = document.getElementById('stat');
const learnToggle = document.getElementById('learnToggle');
learnToggle.checked = false; // 既定：未知語は置換しない

// ===== 埋め込み辞書（base64, 1行1語） =====
let EMBED_DICT = '';
try{
  const bin = atob(window.__DICT_B64__||'');
  EMBED_DICT = new TextDecoder('utf-8',{fatal:false}).decode(Uint8Array.from(bin, c=>c.charCodeAt(0)));
}catch(e){
  console.error('dict decode failed', e);
  EMBED_DICT = "私\n宇宙\n作品\n読む\n新聞\n喫茶店\nコーヒー\n飲む\n合歓木\n三途\n在りて\n終日";
}

const nkfc = s => { try { return s.normalize('NFKC'); } catch { return s; } };

let dictRaw=[], dict=[], indexObj=Object.create(null), ready=false;

function buildSync(text){
  const t0 = performance.now();
  const lines = (text||'').split(/\r?\n/);
  const seen = new Set();
  dictRaw.length = 0; dict.length = 0; indexObj = Object.create(null);
  for(const raw of lines){
    const w = (raw||'').trim(); if(!w) continue;
    const n = nkfc(w);
    if(seen.has(n)) continue;
    seen.add(n);
    dictRaw.push(w);
    dict.push(n);
  }
  for(let i=0;i<dict.length;i++){ if(indexObj[dict[i]]===undefined) indexObj[dict[i]]=i; }
  ready = true;
  const t1 = performance.now();
  stat.textContent = `辞書読み込み完了：${dict.length.toLocaleString()}語（埋め込み/b64/同期, ${Math.round(t1-t0)}ms）`;
}
buildSync(EMBED_DICT);

// 最長一致トークナイズ（辞書優先）
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
    // 未知語は「まとめてそのまま」扱いにする（可読性優先）
    const m = s.slice(i).match(/^([ぁ-んァ-ヶｦ-ﾟー一-龯々〆ヵヶ]+|[A-Za-z]+|[0-9]+)/);
    if(m){ out.push(m[1]); i+=m[1].length; }
    else { out.push(s[i]); i++; }
  }
  return out;
}

// 未知語学習（オプション）
function learnUnknownTokens(tokens){
  if(!learnToggle.checked) return 0;
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

// シフト
function shift(text,k){
  if(!ready) return text;
  const toks = tokenizeByDictMaxMatch(text);
  const added = learnUnknownTokens(toks.filter(t=>!/\s/.test(t)));
  const n = dict.length;
  const km = ((k%n)+n)%n;
  let hit=0;
  const out = toks.map(tok=>{
    if(/\s/.test(tok)) return tok;        // 空白などはそのまま
    const id = indexObj[nkfc(tok)];
    if(id!==undefined){ hit++; return dictRaw[(id+km)%n]; }
    return tok;                            // 未知語はそのまま（既定）
  }).join('');
  stat.textContent = `match ${hit}/${toks.length} tokens | dict=${n}${learnToggle.checked?'' : ' | 未知語はそのまま'}`;
  return out;
}
function shiftReverse(text,k){ return shift(text,-k); }

// UI
document.getElementById('shiftBtn').addEventListener('click',()=>{
  const k = parseInt(keyEl.value,10)||0;
  dstEl.value = shift(srcEl.value||'', k);
});
document.getElementById('revBtn').addEventListener('click',()=>{
  const k = parseInt(keyEl.value,10)||0;
  dstEl.value = shiftReverse(srcEl.value||'', k);
});
document.getElementById('sampleBtn')?.addEventListener('click',()=>{
  srcEl.value = '私は喫茶店でコーヒーを飲みながら新聞を読んだ。合歓木の　在りて終日　三途にて。';
});

// PWA
try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}

})();