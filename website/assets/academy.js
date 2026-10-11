(function(){
const C=window.COURSES||[];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ST={'모집중':'o','모집예정':'','마감임박':'w','마감':'b'};
const cardBadge=c=>c.card==='both'?'<span class="tag ok">내일배움카드 가능</span> <span class="tag">자비 수강</span>':'<span class="tag">자비 수강</span>';
const q=id=>document.getElementById(id);
if(q('ac-programs'))q('ac-programs').innerHTML=C.map(c=>`<a class="card prog" href="#c-${c.id}"><span class="tag">${esc(c.hours)}</span>${c.sample?'<span class="smp">예시</span>':''}<h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p><p class="tl">${cardBadge(c)}</p></a>`).join('');
if(q('ac-courses'))q('ac-courses').innerHTML=C.map(c=>`<article class="course" id="c-${c.id}">
 <header><div><h3>${esc(c.name)}</h3><p class="tl">${cardBadge(c)}${c.sample?' <span class="smp">예시 · 확정 전</span>':''}</p></div><button type="button" class="btn sm" data-ask="${esc(c.name)}">수강 문의</button></header>
 <dl class="kv"><dt>교육 대상</dt><dd>${esc(c.target)}</dd><dt>교육 시간</dt><dd>총 ${esc(c.hours)} (${esc(c.hoursDetail)})</dd><dt>교육 장소</dt><dd>${esc(c.place)}</dd><dt>교육비</dt><dd>${esc(c.fee)}<br><small>자비부담: ${esc(c.self)}</small></dd><dt>수료 기준</dt><dd>${esc(c.completion)}</dd><dt>수료 후</dt><dd>${esc(c.after)}</dd></dl>
 <div class="tw2"><table><thead><tr><th>기수</th><th>교육 기간</th><th>요일</th><th>시간</th><th>정원</th><th>접수</th></tr></thead><tbody>${c.schedule.map(s=>`<tr><td>${esc(s.round)}</td><td>${esc(s.period)}</td><td>${esc(s.days)}</td><td>${esc(s.time)}</td><td>${esc(s.seats)}명</td><td><span class="pill ${ST[s.status]||''}">${esc(s.status)}</span></td></tr>`).join('')}</tbody></table></div></article>`).join('');
// 트랙 탭
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('[data-track]').forEach(x=>x.classList.toggle('on',x===b));
 document.querySelectorAll('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==b.dataset.track);
});
// 수강 문의 → 폼 과정 자동 선택
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-ask]');if(!b)return;
 const box=document.querySelector('[data-form="academy"]'),sel=box&&box.querySelector('select[name="과정"]');
 if(sel){sel.value=b.dataset.ask}
 if(box)box.scrollIntoView({behavior:'smooth',block:'center'});
});
})();
