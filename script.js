const statusEl=document.getElementById('status');
const encBtn=document.getElementById('encBtn'),decBtn=document.getElementById('decBtn'),keyEl=document.getElementById('key'),srcEl=document.getElementById('src'),dstEl=document.getElementById('dst');
const DICT_URL='assets/dict.txt';let dict=[],index=new Map();
init();
async function init(){if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('serviceWorker.js');}catch{}}await loadDictionary();encBtn.addEventListener('click',()=>run(+getKey()));decBtn.addEventListener('click',()=>run(-getKey()));}
function getKey(){const k=parseInt(keyEl.value,10);return Number.isFinite(k)?k:0;}
async function loadDictionary(){const res=await fetch(DICT_URL);const txt=await res.text();dict=Array.from(new Set(txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)));dict.forEach((w,i)=>{if(!index.has(w))index.set(w,i)});statusEl.textContent=`辞書読み込み：${dict.length}語`;}
function run(shift){if(!dict.length){alert('辞書未ロード');return;}const src=srcEl.value;if(!src){dstEl.value='';return;}const tokens=src.match(/([A-Za-z0-9]+|[ぁ-んァ-ヶｦ-ﾟー゛゜]+|[一-龯々〆ヵヶ]+|\s+|\p{P}+)/gu)||[src];const n=dict.length;dstEl.value=tokens.map(tok=>index.has(tok)?dict[(index.get(tok)+(shift%n)+n)%n]:tok).join('');}