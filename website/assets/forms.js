// 신청/문의/의견 폼. 각 페이지에 <div data-form="이름"></div> 를 두면 자동으로 만들어집니다.
(function(){
const CFG=window.SITE_CONFIG||{};
window.cookieLang=()=>{try{return(document.cookie.match(/googtrans=\/ko\/([\w-]+)/)||[])[1]||'ko'}catch(e){return 'ko'}};
const cookieLang=window.cookieLang;
const SVC=['산모신생아 건강관리','영유아 관리','가사관리','정리수납'];
// k:내부키(시트 제목 겸용) t:종류 o:선택지 opt:선택입력 ph:안내문구
const FORMS={
 consult:{title:'상담 신청',btn:'상담 신청하기',f:[
  {k:'서비스',t:'select',o:SVC},{k:'이름'},{k:'연락처',t:'tel'},{k:'지역',ph:'예: 서울 강남구'},{k:'희망 시작일',ph:'예: 11월 초 / 출산 예정일',opt:1},{k:'문의 내용',t:'textarea',opt:1}]},
 growth:{title:'성장노트에 의견 남기기',btn:'의견 남기기',f:[
  {k:'구분',t:'select',o:['칭찬','불편','제안']},{k:'서비스',t:'select',o:SVC.concat(['응애맘빠','평생교육원','따사마켓','기타'])},{k:'내용',t:'textarea',ph:'어떤 일이 있었는지 편하게 적어 주세요.'},
  {k:'표시 이름(선택)',ph:'공개 시 보여질 이름 (예: 김OO 고객님)',opt:1},{k:'연락처(선택)',t:'tel',ph:'처리 결과를 안내받으실 번호 (비공개)',opt:1},
  {k:'공개 동의',t:'select',o:['개인정보를 가리고 사례로 공개해도 좋습니다','공개하지 말아 주세요']}],
  note:'접수된 의견은 삭제하지 않고 처리 과정과 결과를 기록합니다. 공개 시 이름·연락처 등 개인정보는 가려집니다.'},
 class:{title:'응애맘빠 참가 신청',btn:'참가 신청하기',f:[
  {k:'신청자 이름'},{k:'배우자 이름'},{k:'연락처',t:'tel'},{k:'출산 예정월',ph:'예: 2027년 3월'},{k:'희망 일정',ph:'예: 주말 오전',opt:1},{k:'문의 내용',t:'textarea',opt:1}],
  note:'예비부부만 신청할 수 있습니다. 자격 확인 방법은 접수 후 개별 안내드립니다.'},
 branch:{title:'지사 문의',btn:'문의하기',f:[
  {k:'이름'},{k:'연락처',t:'tel'},{k:'희망 지역'},{k:'관련 경력/현재 사업',opt:1,t:'textarea'},{k:'문의 내용',t:'textarea',opt:1}]},
 academy:{title:'수강 문의',btn:'수강 문의하기',f:[
  {k:'과정',t:'select',o:['산모신생아 건강관리사 양성','영유아 관리사 양성','가사관리 실무','기타']},{k:'이름'},{k:'연락처',t:'tel'},{k:'문의 내용',t:'textarea',opt:1}]}
};
// 접수 전송 (다른 스크립트에서도 사용): 접수처 미연결이면 'test', 성공이면 'ok'
async function send(payload){
 if(!CFG.endpoint){
  payload.ts=Date.now();
  try{const q=JSON.parse(localStorage.getItem('ttasa_test')||'[]');q.push(payload);localStorage.setItem('ttasa_test',JSON.stringify(q))}catch(e){}
  await new Promise(r=>setTimeout(r,500));return 'test';
 }
 const r=await fetch(CFG.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'fail');return 'ok';
}
window.TtasaSend=send;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function field(x,i){
 const id='f'+Math.random().toString(36).slice(2,7),req=x.opt?'':' required';
 const lab=`<label for="${id}">${x.k.replace('(선택)','')}${x.opt?' <em>(선택)</em>':''}</label>`;
 let inp;
 if(x.t==='select')inp=`<select id="${id}" name="${esc(x.k)}"${req}>${x.o.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;
 else if(x.t==='textarea')inp=`<textarea id="${id}" name="${esc(x.k)}" rows="4" placeholder="${esc(x.ph||'')}"${req}></textarea>`;
 else inp=`<input id="${id}" name="${esc(x.k)}" type="${x.t||'text'}" placeholder="${esc(x.ph||'')}"${req}>`;
 return `<div class="fld">${lab}${inp}</div>`;
}
document.querySelectorAll('[data-form]').forEach(box=>{
 const def=FORMS[box.dataset.form];if(!def)return;
 box.classList.add('formbox');
 box.innerHTML=`<form novalidate><h3>${def.title}</h3>${def.f.map(field).join('')}
 <input type="text" name="_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
 <label class="agree"><input type="checkbox" required> 개인정보 수집·이용에 동의합니다. ${CFG.privacyUrl?`<a href="${CFG.privacyUrl}" target="_blank">보기</a>`:''}<br><small>수집 항목: 위에 입력하신 내용 · 목적: 상담 및 서비스 안내 · 보유: 목적 달성 후 지체 없이 파기</small></label>
 ${def.note?`<p class="fnote">${def.note}</p>`:''}
 <button class="btn" type="submit">${def.btn}</button><p class="fmsg" role="status"></p></form>`;
 const form=box.querySelector('form'),msg=box.querySelector('.fmsg'),btn=form.querySelector('button');
 if(box.dataset.service){const s=form.querySelector('select');if(s&&SVC.includes(box.dataset.service))s.value=box.dataset.service}
 form.onsubmit=async e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  if(form._hp&&form._hp.value)return;
  const values={};def.f.forEach((x,i)=>{const el=form.elements[x.k];values[x.k]=el?el.value.trim():''});
  const payload={form:box.dataset.form,title:def.title,labels:def.f.map(x=>x.k),values,page:location.pathname,lang:cookieLang()};
  btn.disabled=true;msg.className='fmsg';msg.textContent='전송 중입니다…';
  try{
   const res=await send(payload);
   if(res==='test'){msg.className='fmsg warn';msg.textContent='테스트 모드: 아직 접수처가 연결되지 않아 전송되지 않았습니다. (config.js 설정 필요)'}
   else{form.reset();msg.className='fmsg ok';msg.textContent='접수되었습니다. 확인 후 빠르게 연락드리겠습니다. 감사합니다.'}
  }catch(err){msg.className='fmsg err';msg.textContent='전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.'}
  btn.disabled=false;
 };
});
// 성장노트: 승인된 사례 불러오기
const feed=document.querySelector('[data-feed="growth"]');
if(feed&&CFG.endpoint){
 fetch(CFG.endpoint+'?list=growth').then(r=>r.json()).then(j=>{
  if(!j.ok||!j.items.length)return;
  feed.innerHTML=j.items.map(it=>`<div class="card" data-k="${it['구분']==='칭찬'?'praise':'improve'}"><span class="tag">${esc(it['구분'])} · ${esc(it['서비스'])}</span><h3>${esc(it['표시 이름']||'고객님')}</h3><p>${esc(it['내용'])}</p>${it['처리결과']?`<p class="res"><b>처리 결과</b> ${esc(it['처리결과'])}</p>`:''}${it['개선내용']?`<p class="res"><b>이렇게 개선했어요</b> ${esc(it['개선내용'])}</p>`:''}</div>`).join('');
 }).catch(()=>{});
}
})();
