// 신청/문의/의견 폼. 각 페이지에 <div data-form="이름"></div> 를 두면 자동으로 만들어집니다.
(function(){
const CFG=window.SITE_CONFIG||{};
window.cookieLang=()=>{try{return(document.cookie.match(/googtrans=\/ko\/([\w-]+)/)||[])[1]||'ko'}catch(e){return 'ko'}};
const cookieLang=window.cookieLang;
const SVC=['산모·신생아','영유아','가사관리','정리수납'];
// k:내부키(시트 제목 겸용) t:종류 o:선택지 opt:선택입력 ph:안내문구
const FORMS={
 consult:{title:'상담 신청',btn:'상담 신청하기',f:[
  {k:'서비스',t:'select',o:SVC},{k:'이름'},{k:'연락처',t:'tel'},{k:'지역',ph:'예: 서울 강남구'},{k:'희망 시작일',ph:'예: 11월 초 / 출산 예정일',opt:1},{k:'문의 내용',t:'textarea',opt:1}]},
 growth:{title:'성장노트에 의견 남기기',btn:'의견 남기기',f:[
  {k:'구분',t:'select',o:['칭찬','불편','제안']},{k:'서비스',t:'select',o:SVC.concat(['응애맘빠','평생교육원','따사마켓','기타'])},{k:'내용',t:'textarea',ph:'어떤 일이 있었는지 편하게 적어 주세요.'},
  {k:'사진 첨부',t:'file',opt:1},{k:'표시 이름(선택)',ph:'공개 시 보여질 이름 (예: 김OO 고객님)',opt:1},{k:'연락처(선택)',t:'tel',ph:'처리 결과를 안내받으실 번호 (비공개)',opt:1},
  {k:'공개 동의',t:'select',o:['개인정보를 가리고 사례로 공개해도 좋습니다','공개하지 말아 주세요']}],
  note:'접수된 의견은 삭제하지 않고 처리 과정과 결과를 기록합니다. 공개 시 이름·연락처 등 개인정보는 가려집니다.'},
 share:{title:'나눔 등록',btn:'나눔 등록하기',f:[
  {k:'물품명'},{k:'분류',t:'select',o:['유모차·카시트','침구·가구','수유용품','아기 옷·신발','장난감·도서','생활·주방용품','기타']},{k:'물품 상태',t:'select',o:['새것(미사용)','거의 새것','사용감 있음']},
  {k:'동네',ph:'예: 서울 강남구 역삼동'},{k:'설명',t:'textarea',ph:'사용 기간, 크기, 흠집 여부 등을 적어 주세요.'},{k:'사진 첨부',t:'file',max:3,opt:1},{k:'수령 방법',t:'select',o:['직접 방문 수령','기관 방문 시 전달','택배(착불)']},{k:'이름'},{k:'연락처',t:'tel'}],
  note:'직원 확인 후 공개되며 연락처와 정확한 주소는 공개되지 않습니다. 판매 목적의 등록은 받지 않습니다.',
  agree:'수집 항목: 위에 입력하신 내용과 첨부 사진 · 목적: 무료나눔 등록 및 연결 · 공개: 물품명·상태·동네·설명·사진만 공개(이름·연락처는 비공개) · 보유: 나눔 완료 후 지체 없이 파기'},
 shareReq:{title:'나눔 신청',btn:'나눔 신청하기',f:[
  {k:'나눔 물품',ph:'위 목록에서 “받고 싶어요”를 누르면 자동 입력돼요'},{k:'이름'},{k:'연락처',t:'tel'},{k:'받으러 오실 수 있는 날',ph:'예: 이번 주 토요일 오후'},{k:'한마디',t:'textarea',opt:1,ph:'필요한 이유 등 (선택)'}],
  agree:'수집 항목: 위에 입력하신 내용 · 목적: 나눔 연결 · 보유: 나눔 완료 후 지체 없이 파기'},
 quote:{title:'정리수납 견적 요청',btn:'견적 요청하기',f:[
  {k:'견적 방법',t:'select',o:['사진 견적','방문 견적','사진 견적 후 방문 견적']},{k:'정리할 공간',t:'select',o:['주방','옷장·드레스룸','아이방','거실','현관·신발장','베란다·창고','집 전체','이사 전후 정리']},{k:'평수',ph:'예: 32평 (대략이어도 괜찮아요)'},{k:'동네',ph:'예: 서울 강남구 역삼동'},{k:'희망 시기',ph:'예: 11월 둘째 주 평일'},
  {k:'사진 첨부',t:'file',max:5,opt:1},{k:'요청 사항',t:'textarea',opt:1,ph:'정리하고 싶은 부분, 버리고 싶은 물건, 유의할 점 등'},{k:'이름'},{k:'연락처',t:'tel'}],
  note:'첨부하신 사진과 상담 내용은 견적 상담에만 사용하며 담당 직원만 열람합니다. 홈페이지나 성장노트에 공개하지 않습니다.',
  agree:'수집 항목: 위에 입력하신 내용과 첨부 사진 · 목적: 정리수납 견적 상담 · 열람: 담당 직원만 · 보유: 견적 상담 종료 후 지체 없이 파기'},
 class:{title:'응애맘빠 참가 신청',btn:'참가 신청하기',f:[
  {k:'신청자 이름'},{k:'배우자 이름'},{k:'연락처',t:'tel'},{k:'출산 예정월',ph:'예: 2027년 3월'},{k:'희망 일정',ph:'예: 주말 오전',opt:1},{k:'문의 내용',t:'textarea',opt:1}],
  note:'예비부부만 신청할 수 있습니다. 자격 확인 방법은 접수 후 개별 안내드립니다.'},
 branch:{title:'지사 문의',btn:'문의하기',f:[
  {k:'이름'},{k:'연락처',t:'tel'},{k:'희망 지역'},{k:'관련 경력/현재 사업',opt:1,t:'textarea'},{k:'문의 내용',t:'textarea',opt:1}]},
 academy:{title:'수강 문의',btn:'수강 문의하기',f:[
  {k:'과정',t:'select',o:()=>(window.COURSES||[]).map(c=>c.name).concat(['기타'])},{k:'내일배움카드',t:'select',o:['있어요(소지)','없어요(발급 필요)','발급 신청 중','잘 모르겠어요']},{k:'이름'},{k:'연락처',t:'tel'},{k:'문의 내용',t:'textarea',opt:1}]}
};
// 접수 전송 (다른 스크립트에서도 사용): 접수처 미연결이면 'test', 성공이면 'ok'
async function send(payload){
 if(!CFG.endpoint){
  payload.ts=Date.now();
  const slim=Object.assign({},payload,{fileCount:(payload.files||[]).length});delete slim.files;
  try{const q=JSON.parse(localStorage.getItem('ttasa_test')||'[]');q.push(slim);localStorage.setItem('ttasa_test',JSON.stringify(q))}catch(e){}
  await new Promise(r=>setTimeout(r,500));return 'test';
 }
 const body=Object.assign({},payload);delete body.thumbs;
 const r=await fetch(CFG.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'fail');return 'ok';
}
window.TtasaSend=send;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MAXF=3;
// ── 커뮤니티 글쓰기 폼: 게시판마다 입력 항목만 다르고 저장 형식은 같습니다 (글번호·게시판·제목·닉네임·내용·상세) ──
const BOARD_FIELDS={
 go:{name:'가고파',extra:[{k:'장소명'},{k:'지역',ph:'예: 강원 홍천군'},{k:'장소 종류',t:'select',o:['리조트·숙소','체험·놀이공원','공원·자연','박물관·전시','기타']},{k:'손님 분위기',t:'select',o:['아이 동반 가족이 많아요','가족·커플이 섞여 있어요','성인·커플 위주예요','잘 모르겠어요']},{k:'추천 월령',ph:'예: 6개월부터',opt:1},{k:'편의시설',t:'checks',o:['키즈풀·유아풀','키즈카페·놀이방','유아용품 대여','온돌·가족실','유모차 이동 편함','수유실 있음','주차 편함','기저귀 교환대'],opt:1}],
  note:'아이와 함께 갈 때 좋았던 점을 사실 위주로 적어 주세요. 특정 업체를 깎아내리는 표현은 승인되지 않아요.'},
 play:{name:'하고파',extra:[{k:'놀이 이름'},{k:'추천 월령',ph:'예: 8개월~18개월'},{k:'준비물',ph:'예: 수건, 풍선',opt:1},{k:'장소',t:'select',o:['집안','야외','어디서나']}]},
 eat:{name:'먹고파',extra:[{k:'가게 이름'},{k:'지역',ph:'예: 서울 송파구 잠실동'},{k:'종류',t:'select',o:['식당','카페','베이커리·디저트','기타']},{k:'이용 팁',t:'checks',o:['노키즈존 아님','유모차 진입 가능','아기 의자 있음','수유·기저귀 공간','주차 가능','단체석 있음'],opt:1}]},
 buy:{name:'사고파',extra:[{k:'상품명'},{k:'분류',t:'select',o:['아기 용품','산모 용품','가정 용품','기타']},{k:'가격대',ph:'예: 3만원대',opt:1},{k:'만족도',t:'select',o:['★★★★★ 강력 추천','★★★★ 추천','★★★ 보통','★★ 아쉬움']}],
  note:'추천템·후기만 올려 주세요. 판매·홍보 글은 승인되지 않습니다.'},
 wear:{name:'입고파',extra:[{k:'품목',ph:'예: 수유 원피스'},{k:'시기',t:'select',o:['임신 중','출산 직후','수유 중','일상']},{k:'구매처·브랜드',opt:1},{k:'사이즈 후기',ph:'예: 평소 66인데 M이 편했어요',opt:1}],
  note:'추천 후기만 올려 주세요. 판매·홍보 글은 승인되지 않습니다.'},
 want:{name:'받고파',extra:[{k:'받고 싶은 물품'},{k:'분류',t:'select',o:['유모차·카시트','침구·가구','수유용품','아기 옷·신발','장난감·도서','생활·주방용품','기타']},{k:'동네',ph:'예: 서울 강남구 역삼동'}],
  note:'받고 싶은 용품을 알려 주세요. 맞는 무료나눔 물품이 있으면 직원이 연결해 드려요. (주고파 게시판 참고)'},
 vent:{name:'털어놓고파',anon:1,extra:[{k:'말머리',t:'select',o:['힘들어요','서운해요','불안해요','외로워요','그냥 들어주세요']}],
  note:'여기는 마음을 내려놓는 곳이에요. 익명으로 써도 괜찮아요. 지금 너무 힘들거나 위험하다고 느껴지면 글보다 먼저 109(자살예방상담) 또는 119에 연락해 주세요.'},
 meet:{name:'보고파',extra:[{k:'모임 종류',t:'select',o:['같은 달 출산 맘','같은 동네 맘','같은 월령 육아 친구','산책·문화센터 같이 가요','기타']},{k:'출산(예정)월',ph:'예: 2027년 3월'},{k:'지역',ph:'예: 서울 송파구 (구 단위까지만)'}],
  note:'연락처·SNS 아이디는 글에 쓰지 마세요. 댓글로 이야기하거나 아래 오픈채팅을 이용해 주세요.'},
 know:{name:'알고파',extra:[{k:'글 종류',t:'select',o:['질문','동네 정보','병원·센터 후기','같이 해요']},{k:'지역',ph:'예: 서울 강남구 (선택)',opt:1}],
  note:'병원·업체 후기는 직접 겪은 일을 사실 위주로 적어 주세요. 의학적 판단은 글만으로 어려우니 걱정되면 꼭 병원에 문의해 주세요.'},
 talk:{name:'공유파',extra:[{k:'말머리',t:'select',o:['고민','에피소드','자랑','질문','잡담']}],
  note:'의료·건강 문제는 글만으로 판단하기 어려워요. 걱정되는 증상은 병원 상담을 꼭 받아 주세요.'}
};
Object.keys(BOARD_FIELDS).forEach(key=>{
 const b=BOARD_FIELDS[key];
 FORMS['post_'+key]={title:b.name+' 글쓰기',btn:'글 올리기',formName:'post',note:(b.note?b.note+' ':'')+'글은 확인 후 공개됩니다. 개인정보와 아이 얼굴이 나온 사진은 올리지 말아 주세요.',
  agree:'수집 항목: 작성하신 글·사진·닉네임 · 목적: 따사마을 게시 · 공개: 승인 후 닉네임과 글 내용이 공개됩니다 · 보유: 삭제 요청 시 지체 없이 파기',
  f:[{k:'제목'}].concat(b.extra,[{k:'내용',t:'textarea',ph:'자유롭게 적어 주세요.'},{k:'사진 첨부',t:'file',max:3,opt:1,photoHint:'아이 얼굴·간판의 전화번호 등이 보이지 않게 해 주세요.'},{k:'닉네임',ph:b.anon?'비워 두면 익명으로 올라가요':'예: 하늘맘',opt:b.anon?1:0}]),
  pack:(v,def)=>{const extras=b.extra.map(e=>v[e.k]?`${e.k}: ${v[e.k]}`:'').filter(Boolean).join(' · ');
   const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);
   const vals={'글번호':id,'게시판':b.name,'제목':v['제목'],'닉네임':v['닉네임']||'익명','내용':v['내용'],'상세':extras,'사진 첨부':v['사진 첨부']};
   return {labels:Object.keys(vals),values:vals}}};
});
function field(x,i){
 const id='f'+Math.random().toString(36).slice(2,7),req=x.opt?'':' required';
 const lab=`<label for="${id}">${x.k.replace('(선택)','')}${x.opt?' <em>(선택)</em>':''}</label>`;
 let inp;
 if(x.t==='checks')inp=`<div class="chips">${x.o.map(o=>`<label class="chip"><input type="checkbox" name="${esc(x.k)}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>`;
 else if(x.t==='file')inp=`<div class="upl" data-upl><input id="${id}" name="${esc(x.k)}" type="file" accept="image/*" multiple hidden><label for="${id}" class="btn ghost2 upbtn">사진 선택</label> <span class="hint">최대 ${x.max||MAXF}장 · ${x.photoHint||'얼굴, 주소, 전화번호 등 개인정보가 보이지 않게 가려 주세요.'}${x.max>3?' 공간 전체와 수납장 안쪽이 보이게 찍어 주시면 견적이 정확해요.':''}</span><div class="thumbs"></div></div>`;
 else if(x.t==='select')inp=`<select id="${id}" name="${esc(x.k)}"${req}>${(typeof x.o==='function'?x.o():x.o).map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;
 else if(x.t==='textarea')inp=`<textarea id="${id}" name="${esc(x.k)}" rows="4" placeholder="${esc(x.ph||'')}"${req}></textarea>`;
 else inp=`<input id="${id}" name="${esc(x.k)}" type="${x.t||'text'}" placeholder="${esc(x.ph||'')}"${req}>`;
 return `<div class="fld">${lab}${inp}</div>`;
}
async function shrink(file,max,q){
 const url=URL.createObjectURL(file),img=new Image();
 await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url});
 const draw=m=>{const r=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*r));c.height=Math.max(1,Math.round(img.height*r));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)};
 const out={name:file.name,type:'image/jpeg',data:draw(max).split(',')[1],thumb:draw(160)};URL.revokeObjectURL(url);return out;
}
window.TtasaInitForms=function(scope){
(scope||document).querySelectorAll('[data-form]:not([data-ready])').forEach(box=>{
 const def=FORMS[box.dataset.form];if(!def)return;
 box.dataset.ready='1';
 box.classList.add('formbox');
 box.innerHTML=`<form novalidate><h3>${def.title}</h3>${def.f.map(field).join('')}
 <input type="text" name="_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
 <label class="agree"><input type="checkbox" required> 개인정보 수집·이용에 동의합니다. ${CFG.privacyUrl?`<a href="${CFG.privacyUrl}" target="_blank">보기</a>`:''}<br><small>${def.agree||'수집 항목: 위에 입력하신 내용 · 목적: 상담 및 서비스 안내 · 보유: 목적 달성 후 지체 없이 파기'}</small></label>
 ${def.note?`<p class="fnote">${def.note}</p>`:''}
 <button class="btn" type="submit">${def.btn}</button><p class="fmsg" role="status"></p></form>`;
 const form=box.querySelector('form'),msg=box.querySelector('.fmsg'),btn=form.querySelector('button');
 if(box.dataset.service){const s=form.querySelector('select');if(s&&SVC.includes(box.dataset.service))s.value=box.dataset.service}
  box._files=[];const fdef=def.f.find(x=>x.t==='file'),MAX=fdef&&fdef.max||MAXF;
 const upl=form.querySelector('[data-upl]');
 if(upl){
  const inp=upl.querySelector('input'),th=upl.querySelector('.thumbs');
  const drawT=()=>{th.innerHTML=box._files.map((f,i)=>`<span class="th"><img src="${f.thumb}" alt="첨부 사진 ${i+1}"><button type="button" data-rm="${i}" aria-label="사진 삭제">×</button></span>`).join('')};
  th.onclick=e=>{const b=e.target.closest('[data-rm]');if(b){box._files.splice(+b.dataset.rm,1);drawT()}};
  inp.onchange=async()=>{
   const list=[...inp.files];inp.value='';msg.className='fmsg';msg.textContent='';
   for(const f of list){
    if(box._files.length>=MAX){msg.className='fmsg err';msg.textContent=`사진은 최대 ${MAX}장까지 첨부할 수 있어요.`;break}
    if(!/^image\//.test(f.type)&&!/\.(heic|heif)$/i.test(f.name)){msg.className='fmsg err';msg.textContent='이미지 파일만 첨부할 수 있어요.';continue}
    if(f.size>15*1024*1024){msg.className='fmsg err';msg.textContent='사진 한 장은 15MB 이하여야 해요.';continue}
    try{box._files.push(await shrink(f,1280,.82))}catch(err){msg.className='fmsg err';msg.textContent='이 사진은 불러올 수 없어요. 다른 사진(JPG, PNG)을 선택해 주세요.'}
   }
   drawT();
  };
 }
 form.onsubmit=async e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  if(form._hp&&form._hp.value)return;
  const values={};def.f.forEach((x,i)=>{const el=form.elements[x.k];values[x.k]=x.t==='checks'?[...form.querySelectorAll('input[type=checkbox]')].filter(c=>c.name===x.k&&c.checked).map(c=>c.value).join(', '):x.t==='file'?(box._files.length?`사진 ${box._files.length}장`:''):(el?el.value.trim():'')});
  let labels=def.f.map(x=>x.k),vals=values;
  if(def.pack){const r=def.pack(values,def,box);labels=r.labels;vals=r.values}
  const payload={form:def.formName||box.dataset.form,title:def.title,labels,values:vals,page:location.pathname,lang:cookieLang(),files:box._files.map(f=>({name:f.name,type:f.type,data:f.data})),thumbs:box._files.map(f=>f.thumb)};
  btn.disabled=true;msg.className='fmsg';msg.textContent='전송 중입니다…';
  try{
   const res=await send(payload);
   box.dispatchEvent(new CustomEvent('ttasa:sent',{bubbles:true,detail:{payload:Object.assign({},payload,{files:undefined,thumbs:undefined}),result:res}}));
   if(res==='test'){msg.className='fmsg warn';msg.textContent='테스트 모드: 아직 접수처가 연결되지 않아 전송되지 않았습니다. (config.js 설정 필요)'}
   else{form.reset();box._files=[];const th2=form.querySelector('.thumbs');if(th2)th2.innerHTML='';msg.className='fmsg ok';msg.textContent='접수되었습니다. 확인 후 빠르게 연락드리겠습니다. 감사합니다.'}
  }catch(err){msg.className='fmsg err';msg.textContent='전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.'}
  btn.disabled=false;
 };
});
};
window.TtasaInitForms();
// 성장노트: 승인된 사례 불러오기
const feed=document.querySelector('[data-feed="growth"]');
if(feed&&CFG.endpoint){
 fetch(CFG.endpoint+'?list=growth').then(r=>r.json()).then(j=>{
  if(!j.ok||!j.items.length)return;
  feed.innerHTML=j.items.map(it=>`<div class="card" data-k="${it['구분']==='칭찬'?'praise':'improve'}"><span class="tag">${esc(it['구분'])} · ${esc(it['서비스'])}</span><h3>${esc(it['표시 이름']||'고객님')}</h3><p>${esc(it['내용'])}</p>${it['처리결과']?`<p class="res"><b>처리 결과</b> ${esc(it['처리결과'])}</p>`:''}${it['개선내용']?`<p class="res"><b>이렇게 개선했어요</b> ${esc(it['개선내용'])}</p>`:''}</div>`).join('');
 }).catch(()=>{});
}
})();
