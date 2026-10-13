// 응애맘빠 행사 일정 — 이 파일의 EVENTS만 고치면 달력과 목록, 신청 양식의 '참가 희망 행사'가 함께 바뀝니다.
// sample:true 는 임시 예시입니다. 확정하면 sample 줄을 지우세요. (주로 한 달에 한 번, 토요일)
window.EVENTS=[
 {date:'2026-10-24',title:'예비부부 출산 준비 교실 · 10월',time:'10:00~13:00',place:'따사로운 평생교육원 (주소 입력)',seats:20,left:6,summary:'출산 준비물, 병원·산후조리 계획, 부부 역할 나누기',sample:true},
 {date:'2026-11-28',title:'예비부부 신생아 돌봄 실습 · 11월',time:'10:00~13:00',place:'따사로운 평생교육원 (주소 입력)',seats:20,left:14,summary:'안기·목욕·기저귀 교체 실습, 수유 자세',sample:true},
 {date:'2026-12-19',title:'산후 회복과 마음 챙기기 · 12월',time:'10:00~13:00',place:'따사로운 평생교육원 (주소 입력)',seats:20,left:20,summary:'산후 회복, 산후우울 이해, 가족 도움 계획',sample:true},
 {date:'2027-01-23',title:'예비부부 출산 준비 교실 · 1월',time:'10:00~13:00',place:'따사로운 평생교육원 (주소 입력)',seats:20,left:20,summary:'출산 준비물, 병원·산후조리 계획, 부부 역할 나누기',sample:true},
 {date:'2027-02-27',title:'예비부부 신생아 돌봄 실습 · 2월',time:'10:00~13:00',place:'따사로운 평생교육원 (주소 입력)',seats:20,left:20,summary:'안기·목욕·기저귀 교체 실습, 수유 자세',sample:true}
];
(function(){
const E=window.EVENTS,WD='일월화수목금토';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const today=new Date();today.setHours(0,0,0,0);
const fmt=s=>{const d=parse(s);return `${d.getMonth()+1}월 ${d.getDate()}일(${WD[d.getDay()]})`};
const status=e=>parse(e.date)<today?['종료','b']:e.left<=0?['마감','b']:e.left<=3?['마감임박','w']:['모집중','o'];
const label=e=>`${fmt(e.date)} ${e.title}`;
window.TtasaEventOptions=()=>['아직 정하지 못했어요 (다음 일정 안내 요청)'].concat(E.filter(e=>status(e)[0]!=='종료'&&status(e)[0]!=='마감').map(label));
const box=document.getElementById('ev-cal');if(!box)return;
const upcoming=E.filter(e=>parse(e.date)>=today);
let sel=(upcoming[0]||E[0]||{}).date||'',view=sel?new Date(parse(sel).getFullYear(),parse(sel).getMonth(),1):new Date(today.getFullYear(),today.getMonth(),1);
const first=E.map(e=>parse(e.date)).sort((a,b)=>a-b),minM=new Date(first[0].getFullYear(),first[0].getMonth(),1),maxM=new Date(first[first.length-1].getFullYear(),first[first.length-1].getMonth(),1);
const month=m=>{
 const f=new Date(m.getFullYear(),m.getMonth(),1),l=new Date(m.getFullYear(),m.getMonth()+1,0);
 let h=`<div class="cal-m"><div class="cal-t">${m.getFullYear()}년 ${m.getMonth()+1}월</div><div class="cal-g">`+[...WD].map((w,i)=>`<span class="cal-w${i===0?' sun':i===6?' sat':''}">${w}</span>`).join('');
 for(let i=0;i<f.getDay();i++)h+='<span></span>';
 for(let d=1;d<=l.getDate();d++){const dt=new Date(m.getFullYear(),m.getMonth(),d),k=iso(dt),ev=E.find(e=>e.date===k),w=dt.getDay();
  h+=ev?`<button type="button" class="cal-d evd${k===sel?' sel':''}${status(ev)[0]==='종료'?' past':''}" data-ev="${k}" title="${esc(ev.title)}">${d}<i></i></button>`:`<button type="button" class="cal-d${w===0?' sun':w===6?' sat':''}" disabled>${d}</button>`}
 return h+'</div></div>';
};
const card=e=>{const [st,c]=status(e),open=st==='모집중'||st==='마감임박';
 return `<article class="evc${e.date===sel?' on':''}" data-card="${e.date}"><div class="evd2"><b>${parse(e.date).getMonth()+1}.${parse(e.date).getDate()}</b><span>${WD[parse(e.date).getDay()]}요일</span></div>
 <div class="evb"><h3>${esc(e.title)} <span class="tag ${c==='o'?'ok':''}">${st}</span>${e.sample?' <span class="smp">예시</span>':''}</h3><p>${esc(e.summary)}</p>
 <p class="evm"><span>${esc(e.time)}</span> · <span>${esc(e.place)}</span> · <span>정원</span> ${e.seats}<span>쌍</span>${open?` · <span>남은 자리</span> ${e.left}`:''}</p></div>
 <div class="eva">${open?`<button type="button" class="btn sm" data-apply="${e.date}">이 날 신청하기</button>`:`<span class="mute">${st==='종료'?'지난 행사':'마감되었어요'}</span>`}</div></article>`};
function render(){
 const next=new Date(view.getFullYear(),view.getMonth()+1,1);
 box.innerHTML=`<div class="cal evcal"><div class="cal-nav"><button type="button" data-n="-1"${view<=minM?' disabled':''}>‹</button><button type="button" data-n="1"${next>=maxM?' disabled':''}>›</button></div><div class="cal-months">${month(view)}${month(next)}</div>
 <p class="cal-leg"><span class="evdot"></span> 응애맘빠 행사일 · 날짜를 눌러 보세요</p></div><div class="ev-list">${E.filter(e=>parse(e.date)>=today||e.date===sel).sort((a,b)=>a.date.localeCompare(b.date)).map(card).join('')}</div>`;
}
const toForm=date=>{
 const e=E.find(x=>x.date===date);if(!e)return;
 const f=document.querySelector('[data-form="class"]');if(f)f.scrollIntoView({behavior:'smooth',block:'start'});
 let n=0;const t=setInterval(()=>{const s=document.querySelector('[data-form="class"] select[name="참가 희망 행사"]');if(s){clearInterval(t);const o=[...s.options].find(x=>x.value===label(e)||x.textContent===label(e));if(o)s.value=o.value}else if(++n>40)clearInterval(t)},150);
};
box.addEventListener('click',ev=>{
 const n=ev.target.closest('[data-n]');if(n&&!n.disabled){view=new Date(view.getFullYear(),view.getMonth()+ +n.dataset.n,1);render();return}
 const d=ev.target.closest('[data-ev]');if(d){sel=d.dataset.ev;render();const c=box.querySelector(`[data-card="${sel}"]`);if(c)c.scrollIntoView({behavior:'smooth',block:'nearest'});return}
 const a=ev.target.closest('[data-apply]');if(a)toForm(a.dataset.apply);
});
render();
})();
