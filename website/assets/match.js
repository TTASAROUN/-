// 번개매칭: 조건 선택 → 가능한 선생님 목록 → 선택 → 신청 정보 → 접수(기관이 연락 후 확정)
(function(){
const root=document.querySelector('[data-match]');if(!root)return;
const CFG=window.SITE_CONFIG||{};
const SERVICES=['산후관리사','영유아 관리사','가사관리사','정리수납전문가','이유식전문가'];
const TRAITS=['차분','조용','쾌활·유쾌','사교','전문'];
const EXTRAS=[['자차','자차 보유'],['반려견','댁에 반려견이 있어요'],['반려묘','댁에 반려묘가 있어요'],['50대','50대 선호'],['60대','60대 선호'],['입주','입주 가능'],['무관','무관']];
const WD='일월화수목금토';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>n<10?'0'+n:''+n;
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const fmt=s=>{const d=parse(s);return `${d.getMonth()+1}월 ${d.getDate()}일(${WD[d.getDay()]})`};
const days=(a,b)=>Math.round((parse(b)-parse(a))/864e5)+1;
let q={service:'',region:'',start:'',end:'',traits:[],extras:[]},pick=null,items=[];

const chips=(name,list,type)=>list.map(x=>{const v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return `<label class="chip"><input type="${type}" name="${name}" value="${esc(v)}"><span>${esc(l)}</span></label>`}).join('');
const stepper=n=>`<ol class="mstep">${['조건 선택','선생님 선택','신청 정보'].map((t,i)=>`<li class="${i+1===n?'on':i+1<n?'done':''}"><b>${i+1}</b>${t}</li>`).join('')}</ol>`;

// ── 달력 (항공권 예약처럼 시작일 → 종료일) ──
function Calendar(box,onChange){
 const today=new Date();today.setHours(0,0,0,0);
 let view=new Date(today.getFullYear(),today.getMonth(),1),s='',e='',hover='';
 const monthHTML=m=>{
  const first=new Date(m.getFullYear(),m.getMonth(),1),last=new Date(m.getFullYear(),m.getMonth()+1,0);
  let h=`<div class="cal-m"><div class="cal-t">${m.getFullYear()}년 ${m.getMonth()+1}월</div><div class="cal-g">`+[...WD].map((w,i)=>`<span class="cal-w${i===0?' sun':''}">${w}</span>`).join('');
  for(let i=0;i<first.getDay();i++)h+='<span></span>';
  for(let d=1;d<=last.getDate();d++){const dt=new Date(m.getFullYear(),m.getMonth(),d);h+=`<button type="button" class="cal-d${dt.getDay()===0?' sun':''}" data-d="${iso(dt)}"${dt<today?' disabled':''}>${d}</button>`}
  return h+'</div></div>';
 };
 function paint(){
  const end=e||(s&&hover&&hover>=s?hover:'');
  box.querySelectorAll('.cal-d').forEach(b=>{
   const d=b.dataset.d;b.classList.toggle('sel',d===s||d===e);
   b.classList.toggle('in',!!(s&&end&&d>s&&d<end));b.classList.toggle('first',d===s&&!!end&&end!==s);b.classList.toggle('lastd',d===end&&end!==s);
  });
  box.querySelector('.cal-sum').innerHTML=!s?'시작일을 선택하세요':!e?`<b>${fmt(s)}</b> ~ 종료일을 선택하세요 <small>(하루만 필요하면 같은 날짜를 한 번 더 누르세요)</small>`:`<b>${fmt(s)}</b> ~ <b>${fmt(e)}</b> · ${days(s,e)}일`;
 }
 function render(){
  const next=new Date(view.getFullYear(),view.getMonth()+1,1);
  box.innerHTML=`<div class="cal"><div class="cal-nav"><button type="button" data-n="-1"${view<=new Date(today.getFullYear(),today.getMonth(),1)?' disabled':''}>‹</button><button type="button" data-n="1">›</button></div><div class="cal-months">${monthHTML(view)}${monthHTML(next)}</div><p class="cal-sum"></p></div>`;paint();
 }
 box.onclick=ev=>{
  const n=ev.target.closest('[data-n]');if(n){view=new Date(view.getFullYear(),view.getMonth()+ +n.dataset.n,1);render();return}
  const b=ev.target.closest('.cal-d');if(!b||b.disabled)return;const d=b.dataset.d;
  if(!s||(s&&e)){s=d;e=''}else if(d<s){s=d}else{e=d}
  paint();onChange(s,e);
 };
 box.onmouseover=ev=>{const b=ev.target.closest('.cal-d');if(b&&s&&!e){hover=b.dataset.d;paint()}};
 render();
}

// ── 1단계: 조건 ──
function step1(msg){
 root.innerHTML=`${stepper(1)}<div class="mcard"><h3>원하는 조건을 선택하세요</h3>
 <div class="fld"><label>매칭 분야</label><div class="chips">${chips('service',SERVICES,'radio')}</div></div>
 <div class="fld"><label for="m-region">지역</label><input id="m-region" placeholder="예: 서울 강남구" autocomplete="off"></div>
 <div class="fld"><label>매칭 일정</label><div id="m-cal"></div></div>
 <div class="fld"><label>원하는 성향 <em>(여러 개 선택 · 선택하지 않으면 상관없음)</em></label><div class="chips">${chips('traits',TRAITS,'checkbox')}</div></div>
 <div class="fld"><label>기타 조건 <em>(해당하는 것을 모두 선택)</em></label><div class="chips">${chips('extras',EXTRAS,'checkbox')}</div></div>
 <p class="fmsg err" id="m-err">${msg||''}</p><button class="btn" id="m-go" type="button"><span>가능한 선생님 찾기</span></button></div>`;
 const f=(n)=>[...root.querySelectorAll(`[name=${n}]`)];
 if(q.service)f('service').forEach(i=>i.checked=i.value===q.service);
 root.querySelector('#m-region').value=q.region;
 f('traits').forEach(i=>i.checked=q.traits.includes(i.value));f('extras').forEach(i=>i.checked=q.extras.includes(i.value));
 Calendar(root.querySelector('#m-cal'),(s,e)=>{q.start=s;q.end=e});
 f('extras').forEach(i=>i.onchange=()=>{ // '무관'은 단독 선택
  if(i.value==='무관'&&i.checked)f('extras').forEach(o=>{if(o!==i)o.checked=false});
  else if(i.checked)f('extras').forEach(o=>{if(o.value==='무관')o.checked=false});
 });
 root.querySelector('#m-go').onclick=async()=>{
  const sv=f('service').find(i=>i.checked);q.region=root.querySelector('#m-region').value.trim();
  q.traits=f('traits').filter(i=>i.checked).map(i=>i.value);q.extras=f('extras').filter(i=>i.checked).map(i=>i.value).filter(x=>x!=='무관');q.service=sv?sv.value:'';
  if(q.start&&!q.end)q.end=q.start;
  const err=!q.service?'매칭 분야를 선택해 주세요.':!q.region?'지역을 입력해 주세요.':!q.start?'달력에서 일정을 선택해 주세요.':'';
  if(err){root.querySelector('#m-err').textContent=err;return}
  const b=root.querySelector('#m-go');b.disabled=true;b.textContent='찾는 중…';
  try{items=await find()}catch(e){items=[];step1('조회에 실패했습니다. 잠시 후 다시 시도해 주세요.');return}
  step2();
 };
}
async function find(){
 if(CFG.endpoint){
  const p=new URLSearchParams({list:'match',service:q.service,region:q.region,start:q.start,end:q.end,traits:q.traits.join(','),extras:q.extras.join(',')});
  const j=await (await fetch(CFG.endpoint+'?'+p)).json();if(!j.ok)throw 0;return j.items;
 }
 await new Promise(r=>setTimeout(r,500));
 return window.MatchCore.match(window.SAMPLE_CAREGIVERS,q);
}
const summary=()=>`<div class="msum"><span>${esc(q.service)}</span><span>${esc(q.region)}</span><span>${fmt(q.start)}${q.end!==q.start?' ~ '+fmt(q.end):''}</span>${q.traits.map(t=>`<span>${esc(t)}</span>`).join('')}${q.extras.map(t=>`<span>${esc(t)}</span>`).join('')}<button type="button" class="link" id="m-edit">조건 수정</button></div>`;

// ── 2단계: 후보 목록 ──
function step2(){
 const demo=!CFG.endpoint?'<p class="fnote">테스트 화면입니다. 아래 선생님은 가상의 샘플이며, 접수처 연결 후 실제 선생님 정보로 바뀝니다.</p>':'';
 root.innerHTML=`${stepper(2)}${summary()}${demo}
 <h3 class="mh">${items.length?`조건에 맞는 선생님 <b>${items.length}명</b>`:'조건에 맞는 선생님을 찾지 못했어요'}</h3>
 ${items.length?`<div class="mlist">${items.map((it,i)=>card(it,i)).join('')}</div><p class="fnote">선택하신 선생님은 <b>확정이 아닙니다.</b> 기관이 연락드려 상담한 뒤 최종 확정됩니다.</p>`
 :`<div class="note">조건에 꼭 맞는 선생님이 지금은 없어요. 요청을 남겨 주시면 기관에서 조건에 가장 가까운 선생님을 직접 찾아 연락드립니다.</div><p style="margin-top:16px"><button class="btn" id="m-nopick" type="button">그래도 상담 요청하기</button></p>`}`;
 root.querySelector('#m-edit').onclick=()=>step1();
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{pick=items[+b.dataset.pick];step3()});
 const np=root.querySelector('#m-nopick');if(np)np.onclick=()=>{pick=null;step3()};
 window.scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
}
function card(it,i){
 return `<div class="tcard"><div class="av">${esc(it.name.charAt(0))}</div><div class="tb">
 <h4>${esc(it.name)} 선생님${it.traitHit&&it.traitHit.length?`<span class="hit">원하시는 성향 일치</span>`:''}</h4>
 <p class="tl">${it.services.map(s=>`<span class="tag">${esc(s)}</span>`).join(' ')}</p>
 <p class="tm">경력 ${esc(it.years)}년${it.rating?` · ★ ${esc(it.rating)}`:''}${it.age?` · ${esc(it.age)}`:''}${it.mbti?` · ${esc(it.mbti)}`:''}</p>
 <p class="tm">${it.traits.map(t=>esc(t)).join(' · ')}${it.car?' · 자차':''}${it.live?' · 입주 가능':''}</p>
 ${it.strength?`<p class="ts">“${esc(it.strength)}”</p>`:''}</div>
 <button class="btn" type="button" data-pick="${i}">선택하기</button></div>`;
}

// ── 3단계: 신청 정보 ──
function step3(){
 const sel=pick?`<div class="msel"><div class="av">${esc(pick.name.charAt(0))}</div><div><b>${esc(pick.name)} 선생님</b><br><small>${esc(pick.services.join(' · '))} · 경력 ${esc(pick.years)}년</small></div></div>`:`<div class="msel"><div><b>기관 추천 요청</b><br><small>조건에 맞는 선생님을 기관에서 찾아 연락드립니다</small></div></div>`;
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
  const v={'선택 선생님':pick?pick.name+' 선생님':'(기관 추천 요청)','선택 관리번호':pick?pick.id:'','매칭 분야':q.service,'지역':q.region,'일정 시작':q.start,'일정 종료':q.end,'희망 성향':q.traits.join(', ')||'상관없음','기타 조건':q.extras.join(', ')||'무관',
   '요청 사항':g('요청 사항'),'성명':g('성명'),'생년월일':g('생년월일'),'전화번호':g('전화번호'),'상세주소':g('상세주소'),'주차·현관 안내':g('주차·현관 안내'),'상담 방법':f.querySelector('[name=상담\\ 방법]:checked').value,'이용 경로':g('이용 경로')};
  const payload={form:'match',title:'번개매칭 신청',labels:Object.keys(v),values:v,page:location.pathname,lang:(document.cookie.match(/googtrans=\/ko\/([\w-]+)/)||[])[1]||'ko'};
  const btn=f.querySelector('[type=submit]');btn.disabled=true;msg.className='fmsg';msg.textContent='전송 중입니다…';
  try{const r=await window.TtasaSend(payload);done(r==='test')}catch(e){msg.className='fmsg err';msg.textContent='전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.';btn.disabled=false}
 };
 window.scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
}
function done(test){
 root.innerHTML=`<div class="mcard mdone"><div class="ok">✓</div><h3>${test?'테스트 접수 완료':'신청이 접수되었습니다'}</h3>
 <p>${pick?`<b>${esc(pick.name)} 선생님</b> 매칭 요청을`:'매칭 요청을'} 받았어요.<br>기관에서 선택하신 방법으로 연락드려 상담한 뒤 <b>최종 확정</b>해 드립니다.</p>
 ${test?'<p class="fnote">접수처가 아직 연결되지 않아 실제로 전송되지는 않았습니다.</p>':''}
 <button class="btn" type="button" id="m-again">처음으로</button></div>`;
 root.querySelector('#m-again').onclick=()=>{q={service:'',region:'',start:'',end:'',traits:[],extras:[]};pick=null;step1()};
}
step1();
})();
