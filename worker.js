
// worker.js — build dictionary index off-thread
self.onmessage = async (ev)=>{
  const {cmd, payload} = ev.data||{};
  if(cmd!=='build') return;
  const {text} = payload;
  const nkfc = s => { try { return s.normalize('NFKC'); } catch { return s; } };
  const lines = (text||'').split(/\r?\n/);
  const seen = new Set();
  const dictRaw = [];
  const dict = [];
  const index = Object.create(null);
  for(const raw of lines){
    const w = (raw||'').trim();
    if(!w) continue;
    const n = nkfc(w);
    if(seen.has(n)) continue;
    seen.add(n);
    dictRaw.push(w);
    dict.push(n);
  }
  for(let i=0;i<dict.length;i++){ if(index[dict[i]]===undefined) index[dict[i]]=i; }
  self.postMessage({ok:true, size:dict.length, dictRaw, dict, index});
};
