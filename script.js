(()=>{
const keyEl=document.getElementById('key'),srcEl=document.getElementById('src'),dstEl=document.getElementById('dst');
const stat=document.getElementById('stat');
const DICT_TEXT = `合歓木
終日
三途
彼岸
此岸
境界
渡し守
川
河岸
淵
渚
潮
波
さざなみ
風
微風
息
呼気
吐息
影
光
月
月光
星
星屑
銀河
天
空
虚空
虚無
無
有
存在
生成
消滅
永遠
輪廻
因果
意識
無意識
夢
眠り
覚醒
目覚め
薄明
暁
黄昏
宵
夜
夜半
夜明け
黎明
白夜
闇
暗がり
灯
火
焔
灰
香
薫り
花
蕾
開く
閉じる
揺らぐ
たゆたう
漂う
しずむ
浮かぶ
沈黙
静寂
余白
響き
反響
反射
透明
層
膜
雫
露
霧
霞
雨
小雨
霖
雲
雲間
天頂
地平
地面
砂
砂利
石
礫
岩
岩陰
苔
草
葉
枝
幹
根
土
土壌
畔
丘
谷
峠
峰
稜線
海
海峡
浜
浜辺
岬
灯台
舟
船
櫂
帆
港
航路
方舟
祈り
供物
祭
祭祀
儀式
聖
俗
禁忌
秘儀
像
形
形象
影絵
気配
徴
兆し
うつろい
ささやき
言葉
言霊
音
音色
拍
律
間
余韻
回帰
反復
円環
螺旋
糸
繭
布
編む
結ぶ
ほどく
綻ぶ
裂く
糧
水
パン
酒
葡萄
オリーブ
蜜
穀
稲
籾
穂
収穫
庭
門
門前
参道
石段
鳥居
社
祠
仏
仏塔
塔
寺
伽藍
鐘
鈴
金
銀
真珠
瑠璃
琥珀
翡翠
鏡
面
面影
面輪
貌
眼
瞳
涙
頬
唇
舌
声
歌
詩
詩人
画家
像主
像法
悟り
覚り
無心
空
中空
太古
太初
始原
原初
原像
原型
象
比喩
寓意
アレゴリー
メタファー
エロス
タナトス
死
生
生死
死生観
境涯
旅
旅人
道
途上
佇む
在りて
佇立
坐す
立つ
歩む
停む
触れる
抱く
抱える
手
掌
足
歩
軌跡
影法師
傘
雨傘
日傘
合図
記憶
忘却
追憶
回想
現在
過去
未来
時間
時
瞬き
刹那
永劫
始まり
終わり
始終
端
縁
缘
絆`;

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
  srcEl.value='合歓木の　在りて終日　三途にて';
  stat.textContent='sample loaded';
});

try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('serviceWorker.js'); }catch{}
})();