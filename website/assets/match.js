// 번개매칭: 조건 선택 → 가능한 관리사님 목록 → 선택 → 신청 정보 → 접수(기관이 연락 후 확정)
(function(){
const root=document.querySelector('[data-match]');if(!root)return;
const CFG=window.SITE_CONFIG||{};
const cookieLang=window.cookieLang||(()=>'ko');
const SERVICES=['산후관리사','영유아 관리사','가사관리사','정리수납전문가','이유식전문가'];
const TRAITS=['차분','조용','쾌활·유쾌','사교','전문'];
const ENV=[['다태아','다태아(쌍둥이 이상)'],['먼거리','먼 거리 가능'],['입주','야간·입주'],['자차','자차 보유']];
const PETS=[['반려견','댁에 반려견이 있어요'],['반려묘','댁에 반려묘가 있어요']];
const AGES=['30대','40대','50대','60대','70대'];
const RELIGIONS=['무교','기독교','천주교','불교','기타'];
const VIRTUES=(window.MatchCore&&window.MatchCore.VIRTUES)||['전문성','청결성','성실성','친절·소통','책임감'];
const MBR=[['에너지','E','외향','I','내향'],['인식','S','현실','N','직관'],['판단','T','사고','F','감정'],['생활','J','계획','P','탐색']];
const YEARS=[['','무관'],['3','3년 이상'],['5','5년 이상'],['10','10년 이상']];
const ANY='무관';
const WD='일월화수목금토';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>n<10?'0'+n:''+n;
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const fmt=s=>{const d=parse(s);return `${d.getMonth()+1}월 ${d.getDate()}일(${WD[d.getDay()]})`};
const days=(a,b)=>Math.round((parse(b)-parse(a))/864e5)+1;
const fresh=()=>({service:[],region:'',apt:'',start:'',end:'',excl:[],only:[],dates:[],traits:[],extras:[],ages:[],religions:[],virtues:[],mbti:'----',minYears:''});
let q=fresh(),pick=null,items=[];
// 선택한 기간 중 서비스가 필요한 날(제외일 뺀 날)과 휴·공휴일 근무 필요 여부
const HOL=()=>window.HOLIDAYS||{};
const isOff=(iso,ex)=>{const d=parse(iso).getDay();if(q.only.length&&!q.only.includes(WD[d]))return true;return (d===6&&ex.includes('토'))||(d===0&&ex.includes('일'))||(!!HOL()[iso]&&ex.includes('공휴일'))};
function svcDays(){if(q.only.length&&q.dates.length)return q.dates.filter(k=>!isOff(k,q.excl));if(!q.start)return [];const out=[];for(let d=parse(q.start),e=parse(q.end||q.start);d<=e;d.setDate(d.getDate()+1)){const k=iso(d);if(!isOff(k,q.excl))out.push(k)}return out}
const needHol=()=>svcDays().some(k=>{const d=parse(k).getDay();return d===0||d===6||HOL()[k]});

const chips=(name,list,type)=>list.map(x=>{const v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return `<label class="chip"><input type="${type}" name="${name}" value="${esc(v)}"><span>${esc(l)}</span></label>`}).join('');
const anyChips=(name,list)=>chips(name,[[ANY,'무관']].concat(list.map(x=>Array.isArray(x)?x:[x,x])),'checkbox');
const stepper=n=>`<ol class="mstep">${['조건 선택','관리사님 선택','신청 정보'].map((t,i)=>`<li class="${i+1===n?'on':i+1<n?'done':''}"><b>${i+1}</b>${t}</li>`).join('')}</ol>`;

// ── 달력 (항공권 예약처럼 시작일 → 종료일, 토·일·공휴일 표시와 제외) ──
function Calendar(box,onChange,init,getEx){
 const H=HOL(),END=window.HOLIDAYS_END||'2027-12-31';
 const today=new Date();today.setHours(0,0,0,0);
 let s=(init&&init.s)||'',e=(init&&init.e)||'',ds=((init&&init.d)||[]).slice(),hover='';let view=s?new Date(parse(s).getFullYear(),parse(s).getMonth(),1):new Date(today.getFullYear(),today.getMonth(),1);
 const endM=parse(END);
 const monthHTML=m=>{
  const first=new Date(m.getFullYear(),m.getMonth(),1),last=new Date(m.getFullYear(),m.getMonth()+1,0);
  let h=`<div class="cal-m"><div class="cal-t">${m.getFullYear()}년 ${m.getMonth()+1}월</div><div class="cal-g">`+[...WD].map((w,i)=>`<span class="cal-w${i===0?' sun':i===6?' sat':''}">${w}</span>`).join('');
  for(let i=0;i<first.getDay();i++)h+='<span></span>';
  for(let d=1;d<=last.getDate();d++){const dt=new Date(m.getFullYear(),m.getMonth(),d),k=iso(dt),w=dt.getDay();
   h+=`<button type="button" class="cal-d${w===0||H[k]?' sun':w===6?' sat':''}${H[k]?' hol':''}" data-d="${k}"${H[k]?` title="${esc(H[k])}"`:''}${dt<today||k>END?' disabled data-pd="1"':''}>${d}</button>`}
  return h+'</div></div>';
 };
 function paint(){
  const ex=getEx?getEx():[],multi=q.only.length>0;
  if(multi&&!ds.length&&s&&e){for(let d=parse(s);d<=parse(e);d.setDate(d.getDate()+1)){const k=iso(d);if(q.only.includes(WD[d.getDay()])&&!isOff(k,ex))ds.push(k)}if(ds.length){s=ds[0];e=ds[ds.length-1];onChange(s,e,ds)}}
  if(!multi&&ds.length)ds=[];
  const end=multi?'':(e||(s&&hover&&hover>=s?hover:''));
  box.querySelectorAll('.cal-d').forEach(b=>{if(multi){const d=b.dataset.d;b.classList.toggle('sel',ds.includes(d));['in','first','lastd','ex'].forEach(c=>b.classList.remove(c))}
   if(multi){if(!b.dataset.pd){const no=!q.only.includes(WD[parse(b.dataset.d).getDay()]);b.disabled=no;b.classList.toggle('nop',no)}return}
   const d=b.dataset.d,inr=!!(s&&end&&d>=s&&d<=end);
   b.classList.toggle('sel',d===s||d===e);b.classList.toggle('in',!!(s&&end&&d>s&&d<end));
   b.classList.toggle('first',d===s&&!!end&&end!==s);b.classList.toggle('lastd',d===end&&end!==s);
   b.classList.toggle('ex',inr&&isOff(d,ex));
   if(!b.dataset.pd){const no=!!(q.only.length&&!q.only.includes(WD[parse(d).getDay()]));b.disabled=no;b.classList.toggle('nop',no)}
  });
  let sum;
  if(multi){const n=ds.filter(k=>!isOff(k,ex)).length;sum=ds.length?`<b>${ds.length>3?ds.slice(0,3).map(fmt).join(', ')+' 외 '+(ds.length-3)+'일':ds.map(fmt).join(', ')}</b> · 총 <b>${n}일</b> <small>(날짜를 다시 누르면 취소돼요)</small>`:`원하는 ${q.only.join('·')}요일 날짜를 <b>하나씩 눌러</b> 선택하세요`}
  else if(!s)sum='시작일을 선택하세요';
  else if(!e)sum=`<b>${fmt(s)}</b> ~ 종료일을 선택하세요 <small>(하루만 필요하면 같은 날짜를 한 번 더 누르세요)</small>`;
  else{let n=0,t=0;for(let d=parse(s);d<=parse(e);d.setDate(d.getDate()+1)){t++;if(!isOff(iso(d),ex))n++}
   sum=`<b>${fmt(s)}</b> ~ <b>${fmt(e)}</b> · ${t}일${n!==t?` 중 서비스 <b>${n}일</b>`:''}`}
  box.querySelector('.cal-sum').innerHTML=sum;
 }
 function render(){
  const next=new Date(view.getFullYear(),view.getMonth()+1,1);
  box.innerHTML=`<div class="cal"><div class="cal-nav"><button type="button" data-n="-1"${view<=new Date(today.getFullYear(),today.getMonth(),1)?' disabled':''}>‹</button><button type="button" data-n="1"${next>=new Date(endM.getFullYear(),endM.getMonth(),1)?' disabled':''}>›</button></div><div class="cal-months">${monthHTML(view)}${monthHTML(next)}</div><p class="cal-leg"><span class="sat">토</span> <span class="sun">일·공휴일</span> (날짜에 마우스를 올리면 공휴일 이름이 보여요)</p><p class="cal-sum"></p></div>`;paint();
 }
 box.onclick=ev=>{
  const n=ev.target.closest('[data-n]');if(n){if(n.disabled)return;view=new Date(view.getFullYear(),view.getMonth()+ +n.dataset.n,1);render();return}
  const b=ev.target.closest('.cal-d');if(!b||b.disabled)return;const d=b.dataset.d;
  if(q.only.length){const i=ds.indexOf(d);if(i<0)ds.push(d);else ds.splice(i,1);ds.sort();s=ds[0]||'';e=ds[ds.length-1]||'';paint();onChange(s,e,ds);return}
  if(!s||(s&&e)){s=d;e=''}else if(d<s){s=d}else{e=d}
  paint();onChange(s,e,[]);
 };
 box.onmouseover=ev=>{const b=ev.target.closest('.cal-d');if(b&&s&&!e){hover=b.dataset.d;paint()}};
 render();
 return {paint};
}

// ── 1단계: 조건 ──
const dd=(id,label,body,o={})=>`<div class="fld${o.full?' full':''}"><label>${label}${o.hint?` <em>${o.hint}</em>`:''}</label><div class="dd2${o.right?' right':''}" data-dd="${id}"><button type="button" class="ddb"><span class="ddv empty" data-sum="${id}">선택</span><i>▾</i></button><div class="pop${o.wide?' wide':''}">${body}<div class="popf"><button type="button" class="btn sm" data-close>확인</button></div></div></div></div>`;
// '무관'은 다른 선택과 함께 고를 수 없고, 아무것도 안 고르면 자동으로 '무관'이 됩니다
function bindAny(inputs,max){
 const any=inputs.find(x=>x.value===ANY),others=inputs.filter(x=>x!==any);
 const fix=()=>{if(max){const n=others.filter(o=>o.checked).length;others.forEach(o=>{if(!o.checked)o.disabled=n>=max})}if(any&&!others.some(o=>o.checked))any.checked=true};
 inputs.forEach(i=>i.addEventListener('change',()=>{if(i===any&&i.checked)others.forEach(o=>o.checked=false);else if(i.checked&&any)any.checked=false;fix()}));
 fix();
}
function step1(msg){
 root.innerHTML=`${stepper(1)}<div class="mcard"><h3>원하는 조건을 선택하세요</h3><div class="fgrid">
 ${dd('service','매칭 분야',`<div class="chips">${chips('service',SERVICES,'checkbox')}</div>`,{full:1,hint:'여러 개 선택 가능 · 선택한 분야를 모두 하실 수 있는 분만 보여드려요'})}
 <div class="fld"><label for="m-region">동네 <em>(시·구·동까지)</em></label><input id="m-region" placeholder="예: 서울 강남구 역삼동" autocomplete="off"></div>
 <div class="fld"><label for="m-apt">아파트·건물명 <em>(선택)</em></label><input id="m-apt" placeholder="예: 래미안 역삼" autocomplete="off"></div>
 <p class="hint full" style="margin:-6px 0 12px">가까이 사는 관리사님을 먼저 보여드리기 위해 사용해요. 정확한 주소는 마지막 단계에서 입력합니다.</p>
 ${dd('when','매칭 일정',`<div class="exrow top"><b>제외할 날 선택 <small>체크한 날은 서비스 일수에서 빠져요</small></b><div class="chips">${chips('excl',[['토','토요일 제외'],['일','일요일 제외'],['공휴일','공휴일 제외']],'checkbox')}<button type="button" class="chip-all" id="ex-all">토·일·공휴일 모두 제외</button></div></div><div class="exrow top"><b>특정 요일만 필요하다면 <small>예: 매주 수요일만 · 선택한 요일 외에는 선택할 수 없어요</small></b><div class="chips">${chips('only',[...WD].map(w=>[w,w+'요일']),'checkbox')}</div></div><div id="m-cal"></div>`,{full:1,wide:1})}
 ${dd('env','필요한 조건',`<div class="chips">${anyChips('extras',ENV)}</div>`,{hint:'해당하는 것 모두'})}
 ${dd('pet','반려동물',`<div class="chips">${chips('pets',[[ANY,'없음·무관']].concat(PETS),'checkbox')}</div>`,{right:1,hint:'있다면 선택'})}
 ${dd('traits','성향',`<div class="chips">${anyChips('traits',TRAITS)}</div>`,{hint:'여러 개 선택'})}
 ${dd('mbti','MBTI',`<div class="mbr">${MBR.map((r,i)=>`<div class="mbrow"><span>${r[0]}</span><div class="chips">${chips('mb'+i,[[r[1],`${r[2]} ${r[1]}`],[r[3],`${r[4]} ${r[3]}`],['-','무관']],'radio')}</div></div>`).join('')}</div>`,{right:1,hint:'축별로 선택'})}
 ${dd('ages','연령대',`<div class="chips">${anyChips('ages',AGES)}</div>`,{hint:'여러 개 선택'})}
 ${dd('years','경력',`<div class="chips">${chips('years',YEARS,'radio')}</div>`,{right:1})}
 ${dd('virtues','중요하게 보는 덕목',`<div class="chips">${anyChips('virtues',VIRTUES)}</div><p class="hint">최대 2개까지 고를 수 있어요. 해당 평가가 높은 분을 먼저 보여드려요.</p>`,{hint:'최대 2개'})}
 ${dd('religions','종교',`<div class="chips">${anyChips('religions',RELIGIONS)}</div><p class="hint">선택 사항이에요. 관리사님 정보에는 표시되지 않고, 매칭에만 사용됩니다.</p>`,{right:1,hint:'선호하는 경우만'})}
 </div>
 <p class="fmsg err" id="m-err">${msg||''}</p><button class="btn" id="m-go" type="button"><span>가능한 관리사님 찾기</span></button></div>`;
 const f=n=>[...root.querySelectorAll(`[name=${n}]`)];
 const PETN=['반려견','반려묘'];
 // 상태 → 화면
 f('service').forEach(i=>i.checked=q.service.includes(i.value));root.querySelector('#m-region').value=q.region;root.querySelector('#m-apt').value=q.apt;
 f('excl').forEach(i=>i.checked=q.excl.includes(i.value));f('only').forEach(i=>i.checked=q.only.includes(i.value));
 f('extras').forEach(i=>i.checked=q.extras.includes(i.value));f('pets').forEach(i=>i.checked=q.extras.includes(i.value));
 f('traits').forEach(i=>i.checked=q.traits.includes(i.value));f('ages').forEach(i=>i.checked=q.ages.includes(i.value));
 f('religions').forEach(i=>i.checked=q.religions.includes(i.value));f('virtues').forEach(i=>i.checked=q.virtues.includes(i.value));
 f('years').forEach(i=>i.checked=i.value===q.minYears);
 [0,1,2,3].forEach(k=>f('mb'+k).forEach(i=>i.checked=i.value===(q.mbti[k]||'-')));
 ['extras','pets','traits','ages','religions'].forEach(n=>bindAny(f(n)));bindAny(f('virtues'),2);
 // 화면 → 상태
 const val=n=>f(n).filter(i=>i.checked&&i.value!==ANY).map(i=>i.value);
 const read=()=>{
  q.service=val('service');q.region=root.querySelector('#m-region').value.trim();q.apt=root.querySelector('#m-apt').value.trim();q.excl=val('excl');q.only=val('only');
  q.extras=val('extras').concat(val('pets'));q.traits=val('traits');q.ages=val('ages');q.religions=val('religions');q.virtues=val('virtues');
  q.mbti=[0,1,2,3].map(k=>{const c=f('mb'+k).find(i=>i.checked);return c?c.value:'-'}).join('');const y=f('years').find(i=>i.checked);q.minYears=y?y.value:'';
 };
 const sum=(id,t,empty)=>{const e=root.querySelector(`[data-sum="${id}"]`);e.textContent=t||empty;e.classList.toggle('empty',!t)};
 const label=(arr,more=2)=>arr.length>more?`${arr.slice(0,more).join(', ')} 외 ${arr.length-more}`:arr.join(', ');
 let cal;
 const refresh=()=>{read();
  sum('service',label(q.service),'선택하세요');
  const n=svcDays().length,tot=q.start?days(q.start,q.end||q.start):0;
  sum('when',q.start?`${fmt(q.start)}${q.end&&q.end!==q.start?' ~ '+fmt(q.end):''}${n!==tot?` · 서비스 ${n}일`:''}`:'','날짜를 선택하세요');
  sum('env',label(q.extras.filter(x=>!PETN.includes(x)).map(x=>ENV.find(e=>e[0]===x)[1].replace(/\(.*\)/,''))),'무관');
  sum('pet',label(q.extras.filter(x=>PETN.includes(x)).map(x=>x+' 있음')),'없음·무관');
  sum('traits',label(q.traits),'무관');
  sum('mbti',q.mbti.replace(/-/g,'').split('').join('·'),'무관');
  sum('ages',label(q.ages),'무관');sum('years',q.minYears?q.minYears+'년 이상':'','무관');
  sum('virtues',label(q.virtues),'무관');sum('religions',label(q.religions),'무관');
  if(cal)cal.paint();
 };
 root.querySelectorAll('.pop input').forEach(i=>i.addEventListener('change',refresh));
 root.querySelector('#ex-all').addEventListener('click',()=>{const a=f('excl'),all=a.every(i=>i.checked);a.forEach(i=>i.checked=!all);refresh()});
 root.querySelector('#m-region').addEventListener('input',read);root.querySelector('#m-apt').addEventListener('input',read);
 cal=Calendar(root.querySelector('#m-cal'),(s,e,d)=>{q.start=s;q.end=e;q.dates=d||[];refresh()},{s:q.start,e:q.end,d:q.dates},()=>q.excl);refresh();
 // 선택 상자 열고 닫기
 root.querySelectorAll('.dd2').forEach(d=>{
  d.querySelector('.ddb').onclick=ev=>{ev.stopPropagation();const o=d.classList.contains('open');root.querySelectorAll('.dd2.open').forEach(x=>x.classList.remove('open'));if(!o)d.classList.add('open')};
  d.querySelector('[data-close]').onclick=()=>d.classList.remove('open');
  d.querySelector('.pop').onclick=ev=>ev.stopPropagation();
 });
 root.onclick=()=>root.querySelectorAll('.dd2.open').forEach(x=>x.classList.remove('open'));
 root.querySelector('#m-go').onclick=async()=>{
  read();if(q.start&&!q.end)q.end=q.start;
  const err=!q.service.length?'매칭 분야를 하나 이상 선택해 주세요.':!/[가-힣]/.test(q.region)||q.region.length<4?'동네를 시·구·동까지 입력해 주세요. (예: 서울 강남구 역삼동)':!q.start?'매칭 일정을 선택해 주세요.':!svcDays().length?'선택하신 기간이 모두 제외일이에요. 제외일을 줄이거나 기간을 바꿔 주세요.':'';
  if(err){root.querySelector('#m-err').textContent=err;return}
  const b=root.querySelector('#m-go');b.disabled=true;b.textContent='찾는 중…';
  try{items=await find()}catch(e){items=[];step1('조회에 실패했습니다. 잠시 후 다시 시도해 주세요.');return}
  step2();
 };
}
async function find(){
 if(CFG.endpoint){
  const p=new URLSearchParams({list:'match',service:q.service.join(','),region:q.region,start:q.start,end:q.end,traits:q.traits.join(','),extras:q.extras.join(','),mbti:q.mbti,minYears:q.minYears,ages:q.ages.join(','),religions:q.religions.join(','),virtues:q.virtues.join(','),needHoliday:needHol()?'Y':'N'});
  const j=await (await fetch(CFG.endpoint+'?'+p)).json();if(!j.ok)throw 0;return j.items;
 }
 await new Promise(r=>setTimeout(r,500));
 return window.MatchCore.match(window.SAMPLE_CAREGIVERS,Object.assign({},q,{needHoliday:needHol()?'Y':'N'}));
}
const summary=()=>`<div class="msum">${q.service.map(t=>`<span>${esc(t)}</span>`).join('')}<span>${esc(q.region)}${q.apt?' '+esc(q.apt):''}</span><span>${fmt(q.start)}${q.end!==q.start?' ~ '+fmt(q.end):''}${q.only.length?` (매주 ${q.only.join('·')}요일만${q.dates.length?` · ${q.dates.length}회`:''})`:''}${q.excl.length?` (${q.excl.map(x=>x==='공휴일'?x:x+'요일').join('·')} 제외)`:''}</span>${q.traits.map(t=>`<span>${esc(t)}</span>`).join('')}${q.mbti.replace(/-/g,'').length?`<span>MBTI ${esc(q.mbti.replace(/-/g,'·'))}</span>`:''}${q.ages.map(t=>`<span>${esc(t)}</span>`).join('')}${q.religions.map(t=>`<span>종교 ${esc(t)}</span>`).join('')}${q.virtues.map(t=>`<span>덕목 ${esc(t)}</span>`).join('')}${q.minYears?`<span>경력 ${q.minYears}년 이상</span>`:''}${q.extras.map(t=>`<span>${esc(t)}</span>`).join('')}<button type="button" class="link" id="m-edit">조건 수정</button></div>`;

// ── 2단계: 후보 목록 ──
function step2(){
 const demo=!CFG.endpoint?'<p class="fnote">테스트 화면입니다. 아래 관리사님은 가상의 샘플이며, 접수처 연결 후 실제 관리사님 정보로 바뀝니다.</p>':'';
 root.innerHTML=`${stepper(2)}${summary()}${demo}
 <h3 class="mh">${items.length?`조건에 맞는 관리사님 <b>${items.length}명</b>`:'조건에 맞는 관리사님을 찾지 못했어요'}</h3>
 ${items.length?`<div class="mlist">${items.map((it,i)=>card(it,i)).join('')}</div><p class="fnote">선택하신 관리사님은 <b>확정이 아닙니다.</b> 기관이 연락드려 상담한 뒤 최종 확정됩니다.</p>`
 :`<div class="note">조건에 꼭 맞는 관리사님이 지금은 없어요. 요청을 남겨 주시면 기관에서 조건에 가장 가까운 관리사님을 직접 찾아 연락드립니다.</div><p style="margin-top:16px"><button class="btn" id="m-nopick" type="button">그래도 상담 요청하기</button></p>`}`;
 root.querySelector('#m-edit').onclick=()=>step1();
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{pick=items[+b.dataset.pick];step3()});
 const np=root.querySelector('#m-nopick');if(np)np.onclick=()=>{pick=null;step3()};
 window.scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
}
function card(it,i){
 return `<div class="tcard"><div class="av">${esc(it.name.charAt(0))}</div><div class="tb">
 <h4>${esc(it.name)} 관리사님${it.near?`<span class="hit near">${esc(it.near)}</span>`:''}${it.traitHit&&it.traitHit.length?`<span class="hit">원하시는 성향 일치</span>`:''}</h4>
 <p class="tl">${it.services.map(s=>`<span class="tag">${esc(s)}</span>`).join(' ')}</p>
 <p class="tm">경력 ${esc(it.years)}년${it.rating?` · ★ ${esc(it.rating)}`:''}${it.age?` · ${esc(it.age)}`:''}${it.mbti?` · MBTI ${esc(it.mbti)}`:''}${it.mbtiFull?' <span class="hit">MBTI 일치</span>':''}</p>
 <p class="tm">성향: ${it.traits.map(t=>esc(t)).join(' · ')||'-'}${it.edu?` · 학력 ${esc(it.edu)}`:''}${it.school?` · 수료 ${esc(it.school)}`:''}${it.pet?` · ${esc(it.pet)}`:''}</p>
 ${it.virtues&&Object.keys(it.virtues).length?`<p class="vr">${Object.keys(it.virtues).map(k=>`<span class="${q.virtues.includes(k)?'on':''}">${esc(k)} <b>${esc(it.virtues[k])}</b></span>`).join('')}</p>`:''}
 ${it.tags.length?`<p class="tl">${it.tags.map(t=>`<span class="tag ok">${esc(t)}</span>`).join(' ')}</p>`:''}
 ${it.strength?`<p class="ts">“${esc(it.strength)}”</p>`:''}</div>
 <button class="btn" type="button" data-pick="${i}">선택하기</button></div>`;
}

// ── 3단계: 신청 정보 ──
function step3(){
 const sel=pick?`<div class="msel"><div class="av">${esc(pick.name.charAt(0))}</div><div><b>${esc(pick.name)} 관리사님</b><br><small>${esc(pick.services.join(' · '))} · 경력 ${esc(pick.years)}년</small></div></div>`:`<div class="msel"><div><b>기관 추천 요청</b><br><small>조건에 맞는 관리사님을 기관에서 찾아 연락드립니다</small></div></div>`;
 root.innerHTML=`${stepper(3)}${summary()}<form class="mcard" id="m-form" novalidate><h3>신청 정보를 입력해 주세요</h3>${sel}
 <div class="fld"><label for="n1">성명</label><input id="n1" name="성명" required autocomplete="name"></div>
 <div class="fld"><label for="n2">생년월일</label><input id="n2" name="생년월일" required inputmode="numeric" placeholder="예: 19900521" maxlength="10" autocomplete="bday"></div>
 <div class="fld"><label for="n3">전화번호</label><input id="n3" name="전화번호" type="tel" required placeholder="010-0000-0000" autocomplete="tel"></div>
 <div class="fld"><label for="n4">상세주소</label><input id="n4" name="상세주소" required placeholder="아파트명/동·호수까지" autocomplete="street-address"></div>
 <div class="fld"><label for="n5">주차 및 현관 안내 <em>(선택)</em></label><input id="n5" name="주차·현관 안내" placeholder="예: 지상 주차 가능 / 현관 비밀번호는 상담 후 알려드릴게요"><small class="hint">현관 비밀번호는 여기에 적지 마시고, 상담 후 직접 알려 주세요.</small></div>
 <div class="fld"><label>선호 상담 방법</label><div class="chips">${chips('상담 방법',['문자','카카오톡','통화'],'radio')}</div></div>
 <div class="fld"><label for="n6">요청 사항 <em>(선택)</em></label><textarea id="n6" name="요청 사항" rows="4" placeholder="예: 할머니가 함께 계세요. 이유식은 정해드릴게요. 등 자유롭게 적어 주세요."></textarea></div>
 <div class="fld"><label for="n7">따사로운을 알게 된 경로</label><select id="n7" name="이용 경로" required><option value="">선택해 주세요</option><option>지인 소개</option><option>홈페이지</option><option>검색(네이버·구글 등)</option><option>SNS·블로그</option><option>전단·현수막</option><option>기타</option></select></div>
 <input type="text" name="_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
 <label class="agree"><input type="checkbox" id="n8"> 개인정보 수집·이용에 동의합니다.<br><small>수집 항목: 성명·생년월일·전화번호·주소·요청 내용 · 목적: 돌봄 상담 및 관리사 매칭 · 보유: 목적 달성 후 지체 없이 파기</small></label>
 <p class="fmsg" id="m-msg" role="status"></p>
 <div class="mbtns"><button class="btn ghost2" type="button" id="m-back">이전</button><button class="btn" type="submit">상담 신청하기</button></div></form>`;
 const f=root.querySelector('#m-form'),msg=root.querySelector('#m-msg');
 root.querySelector('#m-edit').onclick=()=>step1();root.querySelector('#m-back').onclick=()=>step2();
 f.querySelector('[name=생년월일]').oninput=e=>{const v=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=v.length>6?`${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6)}`:v.length>4?`${v.slice(0,4)}-${v.slice(4)}`:v};
 f.onsubmit=async ev=>{
  ev.preventDefault();
  const g=n=>(f.elements[n]&&f.elements[n].value||'').trim();
  const bad=!g('성명')?'성명을 입력해 주세요.':!/^\d{4}-\d{2}-\d{2}$/.test(g('생년월일'))?'생년월일을 8자리 숫자로 입력해 주세요. (예: 19900521)':!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(g('전화번호'))?'전화번호를 확인해 주세요.':!g('상세주소')?'상세주소를 입력해 주세요.':!f.querySelector('[name=상담\\ 방법]:checked')?'선호하는 상담 방법을 선택해 주세요.':!g('이용 경로')?'알게 된 경로를 선택해 주세요.':!f.querySelector('#n8').checked?'개인정보 수집·이용에 동의해 주세요.':'';
  if(bad){msg.className='fmsg err';msg.textContent=bad;return}
  if(f._hp&&f._hp.value)return;
  const v={'선택 관리사님':pick?pick.name+' 관리사님':'(기관 추천 요청)','선택 관리번호':pick?pick.id:'','매칭 분야':q.service.join(', '),'지역':q.region,'아파트명':q.apt,'일정 시작':q.start,'일정 종료':q.end,'제외일':q.excl.join(', ')||'없음','지정 요일':q.only.join(', ')||'전체','선택한 날짜':q.only.length?q.dates.join(', '):'','서비스 일수':svcDays().length,'휴·공휴일 근무 필요':needHol()?'예':'아니오','희망 성향':q.traits.join(', ')||'상관없음','기타 조건':q.extras.join(', ')||'무관','희망 MBTI':q.mbti.replace(/-/g,'·')==='····'?'상관없음':q.mbti.replace(/-/g,'·'),'희망 덕목':q.virtues.join(', ')||'무관','희망 종교':q.religions.join(', ')||'무관','희망 연령대':q.ages.join(', ')||'상관없음','희망 최소경력':q.minYears?q.minYears+'년 이상':'상관없음',
   '요청 사항':g('요청 사항'),'성명':g('성명'),'생년월일':g('생년월일'),'전화번호':g('전화번호'),'상세주소':g('상세주소'),'주차·현관 안내':g('주차·현관 안내'),'상담 방법':f.querySelector('[name=상담\\ 방법]:checked').value,'이용 경로':g('이용 경로')};
  const payload={form:'match',title:'번개매칭 신청',labels:Object.keys(v),values:v,page:location.pathname,lang:cookieLang()};
  const btn=f.querySelector('[type=submit]');btn.disabled=true;msg.className='fmsg';msg.textContent='전송 중입니다…';
  try{const r=await window.TtasaSend(payload);done(r==='test')}catch(e){msg.className='fmsg err';msg.textContent='전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.';btn.disabled=false}
 };
 window.scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
}
function done(test){
 root.innerHTML=`<div class="mcard mdone"><div class="ok">✓</div><h3>${test?'테스트 접수 완료':'신청이 접수되었습니다'}</h3>
 <p>${pick?`<b>${esc(pick.name)} 관리사님</b> 매칭 요청을`:'매칭 요청을'} 받았어요.<br>기관에서 선택하신 방법으로 연락드려 상담한 뒤 <b>최종 확정</b>해 드립니다.</p>
 ${test?'<p class="fnote">접수처가 아직 연결되지 않아 실제로 전송되지는 않았습니다.</p>':''}
 <button class="btn" type="button" id="m-again">처음으로</button></div>`;
 root.querySelector('#m-again').onclick=()=>{q=fresh();pick=null;step1()};
}
step1();
})();
