
self.onmessage = async (ev)=>{
  const {cmd, payload} = ev.data||{};
  if(cmd==='build'){
    const {words} = payload;
    const nkfc = s => { try { return s.normalize('NFKC'); } catch { return s; } };
    const seen = new Set();
    const dictRaw = [];
    const dict = [];
    const index = Object.create(null);
    for(const w of words){
      const t = (w||'').trim(); if(!t) continue;
      const n = nkfc(t);
      if(seen.has(n)) continue;
      seen.add(n); dictRaw.push(t); dict.push(n);
    }
    for(let i=0;i<dict.length;i++){ if(index[dict[i]]===undefined) index[dict[i]]=i; }
    self.postMessage({ok:true, dictRaw, dict, index});
  }
};
