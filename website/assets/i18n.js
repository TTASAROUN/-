// 사이트 번역: 국기를 고르면 화면의 한국어 문구를 해당 언어로 바꿉니다.
// 번역문은 assets/i18n-data.js 에 있습니다. (한 줄 = [한국어, English, 中文, Tiếng Việt, Filipino, ไทย])
// 번역표에 없는 문구(새로 쓴 글, 이용자가 올린 글 등)는 구글 번역(실제 사이트에서만 동작)이 이어서 번역합니다.
(function(){
const COL={en:1,'zh-CN':2,vi:3,tl:4,th:5};
const SKIP=/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/;
const ATTRS=['placeholder','title','alt','aria-label'];
const H=/[가-힣]/;
let cur='ko',map=null,loading=null,obs=null,queue=new Set(),raf=0;
const norm=s=>s.replace(/\s+/g,' ').trim();
function load(){
 if(window.I18N_ROWS)return Promise.resolve();
 if(loading)return loading;
 return loading=new Promise(ok=>{const s=document.createElement('script');s.src='assets/i18n-data.js';s.onload=ok;s.onerror=ok;document.head.appendChild(s)});
}
function build(code){map=new Map();const i=COL[code];(window.I18N_ROWS||[]).forEach(r=>{if(r[i])map.set(r[0],r[i])})}
function tr(s){const k=norm(s);const v=map.get(k);if(!v)return null;const m=s.match(/^(\s*)[\s\S]*?(\s*)$/);return m[1]+v+m[2]}
function doNode(n){
 if(n.nodeType===3){
  const p=n.parentElement;if(!p||SKIP.test(p.tagName)||p.closest('.notranslate'))return;
  if(n._ko!==undefined){ // 이미 번역된 노드: 원문 기준으로 다시 번역
   const t=tr(n._ko);if(t!==null&&n.data!==t)n.data=t;return}
  if(!H.test(n.data))return;
  const t=tr(n.data);if(t!==null){n._ko=n.data;n.data=t}
 }else if(n.nodeType===1){
  if(SKIP.test(n.tagName)||n.closest&&n.closest('.notranslate'))return;
  for(const a of ATTRS){
   const v=n.getAttribute(a);if(!v)continue;
   n._koA=n._koA||{};const src=n._koA[a]!==undefined?n._koA[a]:v;
   if(!H.test(src))continue;
   const t=tr(src);if(t!==null){n._koA[a]=src;n.setAttribute(a,t)}
  }
  n.childNodes.forEach(doNode);
 }
}
function restore(root){
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n._ko!==undefined){n.data=n._ko;delete n._ko}}
 root.querySelectorAll('*').forEach(e=>{if(e._koA){for(const a in e._koA)e.setAttribute(a,e._koA[a]);delete e._koA}});
}
function flush(){raf=0;if(cur==='ko')return;queue.forEach(n=>{if(n.isConnected)doNode(n)});queue.clear();if(H.test(document.title)||document._koT){const t=tr(document._koT||document.title);if(t!==null){document._koT=document._koT||document.title;document.title=t}}}
function watch(){
 if(obs)return;
 obs=new MutationObserver(ms=>{if(cur==='ko')return;ms.forEach(m=>m.addedNodes.forEach(n=>queue.add(n)));if(!raf)raf=requestAnimationFrame(flush)});
 obs.observe(document.body,{childList:true,subtree:true});
}
async function apply(code){
 const prev=cur;
 if(code==='ko'||!COL[code]){cur='ko';document.documentElement.lang='ko';restore(document.body);if(document._koT){document.title=document._koT;delete document._koT}
  try{localStorage.setItem('ttasa_lang','ko')}catch(e){}return}
 await load();cur=code;build(code);
 if(prev!=='ko'&&prev!==code)restore(document.body);
 document.documentElement.lang=code;
 try{localStorage.setItem('ttasa_lang',code)}catch(e){}
 doNode(document.body);const t=tr(document._koT||document.title);if(t!==null){document._koT=document._koT||document.title;document.title=t}
 watch();
}
window.TtasaI18n={apply,get current(){return cur},saved(){try{return localStorage.getItem('ttasa_lang')||'ko'}catch(e){return 'ko'}}};
})();
