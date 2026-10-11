// 번개매칭 조건 필터 — 웹(데모)과 Apps Script(실서비스)가 같은 파일을 씁니다.
// 수정하면 apps-script/Match.gs 에도 동일하게 복사하세요: cp assets/match-core.js ../apps-script/Match.gs
(function(root){
var SVC={'산후관리사':'산후관리사','영유아 관리사':'영유아관리사','가사관리사':'가사관리사','정리수납전문가':'정리수납전문가','이유식전문가':'이유식전문가'};
var REQUIRED_DOCS=['건강진단서 만료일','범죄경력조회 만료일','아동학대범죄경력 만료일']; // 비어 있거나 기간 내 만료되면 제외
var OPTIONAL_DOCS=['백일해접종 만료일'];                                                // 값이 있고 만료됐을 때만 제외
function pad(n){return n<10?'0'+n:''+n}
function toDate(v){
  if(v===null||v===undefined||v==='')return null;
  if(Object.prototype.toString.call(v)==='[object Date]')return isNaN(v)?null:new Date(v.getFullYear(),v.getMonth(),v.getDate());
  var m=String(v).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?new Date(+m[1],m[2]-1,+m[3]):null;
}
function yes(v){return String(v==null?'':v).trim().toUpperCase()==='Y'}
function periods(v){ // '2025-11-01~2025-11-20, 2025-12-24~2025-12-26'
  return String(v||'').split(',').map(function(p){var x=p.split('~');var a=toDate(x[0]),b=toDate(x[1]||x[0]);return a&&b?[a,b]:null}).filter(Boolean);
}
function regionOK(cust,list){
  var c=String(cust||'').replace(/\s/g,'');if(!c)return true;
  return String(list||'').split(',').some(function(it){var n=it.replace(/\s/g,'');return n&&(n.indexOf(c)>-1||c.indexOf(n)>-1)});
}
function ageBand(birth,now){var d=toDate(birth);if(!d)return '';var a=now.getFullYear()-d.getFullYear();return Math.floor(a/10)*10+'대'}
function maskName(n){n=String(n||'').trim();return n?n.charAt(0)+new Array(n.length).join('○'):'선생님'}
function csv(v){return String(v||'').split(',').map(function(s){return s.trim()}).filter(Boolean)}

// rows: 시트 한 줄이 객체(헤더=키)인 배열, q: {service,region,start,end,traits[],extras[]}
function match(rows,q,now){
  now=now||new Date();
  var svcs=[].concat(q.service||[]).filter(function(x){return SVC[x]});if(!svcs.length)return [];
  var start=toDate(q.start),end=toDate(q.end||q.start);if(!start||!end)return [];
  var extras=q.extras||[],traits=q.traits||[];
  var out=[];
  rows.forEach(function(r){
    if(String(r['활동상태']||'').trim()!=='활동중')return;
    if(!svcs.every(function(x){return yes(r[SVC[x]])}))return;
    if(!regionOK(q.region,r['활동지역']))return;
    if(!yes(r['서류완비']))return;
    var ok=true;
    REQUIRED_DOCS.forEach(function(k){var d=toDate(r[k]);if(!d||d<end)ok=false});
    OPTIONAL_DOCS.forEach(function(k){var d=toDate(r[k]);if(d&&d<end)ok=false});
    if(!ok)return;
    var busy=toDate(r['현재배정종료일']);if(busy&&busy>=start)return;
    if(periods(r['근무불가기간']).some(function(p){return p[0]<=end&&p[1]>=start}))return;
    // 기타 조건
    var band=ageBand(r['생년월일'],now),pet=String(r['반려동물조건']||'무관').trim();
    if(extras.indexOf('자차')>-1&&!yes(r['자차보유']))return;
    if(extras.indexOf('입주')>-1&&!yes(r['야간(입주)가능']))return;
    if(extras.indexOf('반려견')>-1&&(pet==='불가'||pet==='고양이만'))return;
    if(extras.indexOf('반려묘')>-1&&(pet==='불가'||pet==='강아지만'))return;
    if(extras.indexOf('다태아')>-1&&!yes(r['다태아가능']))return;
    if(extras.indexOf('먼거리')>-1&&String(r['먼거리가능']||'').trim()!=='가능')return;
    if(extras.indexOf('휴일')>-1&&!yes(r['휴·공휴일가능']))return;
    if(+q.minYears&&!((+r['경력(년)']||0)>=+q.minYears))return;
    var bands=['50대','60대'].filter(function(b){return extras.indexOf(b)>-1});
    if(bands.length&&bands.indexOf(band)<0)return;
    // 성향은 거르지 않고 우선순위에만 반영
    var mine=csv(r['성향']),hit=traits.filter(function(t){return mine.indexOf(t)>-1});
    var mp=String(q.mbti||''),mm=String(r['MBTI']||'').toUpperCase(),mSet=0,mHit=0;
    for(var i=0;i<4;i++){if(mp.charAt(i)&&mp.charAt(i)!=='-'){mSet++;if(mm.charAt(i)===mp.charAt(i))mHit++}}
    var tags=[];if(yes(r['자차보유']))tags.push('자차');if(yes(r['야간(입주)가능']))tags.push('야간·입주');if(yes(r['휴·공휴일가능']))tags.push('휴·공휴일');if(yes(r['다태아가능']))tags.push('다태아');if(String(r['먼거리가능']||'').trim()==='가능')tags.push('먼거리');
    var pets=pet==='무관'?'':'반려동물 '+pet;
    out.push({
      id:r['관리번호'],name:maskName(r['성명']),
      services:Object.keys(SVC).filter(function(k){return yes(r[SVC[k]])}),
      years:r['경력(년)'],traits:mine,traitHit:hit,mbti:r['MBTI']||'',strength:r['장점']||'',
      rating:r['평균평점']||'',age:band,tags:tags,pet:pets,edu:r['학력']||'',school:r['수료기관']||'',mbtiHit:mSet>0?mHit+'/'+mSet:'',mbtiFull:mSet>0&&mHit===mSet,
      _s:mHit*60+hit.length*100+(+r['평균평점']||0)*10+(+r['경력(년)']||0)
    });
  });
  out.sort(function(a,b){return b._s-a._s});
  return out.slice(0,12).map(function(o){delete o._s;return o});
}
var api={match:match,toDate:toDate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.MatchCore=api;
})(typeof window!=='undefined'?window:this);
