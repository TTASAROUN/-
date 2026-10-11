// 아기에게 영상편지: 촬영/업로드 → 정보 입력 → 비공개 접수
(function(){
const app=document.getElementById('lt-app');if(!app)return;
const CFG=window.SITE_CONFIG||{};
const MAX_MB=20,MAX_SEC=180;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let video=null,stream=null,rec=null,chunks=[],timer=null;   // video: {blob,name,type,size}
const TIMES=['출산 직후','100일','첫 돌','초등학교 입학','만 19세 성인이 되는 날','직접 날짜 지정'];
const mb=n=>(n/1048576).toFixed(1)+'MB';
const canCam=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);

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
   <p class="hint">영상은 ${MAX_MB}MB, ${MAX_SEC/60}분 이내를 권장해요. 더 크면 아래 ‘영상 링크’ 칸을 이용해 주세요.</p>
   <div class="fld" style="margin-top:8px"><label for="lt-link">영상 링크 <em>(영상이 큰 경우에만)</em></label><input id="lt-link" name="영상 링크" placeholder="구글 드라이브·네이버 마이박스 등 공유 링크"></div>
  </div>
  <div class="fld"><label for="lt-name1">2. 영상 속 엄마(산모) 성함</label><input id="lt-name1" name="산모 성함" required autocomplete="name"></div>
  <div class="fld"><label for="lt-name2">아빠(배우자) 성함 <em>(함께 남기면 더 좋아요)</em></label><input id="lt-name2" name="배우자 성함"></div>
  <div class="fld"><label for="lt-baby">아기 태명 또는 이름</label><input id="lt-baby" name="아기 태명" placeholder="예: 튼튼이" required></div>
  <div class="fld"><label for="lt-due">출산 예정월</label><input id="lt-due" name="출산 예정월" placeholder="예: 2027년 3월" required></div>
  <div class="fld"><label for="lt-when">3. 언제 전달해 드릴까요?</label><select id="lt-when" name="전달 시기">${TIMES.map(t=>`<option>${t}</option>`).join('')}</select></div>
  <div class="fld" id="lt-datebox" hidden><label for="lt-date">전달 희망 날짜</label><input id="lt-date" name="전달 희망일" type="date"></div>
  <div class="fld"><label for="lt-phone">연락처</label><input id="lt-phone" name="연락처" type="tel" required placeholder="010-0000-0000" autocomplete="tel"></div>
  <div class="fld"><label for="lt-mail">이메일 <em>(영상 사본·전달 안내용 · 선택)</em></label><input id="lt-mail" name="이메일" type="email" autocomplete="email"></div>
  <div class="fld"><label for="lt-memo">전하고 싶은 메모 <em>(선택)</em></label><textarea id="lt-memo" name="메모" rows="3" placeholder="직원에게 남기는 요청이나 아기에게 전하는 한마디"></textarea></div>
  <input type="text" name="_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
  <label class="agree"><input type="checkbox" id="lt-agree"> 영상과 개인정보 수집·이용·보관에 동의합니다.<br><small>수집 항목: 영상(얼굴·음성 포함)·성함·연락처·이메일 · 목적: 영상편지 보관 및 약속한 시기에 전달 · 열람: 지정 직원만 · 보유: 전달 완료 후 부모님의 선택에 따라 사본 제공 후 파기하거나 약속한 기간 동안 보관(확정 후 수정) · 삭제 요청 시 즉시 파기</small></label>
  <p class="fmsg" id="lt-msg" role="status"></p>
  <button class="btn" type="submit" id="lt-go">비공개로 접수하기</button></form>`;
 bind();
}
function setVideo(blob,name){
 if(blob.size>MAX_MB*1048576){msg(`영상이 ${mb(blob.size)}로 너무 커요. ${MAX_MB}MB 이하로 줄이시거나 ‘영상 링크’ 칸을 이용해 주세요.`,'err');return}
 video={blob,name,type:blob.type||'video/mp4',size:blob.size};
 const pv=document.getElementById('lt-prev');document.getElementById('lt-play').src=URL.createObjectURL(blob);
 document.getElementById('lt-info').textContent=`${name} · ${mb(blob.size)}`;pv.hidden=false;document.getElementById('lt-pick').hidden=true;msg('');
}
function msg(t,c){const m=document.getElementById('lt-msg');m.textContent=t||'';m.className='fmsg'+(c?' '+c:'')}
function stopStream(){clearInterval(timer);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function bind(){
 const $=id=>document.getElementById(id);
 $('lt-cam').onchange=$('lt-file').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)setVideo(f,f.name)};
 $('lt-redo').onclick=()=>{video=null;$('lt-prev').hidden=true;$('lt-pick').hidden=false;$('lt-play').removeAttribute('src')};
 $('lt-when').onchange=e=>{$('lt-datebox').hidden=e.target.value!=='직접 날짜 지정'};
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
 const bad=(!video&&!g('영상 링크'))?'영상을 촬영·선택하시거나 영상 링크를 입력해 주세요.':!g('산모 성함')?'엄마(산모) 성함을 입력해 주세요.':!g('아기 태명')?'아기 태명을 입력해 주세요.':!g('출산 예정월')?'출산 예정월을 입력해 주세요.':!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(g('연락처'))?'연락처를 확인해 주세요.':(g('전달 시기')==='직접 날짜 지정'&&!g('전달 희망일'))?'전달 희망 날짜를 선택해 주세요.':!document.getElementById('lt-agree').checked?'영상과 개인정보 수집·이용·보관에 동의해 주세요.':'';
 if(bad){msg(bad,'err');return}
 const labels=['산모 성함','배우자 성함','아기 태명','출산 예정월','전달 시기','전달 희망일','연락처','이메일','메모','영상 링크','영상 파일'];
 const values={};labels.forEach(l=>values[l]=g(l));values['영상 파일']=video?`${video.name} (${mb(video.size)})`:'';
 const payload={form:'letter',title:'아기에게 영상편지',labels,values,page:location.pathname,lang:window.cookieLang?window.cookieLang():'ko'};
 const btn=document.getElementById('lt-go');btn.disabled=true;msg(video?'영상을 안전하게 올리는 중이에요. 창을 닫지 말아 주세요…':'접수 중입니다…');
 try{
  if(video&&CFG.endpoint)payload.files=[{name:video.name,type:video.type,data:await b64(video.blob)}];
  const r=await window.TtasaSend(payload);
  done(r==='test');
 }catch(err){msg('접수에 실패했어요. 영상이 크면 ‘영상 링크’로 보내 주시거나 잠시 후 다시 시도해 주세요.','err');btn.disabled=false}
}
function done(test){
 app.innerHTML=`<div class="mcard mdone"><div class="ok">♥</div><h3>${test?'테스트 접수 완료':'영상편지가 접수되었어요'}</h3>
  <p>소중한 마음을 잘 받았습니다.<br>따사로운이 안전하게 보관하고, 약속한 시기에 연락드려 전해 드릴게요.</p>
  ${test?'<p class="fnote">접수처가 아직 연결되지 않아 실제로 전송·저장되지는 않았습니다.</p>':''}
  <button class="btn" type="button" id="lt-again" style="border:0;font-weight:700;cursor:pointer">하나 더 남기기</button></div>`;
 document.getElementById('lt-again').onclick=()=>{video=null;html()};
}
html();
})();
