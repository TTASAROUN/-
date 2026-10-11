(function(){
// 저장소: 데모는 브라우저(localStorage). 막혀 있으면 메모리로 동작.
const mem={};
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return mem[k]!==undefined?mem[k]:d}},set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const NAME={consult:'상담 신청',match:'번개매칭',growth:'성장노트',class:'응애맘빠',branch:'지사 문의',academy:'수강 문의',quote:'정리수납 견적'};
const STATUS=['접수','연락중','확정','완료','보류'];
const CG=window.SAMPLE_CAREGIVERS||[];
let tab='inbox',filter='all',open=null;
const subs=()=>LS.get('ttasa_test',[]).map((p,i)=>(p.ts=p.ts||1+i,p));
const meta=()=>LS.get('ttasa_meta',{});
const setMeta=(ts,o)=>{const m=meta();m[ts]=Object.assign(m[ts]||{},o);LS.set('ttasa_meta',m)};
const st=p=>(meta()[p.ts]||{}).status||'접수';
const when=ts=>{const d=new Date(ts);return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
const who=p=>p.values['성명']||p.values['신청자 이름']||p.values['이름']||p.values['표시 이름(선택)']||'-';
const one=p=>{const v=p.values;return p.form==='match'?`${v['매칭 분야']} · ${v['지역']} · ${v['일정 시작']}~${v['일정 종료']}`:p.form==='growth'?`[${v['구분']}] ${v['내용']}`:p.form==='class'?`출산 예정 ${v['출산 예정월']}`:p.form==='branch'?`희망 ${v['희망 지역']}`:p.form==='consult'?`${v['서비스']} · ${v['지역']}`:p.form==='quote'?`${v['견적 방법']} · ${v['정리할 공간']} · ${v['동네']}`:(v['과정']||'')};
const docDays=c=>{const ks=['건강진단서 만료일','범죄경력조회 만료일','아동학대범죄경력 만료일'];const now=new Date();now.setHours(0,0,0,0);let m=1e9;ks.forEach(k=>{const d=new Date(c[k]);m=Math.min(m,isNaN(d)?-1:Math.round((d-now)/864e5))});return m};
const docPill=c=>{const d=docDays(c);return d<0?'<span class="pill b">서류 만료</span>':d<60?`<span class="pill w">서류 ${d}일 남음</span>`:'<span class="pill o">서류 정상</span>'};
const stSel=p=>`<select data-st="${p.ts}">${STATUS.map(s=>`<option${s===st(p)?' selected':''}>${s}</option>`).join('')}</select>`;

function seed(){
 const t=Date.now(),H=36e5,L=LS.get('ttasa_test',[]);
 const mk=(f,v,ago,extra)=>Object.assign({form:f,title:NAME[f],labels:Object.keys(v),values:v,page:'(예시)',lang:'ko',ts:t-ago*H,demo:true},extra);
 L.push(
  mk('match',{'선택 관리사님':'김○○ 관리사님','선택 관리번호':'S-001','매칭 분야':'영유아 관리사, 이유식전문가','지역':'서울 강남구','일정 시작':'2026-11-03','일정 종료':'2026-11-07','희망 성향':'차분','기타 조건':'자차','희망 MBTI':'상관없음','희망 연령대':'상관없음','희망 최소경력':'5년 이상','요청 사항':'할머니가 함께 계세요. 이유식은 정해드릴게요.','성명':'이지은(예시)','생년월일':'1992-04-18','전화번호':'010-1111-2222','상세주소':'OO아파트 101동 (예시)','주차·현관 안내':'지상 주차 가능','상담 방법':'카카오톡','이용 경로':'지인 소개'},2),
  mk('match',{'선택 관리사님':'박○○ 관리사님','선택 관리번호':'S-002','매칭 분야':'산후관리사','지역':'서울 서초구','일정 시작':'2026-11-10','일정 종료':'2026-11-24','희망 성향':'쾌활·유쾌','기타 조건':'다태아','희망 MBTI':'상관없음','희망 연령대':'50대','희망 최소경력':'상관없음','요청 사항':'쌍둥이입니다.','성명':'최민아(예시)','생년월일':'1989-09-02','전화번호':'010-3333-4444','상세주소':'OO빌라 (예시)','주차·현관 안내':'','상담 방법':'통화','이용 경로':'홈페이지'},9),
  mk('consult',{'서비스':'가사관리','이름':'정수진(예시)','연락처':'010-5555-6666','지역':'서울 송파구','희망 시작일':'11월 초','문의 내용':'주 2회 희망'},5),
  mk('growth',{'구분':'불편','서비스':'영유아 관리','내용':'약속 시간보다 30분 늦게 도착하셨어요. (예시)','표시 이름(선택)':'김OO 고객님','연락처(선택)':'010-7777-8888','공개 동의':'개인정보를 가리고 사례로 공개해도 좋습니다'},30),
  mk('growth',{'구분':'칭찬','서비스':'산모신생아 건강관리','내용':'모유수유를 차근차근 알려 주셔서 큰 도움이 됐어요. (예시)','표시 이름(선택)':'박OO 고객님','연락처(선택)':'','공개 동의':'개인정보를 가리고 사례로 공개해도 좋습니다'},50),
  mk('class',{'신청자 이름':'오세훈(예시)','배우자 이름':'윤하영(예시)','연락처':'010-9999-0000','출산 예정월':'2027년 2월','희망 일정':'주말 오전','문의 내용':''},20),
  mk('branch',{'이름':'한상우(예시)','연락처':'010-2222-3333','희망 지역':'경기 성남시','관련 경력/현재 사업':'산후조리원 운영 경험','문의 내용':'설명회 일정 문의'},70)
 );
 LS.set('ttasa_test',L);
}

function tiles(){
 const S=subs(),today=new Date().toDateString();
 const n=[['오늘 접수',S.filter(p=>new Date(p.ts).toDateString()===today).length],['처리 전(접수)',S.filter(p=>st(p)==='접수').length],['번개매칭 진행',S.filter(p=>p.form==='match'&&['접수','연락중'].includes(st(p))).length],['서류 확인 필요 관리사',CG.filter(c=>docDays(c)<60).length]];
 document.getElementById('tiles').innerHTML=n.map((x,i)=>`<div class="tile${i===1&&x[1]?' alert':''}"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
}
function tabs(){
 const S=subs();
 const T=[['inbox','접수함',S.length],['match','번개매칭',S.filter(p=>p.form==='match').length],['cg','관리사',CG.length],['growth','성장노트',S.filter(p=>p.form==='growth').length]];
 const el=document.getElementById('tabs');
 el.innerHTML=T.map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}<span class="n">${t[2]}</span></button>`).join('');
 el.onclick=e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;closeD();render()}};
}
const empty=()=>`<div class="empty">아직 접수된 내용이 없습니다.<br>홈페이지에서 번개매칭이나 상담을 신청해 보시거나, 예시 데이터를 넣어 화면을 확인해 보세요.<p><button class="btn p" id="seed">예시 접수 7건 넣기</button></p></div>`;

function view(){
 const S=subs(),v=document.getElementById('view');
 if(tab==='inbox'){
  if(!S.length){v.innerHTML=empty();return}
  const L=S.filter(p=>filter==='all'||p.form===filter).sort((a,b)=>b.ts-a.ts);
  v.innerHTML=`<div class="bar"><select id="flt"><option value="all">전체 구분</option>${Object.keys(NAME).map(k=>`<option value="${k}"${filter===k?' selected':''}>${NAME[k]}</option>`).join('')}</select><span class="mute">${L.length}건 · 행을 누르면 상세가 열립니다</span><button class="btn s" id="clear" style="margin-left:auto">접수 내역 비우기</button></div>
  <div class="tw"><table><thead><tr><th>접수</th><th>구분</th><th>이름</th><th>내용</th><th>상태</th></tr></thead><tbody>${L.map(p=>`<tr class="row" data-open="${p.ts}"><td class="mute">${when(p.ts)}</td><td><span class="pill">${NAME[p.form]||p.form}</span>${p.demo?' <span class="mute">예시</span>':''}</td><td>${esc(who(p))}</td><td>${esc(one(p))}</td><td>${stSel(p)}</td></tr>`).join('')}</tbody></table></div>`;
 }else if(tab==='match'){
  const L=S.filter(p=>p.form==='match').sort((a,b)=>b.ts-a.ts);
  if(!L.length){v.innerHTML=empty();return}
  v.innerHTML=`<div class="cards">${L.map(p=>{const x=p.values,c=CG.find(c=>c['관리번호']===x['선택 관리번호']);
   return `<div class="mc"><div><h4>${esc(x['성명'])} · ${esc(x['매칭 분야'])}</h4><div class="meta">${esc(x['지역'])} · ${esc(x['일정 시작'])} ~ ${esc(x['일정 종료'])} · 상담 ${esc(x['상담 방법'])} · ${when(p.ts)} 접수</div><div class="meta">연락처 ${esc(x['전화번호'])} · 요청: ${esc(x['요청 사항']||'-')}</div></div>
   <div class="act">${stSel(p)}<button class="btn s" data-open="${p.ts}">상세</button></div>
   <div class="cg">${c?`<b>선택한 관리사님</b> ${esc(c['성명'])} (${esc(c['관리번호'])}) · ${esc(c['전화번호'])} · ${docPill(c)} · 배정가능일 ${esc(c['현재배정종료일']||'즉시')}`:'<b>선택한 관리사님 없음</b> · 기관이 직접 추천해 주세요'}</div></div>`}).join('')}</div>`;
 }else if(tab==='cg'){
  v.innerHTML=`<div class="tw"><table><thead><tr><th>관리번호</th><th>성명</th><th>연락처</th><th>분야</th><th>지역</th><th>경력</th><th>상태</th><th>서류</th></tr></thead><tbody>${CG.map(c=>{const sv=['산후관리사','영유아관리사','가사관리사','정리수납전문가','이유식전문가'].filter(k=>String(c[k]).toUpperCase()==='Y');
  return `<tr><td>${esc(c['관리번호'])}</td><td>${esc(c['성명'])}</td><td>${esc(c['전화번호'])}</td><td>${sv.map(s=>`<span class="pill">${s}</span>`).join(' ')}</td><td>${esc(c['활동지역'])}</td><td>${esc(c['경력(년)'])}년</td><td>${c['활동상태']==='활동중'?'<span class="pill o">활동중</span>':`<span class="pill w">${esc(c['활동상태'])}</span>`}</td><td>${docPill(c)}</td></tr>`}).join('')}</tbody></table></div><p class="mute">관리사 정보는 구글 시트 ‘관리사’ 탭과 같은 내용입니다. 지금은 가상의 샘플 데이터입니다.</p>`;
 }else{
  const L=S.filter(p=>p.form==='growth').sort((a,b)=>b.ts-a.ts);
  if(!L.length){v.innerHTML=empty();return}
  v.innerHTML=`<div class="cards">${L.map(p=>{const x=p.values,m=meta()[p.ts]||{};
   return `<div class="mc"><div><h4><span class="pill${x['구분']==='칭찬'?' o':x['구분']==='불편'?' w':''}">${esc(x['구분'])}</span> ${esc(x['서비스'])}</h4><div class="meta">${esc(x['내용'])}</div><div class="meta">${esc(x['표시 이름(선택)']||'익명')} · ${when(p.ts)} · ${esc(x['공개 동의'].slice(0,10))}…</div></div><div class="act">${stSel(p)}</div>
   <div class="cg"><div class="bar" style="margin:0 0 8px"><label>처리 결과 <input data-gr="${p.ts}" data-k="result" value="${esc(m.result||'')}" size="28"></label><label>이렇게 개선했어요 <input data-gr="${p.ts}" data-k="improve" value="${esc(m.improve||'')}" size="28"></label><label><input type="checkbox" data-gr="${p.ts}" data-k="pub"${m.pub?' checked':''}> 사이트에 공개</label></div><span class="mute">공개하기 전에 이름·연락처 등 개인정보가 가려졌는지 확인하세요.</span></div></div>`}).join('')}</div>`;
 }
}
function openD(ts){
 const p=subs().find(x=>String(x.ts)===String(ts));if(!p)return;open=ts;const m=meta()[ts]||{};
 const d=document.getElementById('drawer');
 d.innerHTML=`<div class="bar"><h3 style="margin:0">${NAME[p.form]} · ${esc(who(p))}</h3><button class="btn s" id="dx" style="margin-left:auto">닫기</button></div><p class="mute">${when(p.ts)} 접수${p.demo?' · 예시 데이터':''}</p><div class="bar">상태 ${stSel(p)}</div>
 ${(p.thumbs&&p.thumbs.length)?`<div class="bar">${p.thumbs.map(t=>`<img src="${t}" alt="첨부 사진" style="height:84px;border-radius:8px;border:1px solid var(--line)">`).join('')}</div><p class="mute">테스트 모드의 미리보기입니다. 실제 운영에서는 원본(축소본)이 드라이브 폴더에 저장됩니다.</p>`:''}<dl>${p.labels.map(l=>`<dt>${esc(l)}</dt><dd>${esc(p.values[l]||'-')}</dd>`).join('')}</dl><h4>상담 메모</h4><textarea id="memo" placeholder="통화 내용, 후속 조치 등">${esc(m.memo||'')}</textarea>`;
 d.classList.add('open');
}
const closeD=()=>{document.getElementById('drawer').classList.remove('open');open=null};
function render(){tiles();tabs();view()}
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.st){setMeta(t.dataset.st,{status:t.value});render();if(open)openD(open)}
 else if(t.id==='flt'){filter=t.value;view()}
 else if(t.dataset.gr){setMeta(t.dataset.gr,{[t.dataset.k]:t.type==='checkbox'?t.checked:t.value})}
});
document.addEventListener('input',e=>{if(e.target.id==='memo'&&open)setMeta(open,{memo:e.target.value})});
document.addEventListener('click',e=>{
 const t=e.target;
 if(t.id==='seed'){seed();render();return}
 if(t.id==='clear'){LS.set('ttasa_test',[]);LS.set('ttasa_meta',{});closeD();render();return}
 if(t.id==='dx'){closeD();return}
 if(t.closest('select,input,textarea'))return;
 const o=t.closest('[data-open]');if(o)openD(o.dataset.open);
});
render();
})();
