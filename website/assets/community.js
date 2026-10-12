// 커뮤니티: 게시판 8개(+전체). 글·댓글은 직원 승인 후 공개되는 승인제입니다.
(function(){
const root=document.getElementById('cm-panel'),tiles=document.getElementById('cm-tiles');if(!root)return;
const CFG=window.SITE_CONFIG||{};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const B=[
 {k:'all',n:'전체',i:'talk',d:'모든 게시판의 최신 글을 한눈에 봐요'},
 {k:'go',n:'가고파',i:'go',d:'아가와 함께 갈 수 있는 여행·나들이 추천지'},
 {k:'play',n:'하고파',i:'play',d:'아가와 함께 할 수 있는 놀이'},
 {k:'eat',n:'먹고파',i:'eat',d:'노키즈존 없이 엄마들이 편하게 먹고 마실 수 있는 식당·카페'},
 {k:'buy',n:'사고파',i:'buy',d:'아가 용품·가정 용품 추천템과 후기'},
 {k:'wear',n:'입고파',i:'wear',d:'산모들이 편하게 입는 옷·수유복 추천'},
 {k:'give',n:'주고파',i:'give',d:'쓰던 육아용품을 무료로 나눠요 (따사마켓 무료나눔과 같은 코너예요)'},
 {k:'want',n:'받고파',i:'get',d:'필요한 육아·가정 용품을 알려 주세요'},
 {k:'talk',n:'공유파',i:'talk',d:'육아 고민과 소소한 에피소드를 나눠요'},
 {k:'vent',n:'털어놓고파',i:'heartic',d:'힘든 마음, 서운한 마음을 편하게 털어놓는 곳 (익명 가능)'},
 {k:'meet',n:'보고파',i:'couple',d:'같은 달에 출산한 맘, 같은 동네 맘, 또래 육아 친구를 만나요'},
 {k:'know',n:'알고파',i:'ask',d:'궁금한 것을 묻고, 동네 정보와 병원·센터 후기를 나눠요'},
 {k:'tip',n:'챙기고파',i:'tip',d:'출산 준비물 체크리스트와 알아두면 좋은 지원 정보'}];
// 이번 주 이야기: 직원이 매주 바꿔 쓰는 질문 (공유파 글쓰기로 연결)
const WEEKLY={q:'출산 후 가장 고마웠던 한마디, 있으신가요?',board:'talk'};
const byName=n=>(B.find(b=>b.n===n)||{}).k;
const today=()=>new Date().toISOString().slice(0,10);
const md=d=>String(d||'').slice(5).replace('-','.');
// ── 데모용 가상 글 (접수처 연결 후 실제 글로 바뀝니다) ──
const S=(k,t,n,b,d,dt)=>({id:'s'+Math.random().toString(36).slice(2,7),board:k,boardName:B.find(x=>x.k===k).n,title:t,nick:n,body:b,detail:d||'',date:dt,sample:true});
const SAMPLE=[
 S('go','아이 동반 가족이 많아 마음 편한 패밀리 리조트','튼튼맘','수영장과 키즈카페가 잘 되어 있고, 같이 온 가족들이 대부분 아이 있는 집이라 분위기가 편안했어요. 온돌방이 있어 아기랑 누워 쉬기 좋았어요. (리조트 이름은 확정 후 입력)','장소명: 패밀리 리조트(이름 입력 예정) · 지역: 강원 · 장소 종류: 리조트·숙소 · 손님 분위기: 아이 동반 가족이 많아요 · 편의시설: 키즈풀·유아풀, 키즈카페·놀이방, 온돌·가족실, 유모차 이동 편함','2026-10-11'),
 S('go','돌 전 아기랑 가기 좋은 양평 나들이','하늘맘','수유실이 깔끔하고 유모차 끌고 다니기 편했어요. 평일 오전에 가면 한적해요.','장소명: 양평 어린이정원 · 지역: 경기 양평군 · 편의시설: 유모차 이동 편함, 수유실 있음, 주차 편함','2026-10-09'),
 S('go','실내 놀이터 있는 박물관 추천','봄이엄마','비 오는 날도 괜찮아요. 아기 의자 대여해줘요.','장소명: 가까운 어린이박물관 · 지역: 서울 용산구 · 편의시설: 기저귀 교환대, 실내 공간','2026-10-05'),
 S('play','집에서 하는 까꿍 수건 놀이','도담맘','수건 한 장으로 6개월 아기가 30분 넘게 웃었어요.','놀이 이름: 까꿍 수건 놀이 · 추천 월령: 5~10개월 · 준비물: 수건 · 장소: 집안','2026-10-08'),
 S('play','베란다 물놀이 (여름 끝물)','여름이네','대야에 미지근한 물, 컵 두 개면 충분해요.','놀이 이름: 베란다 물놀이 · 추천 월령: 10개월~ · 장소: 집안','2026-10-02'),
 S('eat','아기 의자 있고 노키즈존 아닌 브런치 카페','구름엄마','넓은 좌석이라 유모차째 들어가요. 수유 공간도 있어요.','가게 이름: 오늘의 브런치 · 지역: 서울 송파구 잠실동 · 종류: 카페 · 이용 팁: 노키즈존 아님, 유모차 진입 가능, 아기 의자 있음','2026-10-10'),
 S('eat','엄마들 모임하기 좋은 한식집','다온맘','단체석이 있어 아기 데리고 편하게 먹었어요.','가게 이름: 동네 한식당 · 지역: 서울 강남구 대치동 · 종류: 식당 · 이용 팁: 단체석 있음, 아기 의자 있음','2026-10-03'),
 S('buy','신생아 손수건 이거 좋아요','초록맘','세탁해도 보풀이 안 나요. 가제 손수건 10장 세트.','상품명: 가제 손수건 · 분류: 아기 용품 · 가격대: 1만원대 · 만족도: ★★★★★ 강력 추천','2026-10-07'),
 S('buy','가정용 무선 청소기 후기','깔끔이','아기 있는 집엔 가벼운 게 최고예요.','상품명: 무선 청소기 · 분류: 가정 용품 · 가격대: 20만원대 · 만족도: ★★★★ 추천','2026-09-30'),
 S('wear','수유 원피스 하나로 계절 나기','소나기','앞이 열려서 수유할 때 편하고 외출복으로도 괜찮아요.','품목: 수유 원피스 · 시기: 수유 중 · 사이즈 후기: 평소 66인데 M이 편했어요','2026-10-06'),
 S('wear','임신 후기 편한 레깅스','달님맘','배를 안 조이고 신축성이 좋아요.','품목: 임산부 레깅스 · 시기: 임신 중','2026-09-28'),
 S('want','아기 욕조 구해요','새싹맘','신생아용 욕조 필요해요. 깨끗한 것이면 괜찮아요.','받고 싶은 물품: 아기 욕조 · 분류: 생활·주방용품 · 동네: 서울 강남구 개포동','2026-10-09'),
 S('want','수유 쿠션 받고 싶어요','별빛맘','출산 한 달 전인데 수유 쿠션이 없어요.','받고 싶은 물품: 수유 쿠션 · 분류: 수유용품 · 동네: 서울 서초구 방배동','2026-10-04'),
 S('vent','밤마다 눈물이 나요','익명','아기는 예쁜데 이유 없이 눈물이 나고 혼자인 것 같아요. 괜찮다는 말이 듣고 싶었어요.','말머리: 힘들어요','2026-10-10'),
 S('meet','2027년 3월 출산 예정 맘 모여요','봄맘','같은 달 출산 맘끼리 정보도 나누고 응원도 하고 싶어요.','모임 종류: 같은 달 출산 맘 · 출산(예정)월: 2027년 3월 · 지역: 서울 송파구','2026-10-09'),
 S('meet','강남구 6개월 아기 산책 친구 구해요','구름맘','주 1~2회 평일 오전에 같이 산책해요.','모임 종류: 같은 동네 맘 · 출산(예정)월: 2026년 4월 · 지역: 서울 강남구','2026-10-04'),
 S('know','부모급여는 어디서 신청하나요?','초보맘','출산하고 나서 어떤 서류가 필요한지 궁금해요.','글 종류: 질문','2026-10-08'),
 S('know','송파구 야간 진료하는 소아과 정보 나눠요','도담맘','저희가 가본 곳은 접수 마감이 빨랐어요. 가시기 전 전화로 꼭 확인하세요.','글 종류: 병원·센터 후기 · 지역: 서울 송파구','2026-10-06'),
 S('talk','밤수유 너무 힘들 때 어떻게 버티세요?','수면부족','새벽 3시마다 깨니 정신이 없어요. 노하우 공유해요.','말머리: 고민','2026-10-10'),
 S('talk','오늘 아기가 처음 뒤집었어요!','행복맘','100일 지나서 드디어 해냈어요. 영상 찍느라 정신없었어요.','말머리: 자랑','2026-10-08')
];
const SC={}; // 글번호 → 댓글들
const addC=(pid,n,b,dt)=>{(SC[pid]=SC[pid]||[]).push({pid,nick:n,body:b,date:dt})};
let posts=SAMPLE,comments=[],mine=[],mineC=[],demo=true,tab=(location.hash||'').slice(1)||'all',writing=false;
SAMPLE.forEach(p=>{if(p.title.startsWith('밤수유')){addC(p.id,'새벽맘','저는 남편이랑 교대로 자요. 3시간만 자도 훨씬 나아요.','2026-10-10');addC(p.id,'도담맘','수유 텀을 기록해 보면 패턴이 보이더라고요.','2026-10-10')}if(p.title.startsWith('밤마다 눈물'))addC(p.id,'따사로운','혼자 견디지 않으셔도 돼요. 오늘 많이 힘드셨죠. 필요하시면 상담 연결도 도와드릴게요.','2026-10-10');
  if(p.title.startsWith('아기 욕조'))addC(p.id,'따사로운','주고파 게시판에 나눔 물품이 올라오면 연결해 드릴게요.','2026-10-09')});

function tilesHTML(){return B.map(b=>`<button type="button" class="cm-tile${tab===b.k?' on':''}" data-tab="${b.k}">${svg(b.i)}<span>${b.n}</span></button>`).join('')}
const cmts=pid=>(SC[pid]||[]).concat(comments.filter(c=>c.pid===pid),mineC.filter(c=>c.pid===pid));
function card(p){
 const n=cmts(p.id).length,det=(p.detail||'').split(' · ').filter(Boolean);
 return `<article class="post${p.pending?' pend':''}" data-id="${esc(p.id)}"><button type="button" class="ph" data-open="${esc(p.id)}">
  <span class="pill">${esc(p.boardName)}</span>${p.pending?' <span class="pill w">검토 중 · 이 화면에서만 보여요</span>':''}${p.sample?' <span class="smp">예시</span>':''}
  <h3>${esc(p.title)}</h3><span class="pm">${esc(p.nick||'익명')} · ${esc(md(p.date))} · 댓글 ${n}</span></button>
  <p class="ps">${esc(String(p.body||'').slice(0,90))}${String(p.body||'').length>90?'…':''}</p>
  <div class="pd" hidden>${det.length?`<p class="chipsline">${det.map(x=>`<span class="tag">${esc(x)}</span>`).join(' ')}</p>`:''}
   ${p.photo?`<img class="pph" src="${esc(p.photo)}" alt="첨부 사진" loading="lazy">`:''}<p class="pb">${esc(p.body)}</p>
   <div class="cl">${cmts(p.id).map(c=>`<div class="cmt"><b>${esc(c.nick)}</b> <span>${esc(md(c.date))}</span>${c.pending?' <span class="pill w">검토 중</span>':''}<p>${esc(c.body)}</p></div>`).join('')||'<p class="mute">첫 댓글을 남겨 보세요.</p>'}</div>
   <form class="cf" data-pid="${esc(p.id)}"><input name="n" placeholder="닉네임" maxlength="12" required><input name="b" placeholder="댓글을 입력하세요 (확인 후 공개)" maxlength="300" required><button class="btn sm" type="submit">등록</button></form>
   <p class="cfm mute"></p><button type="button" class="link" data-report="${esc(p.id)}">신고하기</button></div></article>`;
}
function listHTML(){
 const all=mine.concat(posts).sort((a,b)=>(b.pending?1:0)-(a.pending?1:0)||String(b.date).localeCompare(String(a.date)));
 let L=tab==='all'?all:all.filter(p=>byName(p.boardName)===tab);
 if(tab==='meet'&&monthF)L=L.filter(p=>(p.detail||'').includes(monthF));
 return L.length?L.map(card).join(''):'<div class="todo">아직 글이 없어요. 첫 글을 남겨 보세요.</div>';
}
const CHECK=[
 {t:'입원 가방 (엄마)',items:['신분증·산모수첩','산모용 속옷·수유 브라','수유 패드','수면 양말·가디건','세면도구','핸드폰 충전기(긴 줄)','물티슈·생리대']},
 {t:'신생아 용품',items:['배냇저고리·내의','속싸개·겉싸개','손싸개·발싸개','기저귀(신생아용)','거즈 손수건','젖병·소독 도구','카시트(퇴원 시)']},
 {t:'산후 회복·마음 챙기기',items:['산후 도움 계획(가족·관리사)','산후 식사 준비 방법','지원 제도 확인(지자체)','수면 교대 계획','믿을 만한 상담 연락처','나만의 쉬는 시간 정하기']}];
const chk=()=>{try{return JSON.parse(localStorage.getItem('ttasa_checks')||'{}')}catch(e){return {}}};
function tipHTML(){
 const st=chk();
 return `<div class="tip-grid">${CHECK.map((g,gi)=>`<section class="tip-card"><h3>${esc(g.t)} <small class="mute" data-prog="${gi}"></small></h3>${g.items.map((it,ii)=>`<label class="tip-i"><input type="checkbox" data-c="${gi}-${ii}"${st[gi+'-'+ii]?' checked':''}><span>${esc(it)}</span></label>`).join('')}</section>`).join('')}</div>
 <p class="mute" style="font-size:.85rem">체크 표시는 이 기기의 브라우저에만 저장돼요. 준비물은 병원·가정 상황에 따라 달라질 수 있어요.</p>
 <div class="grid g3" style="margin-top:16px"><div class="card"><h3>지원 제도 확인</h3><p>임신·출산·육아 지원은 지자체마다 달라요. <a class="lnk" href="https://www.bokjiro.go.kr" target="_blank" rel="noopener">복지로</a>, <a class="lnk" href="https://www.childcare.go.kr" target="_blank" rel="noopener">아이사랑</a>에서 확인하세요. 보건복지상담센터 <b>129</b></p></div>
 <div class="card"><h3>산후 도움 받기</h3><p>산모·신생아 건강관리사 서비스가 궁금하시면 <a class="lnk" href="maternity.html">서비스 안내</a>를 확인하시거나 <a class="lnk" href="match.html">번개매칭</a>을 이용해 보세요.</p></div>
 <div class="card"><h3>마음이 힘들 때</h3><p>혼자 견디지 마세요. 정신건강 위기상담 <b>1577-0199</b>, 자살예방상담 <b>109</b>, 응급 <b>119</b> (번호는 변경될 수 있어요)</p></div></div>`;
}
function giveHTML(){return `<p class="mute" id="share-demo"></p><div class="grid share-grid" id="share-list"></div>
 <h3 style="margin:28px 0 8px">나눔 받고 싶어요</h3><div data-form="shareReq"></div>
 <h3 style="margin:28px 0 8px">나눔 등록하기</h3><div data-form="share"></div>`}
let monthF='';
function extraTop(b){
 let h='';
 if(b.k==='all'||b.k===WEEKLY.board)h+=`<div class="weekly"><span class="pill">이번 주 이야기</span><b>${esc(WEEKLY.q)}</b><button type="button" class="btn sm" id="wk-go">내 이야기 남기기</button></div>`;
 if(b.k==='vent')h+=`<div class="help-box"><b>혼자 견디지 마세요.</b> 정신건강 위기상담 <b>1577-0199</b> · 자살예방상담 <b>109</b> · 응급 <b>119</b><br><small>여기 글은 직원이 먼저 확인하고, 마음이 많이 힘들어 보이는 글에는 따뜻한 댓글과 상담 연결을 도와드려요.</small></div>`;
 if(b.k==='meet'){
  if(CFG.openChatUrl)h+=`<div class="weekly"><b>오픈채팅으로 바로 이야기해요</b><a class="btn sm" href="${esc(CFG.openChatUrl)}" target="_blank" rel="noopener">오픈채팅 입장</a></div>`;
  const ms=[...new Set(mine.concat(posts).filter(p=>byName(p.boardName)==='meet').map(p=>((p.detail||'').match(/출산\(예정\)월: ([^·]+)/)||[])[1]).filter(Boolean).map(x=>x.trim()))];
  if(ms.length)h+=`<div class="chips" style="margin-bottom:12px"><label class="chip"><input type="radio" name="mf" value=""${monthF?'':' checked'}><span>전체</span></label>${ms.map(m=>`<label class="chip"><input type="radio" name="mf" value="${esc(m)}"${monthF===m?' checked':''}><span>${esc(m)}</span></label>`).join('')}</div>`;
 }
 return h;
}
function bindExtra(){
 const g=document.getElementById('wk-go');
 if(g)g.onclick=()=>{tab=WEEKLY.board;render();const w=document.getElementById('cm-write');if(w){w.click();setTimeout(()=>{const t=document.querySelector('[data-form=post_'+WEEKLY.board+'] [name=제목]');if(t){t.value='[이번 주 이야기] ';t.focus()}},200)}};
 root.querySelectorAll('[name=mf]').forEach(r=>r.onchange=()=>{monthF=r.value;document.getElementById('cm-list').innerHTML=listHTML()});
}
function render(){
 tiles.innerHTML=tilesHTML();
 const b=B.find(x=>x.k===tab)||B[0];
 if(b.k==='tip'){root.innerHTML=`<div class="cm-head"><div><h2>${b.n}</h2><p class="mute">${b.d}</p></div></div>${tipHTML()}`;const upd=()=>{CHECK.forEach((g,gi)=>{const n=g.items.filter((_,ii)=>root.querySelector(`[data-c="${gi}-${ii}"]`).checked).length;root.querySelector(`[data-prog="${gi}"]`).textContent=`${n}/${g.items.length}`})};upd();root.querySelectorAll('[data-c]').forEach(i=>i.onchange=()=>{const st=chk();st[i.dataset.c]=i.checked;try{localStorage.setItem('ttasa_checks',JSON.stringify(st))}catch(e){}upd()});return}
 if(b.k==='give'){root.innerHTML=`<div class="cm-head"><div><h2>${b.n}</h2><p class="mute">${b.d}</p></div></div>${giveHTML()}`;window.TtasaInitForms(root);window.TtasaShareInit&&window.TtasaShareInit();return}
 root.innerHTML=`<div class="cm-head"><div><h2>${b.n}</h2><p class="mute">${b.d}${demo?' (아래 글은 화면 확인용 가상 예시예요)':''}</p></div>${b.k!=='all'?'<button type="button" class="btn" id="cm-write">글쓰기</button>':''}</div>
  ${extraTop(b)}<div id="cm-form" hidden></div><div class="cm-list" id="cm-list">${listHTML()}</div>`;
 bindExtra();
 const w=document.getElementById('cm-write');
 if(w)w.onclick=()=>{const f=document.getElementById('cm-form');if(!f.hidden){f.hidden=true;return}f.innerHTML=`<div data-form="post_${b.k}"></div>`;f.hidden=false;window.TtasaInitForms(f);f.scrollIntoView({behavior:'smooth',block:'start'})};
}
async function load(){
 if(CFG.endpoint){try{const j=await (await fetch(CFG.endpoint+'?list=community')).json();if(j.ok){posts=j.posts.map(p=>Object.assign(p,{board:byName(p.boardName)}));comments=j.comments;demo=false;SAMPLE.length&&Object.keys(SC).forEach(k=>delete SC[k])}}catch(e){}}
 render();
}
tiles.onclick=e=>{const t=e.target.closest('[data-tab]');if(!t)return;tab=t.dataset.tab;monthF='';try{history.replaceState(null,'','#'+tab)}catch(x){}render()};
root.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');if(o){const d=o.closest('.post').querySelector('.pd');d.hidden=!d.hidden;return}
 const r=e.target.closest('[data-report]');if(r){r.disabled=true;r.textContent='신고가 접수됐어요. 확인할게요';window.TtasaSend({form:'report',title:'신고',labels:['글번호','대상'],values:{'글번호':r.dataset.report,'대상':'글/댓글'},page:location.pathname}).catch(()=>{})}
});
root.addEventListener('submit',async e=>{
 const f=e.target.closest('.cf');if(!f)return;e.preventDefault();
 const pid=f.dataset.pid,n=f.elements.n.value.trim(),b=f.elements.b.value.trim(),m=f.parentElement.querySelector('.cfm');if(!n||!b)return;
 try{await window.TtasaSend({form:'comment',title:'댓글',labels:['글번호','닉네임','내용'],values:{'글번호':pid,'닉네임':n,'내용':b},page:location.pathname});
  mineC.push({pid,nick:n,body:b,date:today(),pending:true});const open=[...root.querySelectorAll('.pd:not([hidden])')].map(x=>x.closest('.post').dataset.id);
  document.getElementById('cm-list').innerHTML=listHTML();open.forEach(id=>{const d=root.querySelector(`.post[data-id="${CSS.escape(id)}"] .pd`);if(d)d.hidden=false});
 }catch(err){m.textContent='등록에 실패했어요. 잠시 후 다시 시도해 주세요.'}
});
document.addEventListener('ttasa:sent',e=>{
 const pl=e.detail&&e.detail.payload;if(!pl||pl.form!=='post')return;const v=pl.values;
 mine.unshift({id:v['글번호'],boardName:v['게시판'],title:v['제목'],nick:v['닉네임'],body:v['내용'],detail:v['상세'],date:today(),pending:true});
 const l=document.getElementById('cm-list');if(l)l.innerHTML=listHTML();
});
window.addEventListener('hashchange',()=>{const t=location.hash.slice(1);if(B.some(b=>b.k===t)&&t!==tab){tab=t;render()}});
render();load();
})();
