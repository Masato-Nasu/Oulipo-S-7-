
(()=>{
const keyEl = document.getElementById('key');
const srcEl = document.getElementById('src');
const dstEl = document.getElementById('dst');

// decode dict
let DICT_TXT = "";
try {
  const bin = atob(window.__DICT_B64__||"");
  DICT_TXT = new TextDecoder('utf-8',{fatal:false}).decode(Uint8Array.from(bin, c=>c.charCodeAt(0)));
} catch(e) {
  DICT_TXT = "宇宙\n缶詰\n作品\n世界\n時間\n空間\n存在\n読む\n書く\n考える";
}
const nkfc = s => { try { return s.normalize('NFKC'); } catch { return s; } };
let dict = Array.from(new Set(DICT_TXT.split(/\r?\n/).map(s=>nkfc((s||"").trim())).filter(Boolean))).sort();
let idx = Object.create(null); for (let i=0;i<dict.length;i++) idx[dict[i]] = i;

// particles/aux
const KEEP = new Set(["は","が","を","に","へ","で","と","の","や","も","から","まで","より",
  "ね","よ","ぞ","ぜ","か","な","だ","です","ます","でした","だった",
  "する","した","して","できる","できない",
  "ある","ない","いる","いない",
  "そして","また","しかし","など","この","その","あの","という",
  "。","、","，","．","！","？","「","」","『","』","（","）","(",")","[","]","…","—","-",":","・"
]);

function tokenize(s){
  const N=s.length; let i=0; const out=[];
  const isSpace=c=>/\s/.test(c);
  const isPunct=c=>/[。、，．！？「」『』（）()［］\[\]…—\-:・]/.test(c);
  const jRe=/[ぁ-んァ-ヶｦ-ﾟー一-龯々〆ヵヶ]/;
  while(i<N){
    const ch=s[i];
    if(isSpace(ch)||isPunct(ch)){ out.push(ch); i++; continue; }
    // longest match up to 20
    let best=null, bl=0, lim=Math.min(N,i+20);
    for(let j=lim;j>i;j--){
      const p=s.slice(i,j), k=nkfc(p);
      if(idx[k]!==undefined){ best=p; bl=j-i; break; }
    }
    if(best){ out.push(best); i+=bl; continue; }
    if(jRe.test(ch)){ const m=s.slice(i).match(/^([ぁ-んァ-ヶｦ-ﾟー一-龯々〆ヵヶ]+)/); out.push(m[1]); i+=m[1].length; continue; }
    const m2=s.slice(i).match(/^([A-Za-z]+)/); if(m2){ out.push(m2[1]); i+=m2[1].length; continue; }
    const m3=s.slice(i).match(/^([0-9]+)/); if(m3){ out.push(m3[1]); i+=m3[1].length; continue; }
    out.push(ch); i++;
  }
  return out;
}

function shiftTokens(tokens, k){
  const n=dict.length; const km=((k%n)+n)%n;
  return tokens.map(t=>{
    if(KEEP.has(t)) return t;
    const id = idx[nkfc(t)];
    if(id!==undefined) return dict[(id+km)%n];
    return t;
  }).join("");
}

function doShift(sign){
  const k = parseInt(keyEl.value,10)||0;
  const toks = tokenize(srcEl.value||"");
  dstEl.value = shiftTokens(toks, sign>0?k:-k);
}

document.getElementById('shiftBtn').addEventListener('click', ()=>doShift(+1));
document.getElementById('revBtn').addEventListener('click', ()=>doShift(-1));

try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}
})(); 
