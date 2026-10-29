// 출산지원 지도: 시·도 → 시·군·구를 눌러 그 지역의 출산지원 제도와 신청 방법을 보여 줍니다.
(function(){
const K=window.KMAP,D=window.SUPPORT;if(!K||!D)return;
const CFG=window.SITE_CONFIG||{};
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PN={};K.prov.forEach(p=>PN[p.c]=p.n);
const FULL={'서울':'서울특별시','부산':'부산광역시','대구':'대구광역시','인천':'인천광역시','광주':'광주광역시','대전':'대전광역시','울산':'울산광역시','세종':'세종특별자치시','경기':'경기도','강원':'강원특별자치도','충북':'충청북도','충남':'충청남도','전북':'전북특별자치도','전남':'전라남도','경북':'경상북도','경남':'경상남도','제주':'제주특별자치도'};
const svg=$('sp-map'),detail=$('sp-detail'),selP=$('sp-sel-p'),selM=$('sp-sel-m');
let prov='',muni='',vb=[0,0,K.w,K.h],anim=0;
const MUNI=code=>K.muni.find(m=>m.c===code);
const munisOf=pc=>K.muni.filter(m=>m.p===pc).sort((a,b)=>a.n.localeCompare(b.n,'ko'));
const local=()=>D.local||(D.local={});
// ── 지도 그리기 ──
function draw(){
 let h='';
 if(!prov){
  h=K.prov.map(p=>`<path class="pv" d="${p.d}" data-p="${p.c}" tabindex="0" role="button" aria-label="${FULL[p.n]}"/>`).join('')+
    K.prov.map(p=>`<text class="lb" x="${p.ct[0]}" y="${p.ct[1]}" font-size="${['11','29','25','23','24'].includes(p.c)?17:24}">${p.n}</text>`).join('');
 }else{
  const ms=munisOf(prov),fs=0; 
  h=K.prov.filter(p=>p.c!==prov).map(p=>`<path class="pv dim" d="${p.d}" data-p="${p.c}" aria-label="${FULL[p.n]}"/>`).join('')+
    K.prov.filter(p=>p.c===prov).map(p=>`<path class="pv on" d="${p.d}" data-p="${p.c}"/>`).join('')+
    ms.map(m=>`<path class="mn${m.c===muni?' on':''}" d="${m.d}" data-m="${m.c}" tabindex="0" role="button" aria-label="${esc(m.n)}"/>`).join('');
 }
 svg.innerHTML=h+'<g id="sp-lbl"></g>';
 const t=target();setView(t);
 if(prov){const L=$('sp-lbl'),fs=t[2]/48;L.innerHTML=munisOf(prov).map(m=>`<text class="lb" x="${m.ct[0]}" y="${m.ct[1]}" font-size="${fs.toFixed(2)}" stroke-width="${(fs*.28).toFixed(2)}">${esc(m.n.replace(/시 /,' '))}</text>`).join('')}
}
function target(){
 if(!prov)return [0,0,K.w,K.h];
 const pth=svg.querySelector(`.pv.on`);if(!pth)return [0,0,K.w,K.h];
 const b=pth.getBBox(),pad=Math.max(b.width,b.height)*0.08;
 let w=b.width+pad*2,h=b.height+pad*2;const ar=K.w/K.h; // 지도 영역 비율에 맞추기
 const r=svg.getBoundingClientRect(),vr=(r.width||K.w)/(r.height||K.h);
 if(w/h<vr)w=h*vr;else h=w/vr;
 return [b.x+b.width/2-w/2,b.y+b.height/2-h/2,w,h];
}
function setView(t){
 cancelAnimationFrame(anim);const from=vb.slice(),t0=performance.now(),D0=350;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){vb=t;svg.setAttribute('viewBox',vb.join(' '));return}
 (function step(now){const k=Math.min(1,(now-t0)/D0),e=1-Math.pow(1-k,3);vb=from.map((v,i)=>v+(t[i]-v)*e);svg.setAttribute('viewBox',vb.map(v=>+v.toFixed(2)).join(' '));if(k<1)anim=requestAnimationFrame(step)})(t0);
}
// ── 선택 상자 ──
selP.innerHTML='<option value="">시·도 선택</option>'+K.prov.map(p=>`<option value="${p.c}">${FULL[p.n]}</option>`).join('');
function fillM(){selM.innerHTML='<option value="">시·군·구 선택</option>'+(prov?munisOf(prov).map(m=>`<option value="${m.c}">${esc(m.n)}</option>`).join(''):'');selM.disabled=!prov;selM.value=muni}
// ── 오른쪽 안내 ──
const prog=(p,ours)=>`<article class="sp-prog${p.ours?' ours':''}"><h4>${esc(p.name)}${p.sample?' <span class="smp">참고용 · 확인 전</span>':''}</h4>
 <dl>${p.amount?`<dt>지원 내용</dt><dd>${esc(p.amount)}</dd>`:''}${p.target?`<dt>대상</dt><dd>${esc(p.target)}</dd>`:''}${p.how?`<dt>신청 방법</dt><dd>${esc(p.how)}</dd>`:''}</dl>
 <p class="sp-acts">${p.link?`<a class="btn sm ghost2" href="${esc(p.link)}" target="_blank" rel="noopener">공식 안내·신청 ↗</a>`:''}<button type="button" class="btn sm" data-ask="${esc(p.name)}">이 지원 상담받기</button></p></article>`;
const steps=`<ol class="steps sp-steps"><li><b>대상 확인</b><br>아래 제도의 대상과 소득 기준을 확인해요.</li><li><b>신청</b><br>복지로·정부24 온라인, 또는 주민센터·보건소 방문.</li><li><b>지급·이용</b><br>계좌 입금이나 바우처 카드로 받아요.</li></ol>`;
function detailHTML(){
 const nat=`<h3 class="sp-h">전국 공통 지원 <small>참고용 · 금액과 조건은 해마다 달라요</small></h3><div class="sp-list">${D.national.map(prog).join('')}</div>`;
 const portals=`<p class="sp-portals">${D.portals.map(x=>`<a class="lnk" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a> <small class="mute">${esc(x.desc)}</small>`).join(' · ')}</p>`;
 if(!prov){
  return `<h2 class="sp-t">전국 출산지원</h2><p class="mute">지도에서 지역을 누르면 그 지역의 제도가 나와요. 지금은 전국 어디서나 받을 수 있는 지원을 보여 드려요.</p>${steps}${nat}${portals}<p class="mute sp-asof">${esc(D.asOf)}</p>`;
 }
 const pn=FULL[PN[prov]],m=muni&&MUNI(muni),key=m?muni:prov,L=(local()[key]||{}),
  progs=(L.programs||[]).map(x=>Object.assign({sample:L.sample},x));
 const title=m?`${pn} ${m.n}`:pn;
 const site=D.provSite&&D.provSite[prov];
 const own=progs.length?`<div class="sp-list">${progs.map(p=>prog(p)).join('')}</div>`:`<div class="todo">${esc(title)}의 지원 제도는 아직 정리 중이에요. ${m?'':'시·군·구를 눌러 보시거나, '}공식 누리집에서 확인하시고, 막막하시면 아래 상담을 신청해 주세요.</div>`;
 const contact=`<p class="sp-portals">${site?`<a class="lnk" href="${esc(site)}" target="_blank" rel="noopener">${esc(pn)} 공식 누리집 ↗</a>`:''}${L.link?` · <a class="lnk" href="${esc(L.link)}" target="_blank" rel="noopener">${esc(m?m.n:pn)} 안내 ↗</a>`:''}${L.phone?` · 문의 ${esc(L.phone)}`:''}</p>`;
 return `<h2 class="sp-t">${esc(title)} <small class="mute">${m?'시·군·구 제도':'시·도 제도'}</small></h2>${m?'':'<p class="mute">시·군·구에 따라 지원이 달라요. 지도에서 시·군·구를 눌러 보세요.</p>'}
 <h3 class="sp-h">${esc(m?m.n:pn)}의 지원 ${L.sample?'<small>예시 · 실제 제도 아님</small>':''}</h3>${own}${contact}${steps}${nat}${portals}<p class="mute sp-asof">${esc(L.checked?'최종 확인일: '+L.checked:D.asOf)}</p>`;
}
const regionText=()=>prov?FULL[PN[prov]]+(muni?' '+MUNI(muni).n:''):'';
function prefill(){const i=document.querySelector('#sp-form [name="거주 지역"]');if(i&&!i.dataset.touched)i.value=regionText()}
function update(redraw){
 if(redraw!==false)draw();
 $('sp-back').hidden=!prov;$('sp-crumb').textContent=prov?FULL[PN[prov]]+(muni?' › '+MUNI(muni).n:''):'전국';
 $('sp-hint').textContent=!prov?'시·도를 눌러 보세요. 누르면 시·군·구까지 볼 수 있어요.':muni?'다른 시·군·구를 눌러 비교해 보세요.':'시·군·구를 눌러 보세요.';
 selP.value=prov;fillM();detail.innerHTML=detailHTML();prefill();
}
function pickProv(c){prov=c;muni='';update()}
function pickMuni(c){const m=MUNI(c);if(!m)return;if(prov!==m.p){prov=m.p;muni=c;update()}else{muni=c;svg.querySelectorAll('.mn').forEach(x=>x.classList.toggle('on',x.dataset.m===c));update(false)}}
svg.addEventListener('click',e=>{const m=e.target.closest('[data-m]');if(m)return pickMuni(m.dataset.m);const p=e.target.closest('[data-p]');if(p&&p.dataset.p!==prov)pickProv(p.dataset.p)});
svg.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest('[data-m],[data-p]');if(t){e.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
$('sp-back').onclick=()=>{if(muni){muni='';update()}else pickProv('')};
selP.onchange=()=>pickProv(selP.value);selM.onchange=()=>selM.value?pickMuni(selM.value):(muni='',update());
// 상담 신청 연결: 제도를 고르면 아래 신청서의 '궁금한 지원'에 체크하고 이동
detail.addEventListener('click',e=>{const a=e.target.closest('[data-ask]');if(!a)return;
 const f=$('sp-form');f.scrollIntoView({behavior:'smooth',block:'start'});prefill();
 const c=[...f.querySelectorAll('input[name="궁금한 지원"]')].find(x=>x.value===a.dataset.ask);if(c)c.checked=true});
document.addEventListener('input',e=>{if(e.target.matches('#sp-form [name="거주 지역"]'))e.target.dataset.touched='1'});
// 구글 시트 '출산지원' 탭 연결 시 지역 제도를 덮어씁니다
async function remote(){
 if(!CFG.endpoint)return;
 try{const j=await (await fetch(CFG.endpoint+'?list=support')).json();if(!j.ok)return;
  const L={};j.items.forEach(r=>{const k=String(r.code);(L[k]=L[k]||{checked:r.checked||'',phone:r.phone||'',link:r.link||'',programs:[]}).programs.push({name:r.name,amount:r.amount,target:r.target,how:r.how,link:r.url});});
  D.local=L;update(false)}catch(e){}
}
{const fm=$('sp-form');if(fm&&fm.dataset.ready){fm.removeAttribute('data-ready');fm.innerHTML=''}if(window.TtasaInitForms)window.TtasaInitForms(document)}
update();remote();
let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(prov){vb=target();svg.setAttribute('viewBox',vb.join(' '))}},150)});
})();
