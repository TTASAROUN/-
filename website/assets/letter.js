// 영상편지: 공개 영상편지 모아보기 + 응원 댓글 + 영상 남기기 (직원 승인 후 공개)
(function(){
const app=document.getElementById('lt-app'),wall=document.getElementById('lt-wall');if(!app)return;
const CFG=window.SITE_CONFIG||{};
const MAX_MB=20,MAX_SEC=180;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md=d=>String(d||'').slice(5).replace('-','.');
const today=()=>new Date().toISOString().slice(0,10);
const mb=n=>(n/1048576).toFixed(1)+'MB';
const canCam=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
let video=null,stream=null,rec=null,chunks=[],timer=null;
let letters=[],comments=[],mine=[],mineC=[],demo=true;

// 영상 주소 → 안전한 재생 주소 (유튜브·구글 드라이브·비메오만 허용)
function embedOf(it){
 const u=String(it.link||'').trim();let m;
 if(it.vid)return `https://drive.google.com/file/d/${encodeURIComponent(it.vid)}/preview`;
 if(m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/))return `https://www.youtube-nocookie.com/embed/${m[1]}`;
 if(m=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/))return `https://drive.google.com/file/d/${m[1]}/preview`;
 if(m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/))return `https://player.vimeo.com/video/${m[1]}`;
 return '';
}
const SAMPLE=[
 {id:'s1',nick:'튼튼이네 엄마 아빠',baby:'튼튼이',due:'2026년 12월',msg:'튼튼아, 엄마 아빠는 네가 건강하게 만날 날만 기다리고 있어. 첫 인사를 미리 할게. 사랑해!',date:'2026-10-09',sample:1},
 {id:'s2',nick:'콩콩이네 가족',baby:'콩콩이',due:'2027년 1월',msg:'우리 콩콩이가 이 영상을 볼 때쯤이면 얼마나 컸을까? 아빠가 매일 배에 대고 책을 읽어주고 있어요.',date:'2026-10-05',sample:1},
 {id:'s3',nick:'하늘이 엄마',baby:'하늘이',due:'2026년 11월',msg:'아빠가 출장 중이라 엄마가 먼저 남겨요. 하늘아, 곧 만나자!',date:'2026-09-28',sample:1}
];
const SC={s1:[{nick:'새싹맘',body:'너무 따뜻한 영상이에요. 순산하세요!',date:'2026-10-10'}],s2:[]};
const cmts=id=>(SC[id]||[]).concat(comments.filter(c=>c.pid===id),mineC.filter(c=>c.pid===id));

function player(it){
 if(it.blobUrl)return `<video class="lt-v" src="${esc(it.blobUrl)}" controls playsinline></video>`;
 const e=embedOf(it);
 if(e)return `<iframe class="lt-v" src="${esc(e)}" title="${esc(it.baby)} 영상편지" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
 if(it.link&&/^https?:\/\//.test(it.link))return `<a class="btn sm" href="${esc(it.link)}" target="_blank" rel="noopener">영상 보러 가기</a>`;
 return `<div class="lt-v lt-ph"><span>▶</span><small>${it.sample?'예시 영상 자리':'영상 준비 중'}</small></div>`;
}
function card(it){
 const cs=cmts(it.id);
 return `<article class="lt-card${it.pending?' pend':''}" data-id="${esc(it.id)}">
  <header><h3>${esc(it.nick)}</h3><p class="mute">태명 <b>${esc(it.baby)}</b> · 출산 예정 ${esc(it.due)}${it.pending?' · <span class="pill w">검토 중 · 이 화면에서만 보여요</span>':''}${it.sample?' <span class="smp">예시</span>':''}</p></header>
  ${player(it)}<p class="lt-msg">${esc(it.msg)}</p>
  <div class="cl">${cs.map(c=>`<div class="cmt"><b>${esc(c.nick)}</b> <span>${esc(md(c.date))}</span>${c.pending?' <span class="pill w">검토 중</span>':''}<p>${esc(c.body)}</p></div>`).join('')||'<p class="mute">첫 응원을 남겨 보세요.</p>'}</div>
  <form class="cf" data-pid="${esc(it.id)}"><input name="n" placeholder="닉네임" maxlength="12" required><input name="b" placeholder="응원 한마디 (확인 후 공개)" maxlength="200" required><button class="btn sm" type="submit">응원하기</button></form>
  <button type="button" class="link" data-report="${esc(it.id)}">신고하기</button></article>`;
}
function renderWall(){
 const all=mine.concat(letters);
 document.getElementById('lt-demo').textContent=demo?'아래 영상편지는 화면 확인용 가상 예시입니다. 접수처 연결 후 실제 가족들의 영상편지로 바뀝니다.':'';
 wall.innerHTML=all.length?all.map(card).join(''):'<div class="todo">아직 공개된 영상편지가 없어요. 첫 번째 영상편지의 주인공이 되어 주세요.</div>';
}
wall.addEventListener('submit',async e=>{
 const f=e.target.closest('.cf');if(!f)return;e.preventDefault();
 const pid=f.dataset.pid,n=f.elements.n.value.trim(),b=f.elements.b.value.trim();if(!n||!b)return;
 try{await window.TtasaSend({form:'comment',title:'영상편지 응원 댓글',labels:['글번호','닉네임','내용'],values:{'글번호':pid,'닉네임':n,'내용':b},page:location.pathname});
  mineC.push({pid,nick:n,body:b,date:today(),pending:true});renderWall()}catch(err){}
});
wall.addEventListener('click',e=>{const r=e.target.closest('[data-report]');if(!r)return;r.disabled=true;r.textContent='신고가 접수됐어요. 확인할게요';window.TtasaSend({form:'report',title:'신고',labels:['글번호','대상'],values:{'글번호':r.dataset.report,'대상':'영상편지'},page:location.pathname}).catch(()=>{})});
(async function(){
 if(CFG.endpoint){try{const j=await (await fetch(CFG.endpoint+'?list=letters')).json();if(j.ok){letters=j.letters;comments=j.comments;demo=false}}catch(e){}}
 if(demo){letters=SAMPLE}renderWall();
})();

// ── 영상 남기기 ──
function html(){
 app.innerHTML=`<form class="lt-form" novalidate>
  <div class="fld"><label>1. 영상 남기기</label>
   <div class="lt-pick" id="lt-pick">
    <label class="btn ghost2 upbtn" for="lt-cam">휴대폰으로 촬영</label><input id="lt-cam" type="file" accept="video/*" capture="user" hidden>
    <label class="btn ghost2 upbtn" for="lt-file">앨범에서 선택</label><input id="lt-file" type="file" accept="video/*" hidden>
    ${canCam?'<button type="button" class="btn ghost2 upbtn" id="lt-rec">이 화면에서 바로 녹화</button>':''}
   </div>
   <div id="lt-cambox" hidden><video id="lt-live" playsinline muted></video><div class="lt-ctl"><button type="button" class="btn sm" id="lt-start">녹화 시작</button><button type="button" class="btn sm ghost2" id="lt-stop" hidden>녹화 끝내기</button><span id="lt-time" class="mute"></span><button type="button" class="link" id="lt-cancel">닫기</button></div></div>
   <div id="lt-prev" hidden><video id="lt-play" controls playsinline></video><p class="mute" id="lt-info"></p><button type="button" class="link" id="lt-redo">다시 올리기</button></div>
   <p class="hint">영상은 ${MAX_MB}MB, ${MAX_SEC/60}분 이내를 권장해요. 더 크면 아래 ‘영상 링크’ 칸에 유튜브(일부 공개)·구글 드라이브 주소를 붙여 넣어 주세요.</p>
   <div class="fld" style="margin-top:8px"><label for="lt-link">영상 링크 <em>(영상이 큰 경우에만)</em></label><input id="lt-link" name="영상 링크" placeholder="유튜브·구글 드라이브·비메오 공유 링크"></div>
  </div>
  <div class="fld"><label for="lt-nick">2. 공개될 이름</label><input id="lt-nick" name="표시 이름" placeholder="예: 튼튼이네 엄마 아빠" maxlength="20" required></div>
  <div class="fld"><label for="lt-baby">아기 태명</label><input id="lt-baby" name="태명" placeholder="예: 튼튼이 (실명 대신 태명을 권해요)" maxlength="12" required></div>
  <div class="fld"><label for="lt-due">출산 예정월</label><input id="lt-due" name="출산 예정월" placeholder="예: 2027년 3월" required></div>
  <div class="fld"><label for="lt-msg">아기에게 한마디 <em>(영상 옆에 함께 공개돼요)</em></label><textarea id="lt-msg" name="한마디" rows="3" maxlength="300" required placeholder="영상과 함께 보여질 짧은 글을 적어 주세요."></textarea></div>
  <div class="fld"><label for="lt-phone">연락처 <em>(공개되지 않아요 · 확인 연락용)</em></label><input id="lt-phone" name="연락처" type="tel" required placeholder="010-0000-0000" autocomplete="tel"></div>
  <div class="fld"><label for="lt-mail">이메일 <em>(선택)</em></label><input id="lt-mail" name="이메일" type="email" autocomplete="email"></div>
  <input type="text" name="_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
  <label class="agree"><input type="checkbox" id="lt-agree1"> <b>(필수)</b> 영상·한마디·이름·태명이 <b>이 홈페이지에 공개</b>되는 것에 동의합니다.<br><small>영상 속 얼굴과 목소리가 누구에게나 보일 수 있고, 다른 사람이 저장할 수 있습니다. 영상에 나오는 모든 분의 동의를 받았고, 삭제를 요청하면 홈페이지에서 내려진다는 것을 확인했습니다. 공개는 직원 확인 후 이루어집니다.</small></label>
  <label class="agree"><input type="checkbox" id="lt-agree2"> <b>(필수)</b> 개인정보(연락처·이메일) 수집·이용에 동의합니다.<br><small>목적: 영상 확인·공개 안내 · 비공개 보관(홈페이지에 공개하지 않음) · 보유: 영상 게시 종료 또는 삭제 요청 시 지체 없이 파기</small></label>
  <p class="fmsg" id="lt-msgbox" role="status"></p>
  <button class="btn" type="submit" id="lt-go">영상편지 접수하기</button></form>`;
 bind();
}
function msg(t,c){const m=document.getElementById('lt-msgbox');if(!m)return;m.textContent=t||'';m.className='fmsg'+(c?' '+c:'')}
function setVideo(blob,name){
 if(blob.size>MAX_MB*1048576){msg(`영상이 ${mb(blob.size)}로 너무 커요. ${MAX_MB}MB 이하로 줄이시거나 ‘영상 링크’ 칸을 이용해 주세요.`,'err');return}
 video={blob,name,type:blob.type||'video/mp4',size:blob.size};
 document.getElementById('lt-play').src=URL.createObjectURL(blob);
 document.getElementById('lt-info').textContent=`${name} · ${mb(blob.size)}`;document.getElementById('lt-prev').hidden=false;document.getElementById('lt-pick').hidden=true;msg('');
}
function stopStream(){clearInterval(timer);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function bind(){
 const $=id=>document.getElementById(id);
 $('lt-cam').onchange=$('lt-file').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)setVideo(f,f.name)};
 $('lt-redo').onclick=()=>{video=null;$('lt-prev').hidden=true;$('lt-pick').hidden=false;$('lt-play').removeAttribute('src')};
 if($('lt-rec'))$('lt-rec').onclick=async()=>{
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:true})}catch(e){msg('카메라나 마이크를 사용할 수 없어요. ‘휴대폰으로 촬영’ 또는 ‘앨범에서 선택’을 이용해 주세요.','err');return}
  $('lt-cambox').hidden=false;$('lt-pick').hidden=true;const lv=$('lt-live');lv.srcObject=stream;lv.play();msg('');
 };
 $('lt-cancel').onclick=()=>{stopStream();$('lt-cambox').hidden=true;$('lt-pick').hidden=false};
 $('lt-start').onclick=()=>{
  chunks=[];const mt=['video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  rec=new MediaRecorder(stream,{mimeType:mt||undefined,videoBitsPerSecond:700000,audioBitsPerSecond:64000});
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  rec.onstop=()=>{const blob=new Blob(chunks,{type:rec.mimeType||'video/webm'});stopStream();$('lt-cambox').hidden=true;setVideo(blob,'영상편지.'+(blob.type.includes('mp4')?'mp4':'webm'))};
  rec.start(1000);$('lt-start').hidden=true;$('lt-stop').hidden=false;let s=0;timer=setInterval(()=>{s++;$('lt-time').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} / ${MAX_SEC/60}:00`;if(s>=MAX_SEC)$('lt-stop').click()},1000);
 };
 $('lt-stop').onclick=()=>{clearInterval(timer);if(rec&&rec.state!=='inactive')rec.stop();$('lt-start').hidden=false;$('lt-stop').hidden=true;$('lt-time').textContent=''};
 app.querySelector('form').onsubmit=submit;
}
const b64=blob=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=no;r.readAsDataURL(blob)});
async function submit(e){
 e.preventDefault();const f=e.target,g=n=>(f.elements[n]&&f.elements[n].value||'').trim();
 if(f._hp&&f._hp.value)return;
 const link=g('영상 링크');
 const bad=(!video&&!link)?'영상을 촬영·선택하시거나 영상 링크를 입력해 주세요.':(link&&!/^https?:\/\//.test(link))?'영상 링크는 https:// 로 시작하는 주소여야 해요.':!g('표시 이름')?'공개될 이름을 입력해 주세요.':!g('태명')?'아기 태명을 입력해 주세요.':!g('출산 예정월')?'출산 예정월을 입력해 주세요.':!g('한마디')?'아기에게 한마디를 적어 주세요.':!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(g('연락처'))?'연락처를 확인해 주세요.':!document.getElementById('lt-agree1').checked?'영상 공개에 동의해 주세요.':!document.getElementById('lt-agree2').checked?'개인정보 수집·이용에 동의해 주세요.':'';
 if(bad){msg(bad,'err');return}
 const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 const labels=['글번호','표시 이름','태명','출산 예정월','한마디','연락처','이메일','영상 링크','영상 파일'];
 const values={'글번호':id,'표시 이름':g('표시 이름'),'태명':g('태명'),'출산 예정월':g('출산 예정월'),'한마디':g('한마디'),'연락처':g('연락처'),'이메일':g('이메일'),'영상 링크':link,'영상 파일':video?`${video.name} (${mb(video.size)})`:''};
 const payload={form:'letter',title:'영상편지',labels,values,page:location.pathname,lang:window.cookieLang?window.cookieLang():'ko'};
 const btn=document.getElementById('lt-go');btn.disabled=true;msg(video?'영상을 올리는 중이에요. 창을 닫지 말아 주세요…':'접수 중입니다…');
 try{
  if(video&&CFG.endpoint)payload.files=[{name:video.name,type:video.type,data:await b64(video.blob)}];
  const r=await window.TtasaSend(payload);
  mine.unshift({id,nick:values['표시 이름'],baby:values['태명'],due:values['출산 예정월'],msg:values['한마디'],link,blobUrl:video?URL.createObjectURL(video.blob):'',date:today(),pending:true});
  renderWall();done(r==='test');
 }catch(err){msg('접수에 실패했어요. 영상이 크면 ‘영상 링크’로 보내 주시거나 잠시 후 다시 시도해 주세요.','err');btn.disabled=false}
}
function done(test){
 app.innerHTML=`<div class="mcard mdone"><div class="ok">♥</div><h3>${test?'테스트 접수 완료':'영상편지가 접수되었어요'}</h3>
  <p>직원이 확인한 뒤 이 페이지에 공개해 드릴게요.<br>위 ‘영상편지 모아보기’에서 접수된 영상을 미리 볼 수 있어요. (공개 전에는 이 화면에서만 보여요)</p>
  ${test?'<p class="fnote">접수처가 아직 연결되지 않아 실제로 전송·저장되지는 않았습니다.</p>':''}
  <button class="btn" type="button" id="lt-again" style="border:0;font-weight:700;cursor:pointer">하나 더 남기기</button></div>`;
 document.getElementById('lt-again').onclick=()=>{video=null;html()};
 wall.scrollIntoView({behavior:'smooth',block:'start'});
}
html();
})();
