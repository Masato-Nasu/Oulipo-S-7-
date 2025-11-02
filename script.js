
(()=>{
const keyEl = document.getElementById('key');
const srcEl = document.getElementById('src');
const dstEl = document.getElementById('dst');
const stat  = document.getElementById('stat');
const unknownKeepEl = document.getElementById('unknownKeep');

// decode dict
let DICT_TXT = "";
try {
  const bin = atob(window.__DICT_B64__||"");
  DICT_TXT = new TextDecoder('utf-8',{fatal:false}).decode(Uint8Array.from(bin, c=>c.charCodeAt(0)));
} catch(e) {
  console.error(e);
  DICT_TXT = "宇宙\n缶詰\n作品\n世界\n時間\n空間\n存在\n読む\n書く\n考える";
}

const nkfc = s => { try { return s.normalize('NFKC'); } catch { return s; } };

// Build dict (unique, sorted)
let dict = Array.from(new Set(DICT_TXT.split(/\r?\n/).map(s=>nkfc((s||"").trim())).filter(Boolean))).sort();
let rawIndex = Object.create(null);
for (let i=0;i<dict.length;i++) rawIndex[dict[i]] = i;

// Common particles/auxiliaries to keep as-is (approximate)
const KEEP_SET = new Set([
  "は","が","を","に","へ","で","と","の","や","も","から","まで","より",
  "ね","よ","ぞ","ぜ","か","な","だ","です","ます","でした","だった",
  "する","した","して","している","していた","できる","できない",
  "ある","ない","いる","いない","でした","でしょう","だった",
  "そして","また","しかし","など","この","その","あの","という","というのは","ということ",
  "。","、","，","．","！","？","「","」","『","』","（","）","(",")","[","]","…","—","-",":","・"
]);

// Tokenize: longest dict match; otherwise group into Japanese/run/latin/number/punct
function tokenizeLongest(s){
  const N = s.length;
  let i=0;
  const out=[];
  const isSpace = c => /\s/.test(c);
  const isPunct = c => /[。、，．！？「」『』（）()［］\[\]…—\-:・]/.test(c);
  const jRe = /[ぁ-んァ-ヶｦ-ﾟー一-龯々〆ヵヶ]/;

  while(i<N){
    const ch = s[i];
    if (isSpace(ch)) { out.push(ch); i++; continue; }
    if (isPunct(ch)) { out.push(ch); i++; continue; }

    // try longest dict match up to 20 chars ahead
    let best=null, blen=0;
    const lim = Math.min(N, i+20);
    for (let j=lim; j>i; j--){
      const piece = s.slice(i,j);
      const key = nkfc(piece);
      if (rawIndex[key]!==undefined){ best=piece; blen=j-i; break; }
    }
    if (best){ out.push(best); i+=blen; continue; }

    // otherwise group by script
    if (jRe.test(ch)){
      const m = s.slice(i).match(/^([ぁ-んァ-ヶｦ-ﾟー一-龯々〆ヵヶ]+)/);
      out.push(m[1]); i+=m[1].length; continue;
    }
    const m2 = s.slice(i).match(/^([A-Za-z]+)/);
    if (m2){ out.push(m2[1]); i+=m2[1].length; continue; }
    const m3 = s.slice(i).match(/^([0-9]+)/);
    if (m3){ out.push(m3[1]); i+=m3[1].length; continue; }

    out.push(ch); i++;
  }
  return out;
}

// shift function
function shiftTokens(tokens, k, unknownKeep=true){
  const n = dict.length;
  const km = ((k % n) + n) % n;
  let hit=0;
  const out = tokens.map(t => {
    if (KEEP_SET.has(t)) return t;
    const key = nkfc(t);
    const id = rawIndex[key];
    if (id!==undefined){
      hit++;
      return dict[(id + km) % n];
    }
    // unknown
    return unknownKeep ? t : t; // default keep
  });
  stat.textContent = `hit ${hit}/${tokens.length} | dict=${n} | keep=${unknownKeep}`;
  return out.join("");
}

function doShift(sign){
  const k = parseInt(keyEl.value,10)||0;
  const text = srcEl.value || "";
  const toks = tokenizeLongest(text);
  const unknownKeep = !!unknownKeepEl.checked;
  dstEl.value = shiftTokens(toks, sign>0?k:-k, unknownKeep);
}

document.getElementById('shiftBtn').addEventListener('click', ()=>doShift(+1));
document.getElementById('revBtn').addEventListener('click', ()=>doShift(-1));

// PWA (best-effort)
try{ if ('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}

})(); 
