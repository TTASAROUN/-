/* ============================================================
   modules.js — 메뉴/화면/데이터 구조 정의
   화면을 추가하거나 항목을 바꾸려면 이 파일만 고치면 됩니다.
   필드 타입: text textarea number date time select ref file bool lines json
   ============================================================ */
window.LMS = window.LMS || {};

const SIDO = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
const CHANNEL = ['홈페이지','HRD-Net','지인소개','전화문의','블로그/SNS','고용센터','기타'];
const APPROVAL = ['작성','검토','승인'];

const F = {
  trainee: (extra={}) => ({k:'trainee', l:'훈련생', t:'ref', r:'trainee', req:true, list:true, ...extra}),
  course:  (extra={}) => ({k:'course',  l:'과정',   t:'ref', r:'course',  req:true, list:true, ...extra}),
  staff:   (k,l,extra={}) => ({k, l, t:'ref', r:'staff', ...extra}),
  date:    (k='date', l='일자', extra={}) => ({k, l, t:'date', req:true, list:true, ...extra}),
  file:    (k='file', l='첨부파일') => ({k, l, t:'file'}),
  memo:    (k='memo', l='비고') => ({k, l, t:'textarea'}),
  approval:() => ({k:'approval', l:'결재상태', t:'select', o:APPROVAL, list:true, badge:true, def:'작성'}),
};

LMS.entities = {
  /* ---------- 1. 상담 및 접수 ---------- */
  interview_eval: { label:'면접선발 평가표', fields:[
    {k:'name', l:'지원자', t:'text', req:true, list:true},
    F.course(), F.date('date','면접일'),
    {k:'s1', l:'학습의지', t:'number', max:25, hint:'25점'},
    {k:'s2', l:'직무적합성', t:'number', max:25, hint:'25점'},
    {k:'s3', l:'태도/인성', t:'number', max:25, hint:'25점'},
    {k:'s4', l:'기초지식', t:'number', max:25, hint:'25점'},
    {k:'total', l:'총점', t:'number', calc:r=>(+r.s1||0)+(+r.s2||0)+(+r.s3||0)+(+r.s4||0), list:true},
    {k:'result', l:'결과', t:'select', o:['합격','불합격','보류'], list:true, badge:true},
    F.staff('interviewer','면접관'), F.memo(),
  ]},
  admission_consult: { label:'입학상담', fields:[
    {k:'name', l:'이름', t:'text', req:true, list:true},
    {k:'phone', l:'연락처', t:'text', list:true},
    {k:'gender', l:'성별', t:'select', o:['남','여']},
    {k:'birth', l:'생년월일', t:'date'},
    {k:'region', l:'지역', t:'select', o:SIDO},
    {k:'channel', l:'지원경로', t:'select', o:CHANNEL, list:true},
    F.course({l:'관심과정', req:false}),
    F.date('date','상담일'),
    {k:'content', l:'상담내용', t:'textarea'},
    {k:'status', l:'진행상태', t:'select', o:['상담중','접수','등록완료','취소'], list:true, badge:true, def:'상담중'},
    F.staff('counselor','담당자'),
  ]},
  daily_recruit: { label:'일일모집현황', fields:[
    F.date(), F.course(),
    {k:'inquiry', l:'문의', t:'number', list:true},
    {k:'consult', l:'상담', t:'number', list:true},
    {k:'apply', l:'접수', t:'number', list:true},
    {k:'enroll', l:'등록', t:'number', list:true},
    F.memo(),
  ]},
  trainee_file: { label:'수강생 파일등록', fields:[
    F.trainee(),
    {k:'kind', l:'서류종류', t:'select', o:['신분증','졸업증명서','수강신청서','자격증','기타'], list:true},
    {k:'title', l:'제목', t:'text', list:true},
    F.file(), F.date('date','등록일'),
  ]},

  /* ---------- 2. 과정등록 ---------- */
  course: { label:'교육과정현황', copy:true, fields:[
    {k:'name', l:'과정명', t:'text', req:true, list:true},
    {k:'ncs', l:'NCS 분류', t:'text', hint:'예: 20. 정보통신 > 01. 정보기술'},
    {k:'start', l:'시작일', t:'date', list:true},
    {k:'end', l:'종료일', t:'date', list:true},
    {k:'hours', l:'총 훈련시간', t:'number'},
    {k:'capacity', l:'정원', t:'number', list:true},
    F.staff('teacher','담당교사',{list:true}),
    {k:'room', l:'훈련장소', t:'text'},
    {k:'status', l:'상태', t:'select', o:['모집중','진행중','종료'], list:true, badge:true, def:'모집중'},
    {k:'deadline', l:'모집마감일', t:'date'},
    {k:'intro', l:'과정소개(홈페이지 노출)', t:'textarea'},
    {k:'public', l:'홈페이지 노출', t:'bool', def:true},
  ]},
  guide_material: { label:'학생안내자료 등록', fields:[
    F.course(),
    {k:'kind', l:'종류', t:'select', o:['학습안내','평가계획','OT안내','기타'], list:true},
    {k:'title', l:'제목', t:'text', req:true, list:true},
    {k:'content', l:'내용', t:'textarea'}, F.file(), F.date('date','등록일'),
  ]},
  timetable: { label:'시간표 등록', csvImport:true, fields:[
    F.course(), F.date(),
    {k:'period', l:'교시', t:'number', list:true},
    {k:'start', l:'시작', t:'time', list:true},
    {k:'end', l:'종료', t:'time', list:true},
    {k:'subject', l:'과목(능력단위)', t:'text', req:true, list:true},
    F.staff('teacher','교강사',{list:true}),
    {k:'room', l:'강의실', t:'text'},
  ]},

  /* ---------- 3. 학적부 ---------- */
  trainee: { label:'훈련생현황(신상기록부)', fields:[
    {k:'name', l:'이름', t:'text', req:true, list:true},
    {k:'birth', l:'생년월일', t:'date'},
    {k:'gender', l:'성별', t:'select', o:['남','여'], list:true},
    {k:'phone', l:'연락처', t:'text', list:true},
    {k:'address', l:'주소', t:'text'},
    {k:'region', l:'지역', t:'select', o:SIDO},
    {k:'edu', l:'최종학력', t:'select', o:['고졸','전문대졸','대졸','대학원졸','기타']},
    F.course(),
    F.date('enrollDate','등록일'),
    {k:'status', l:'상태', t:'select', o:['재학','수료','중도탈락','취업'], list:true, badge:true, def:'재학'},
    {k:'channel', l:'지원경로', t:'select', o:CHANNEL},
    {k:'emergency', l:'비상연락처', t:'text'},
    {k:'note', l:'특이사항', t:'textarea'},
    {k:'photo', l:'사진', t:'file'},
  ]},
  trainee_counsel: { label:'교육생 상담일지', fields:[
    F.trainee(), F.course(), F.date('date','상담일'),
    {k:'kind', l:'상담유형', t:'select', o:['학습','진로','생활','취업','기타'], list:true},
    {k:'content', l:'상담내용', t:'textarea', req:true},
    {k:'action', l:'조치사항', t:'textarea'},
    F.staff('counselor','상담자',{list:true}),
  ]},
  trainee_doc: { label:'훈련생 확인서류', fields:[
    F.trainee(), {k:'title', l:'서류명', t:'text', req:true, list:true},
    F.date('date','확인일'), F.staff('checker','확인자'), F.file(),
  ]},
  counsel_report: { label:'상담결과보고', fields:[
    F.course(), {k:'period', l:'기간', t:'text', list:true, hint:'예: 2026년 3월'},
    {k:'count', l:'상담건수', t:'number', list:true},
    {k:'summary', l:'주요내용', t:'textarea'},
    {k:'improve', l:'개선사항', t:'textarea'},
    F.staff('writer','작성자'), F.date('date','작성일'), F.approval(),
  ]},
  grievance: { label:'고충 및 건의사항', fields:[
    F.trainee(), F.date(),
    {k:'kind', l:'구분', t:'select', o:['고충','건의'], list:true},
    {k:'content', l:'내용', t:'textarea', req:true},
    {k:'result', l:'처리결과', t:'textarea'},
    {k:'status', l:'처리상태', t:'select', o:['접수','처리중','완료'], list:true, badge:true, def:'접수'},
  ]},
  course_board: { label:'과정별 게시판', fields:[
    F.course(), {k:'title', l:'제목', t:'text', req:true, list:true},
    {k:'content', l:'내용', t:'textarea'}, F.staff('writer','작성자',{list:true}), F.date('date','작성일'), F.file(),
  ]},

  /* ---------- 5. 훈련일지 ---------- */
  training_log: { label:'훈련일지', fields:[
    F.course(), F.date(),
    {k:'period', l:'교시', t:'number', list:true},
    {k:'subject', l:'과목(능력단위)', t:'text', list:true},
    F.staff('teacher','교강사',{list:true}),
    {k:'content', l:'훈련내용', t:'textarea'},
    {k:'present', l:'출석', t:'number'}, {k:'absent', l:'결석', t:'number'}, {k:'late', l:'지각/조퇴', t:'number'},
    {k:'note', l:'특이사항', t:'textarea'},
    F.approval(), F.staff('approver','결재자'),
  ]},
  makeup_log: { label:'보강훈련일지', fields:[
    F.course(), F.date(), F.trainee({l:'대상 훈련생'}),
    {k:'reason', l:'보강사유', t:'text', list:true},
    {k:'content', l:'보강내용', t:'textarea'},
    {k:'hours', l:'보강시간', t:'number'},
    F.file('evidence','증빙자료'), F.approval(), F.staff('approver','결재자'),
  ]},

  /* ---------- 6. 사전평가 ---------- */
  pre_eval_info: { label:'평가기본정보', copy:true, fields:[
    F.course(), {k:'name', l:'평가명', t:'text', req:true, list:true},
    F.date('date','평가일'),
    {k:'method', l:'평가방법', t:'select', o:['필기','실기','필기+실기','면담']},
    {k:'areas', l:'평가영역', t:'text', hint:'예: 이론/실기/태도'},
    {k:'maxScore', l:'만점', t:'number', def:100},
    F.memo(),
  ]},
  pre_eval: { label:'평가표', fields:[
    {k:'evalInfo', l:'평가', t:'ref', r:'pre_eval_info', req:true, list:true},
    F.trainee(),
    {k:'a1', l:'이론', t:'number'}, {k:'a2', l:'실기', t:'number'}, {k:'a3', l:'태도', t:'number'},
    {k:'total', l:'총점', t:'number', calc:r=>(+r.a1||0)+(+r.a2||0)+(+r.a3||0), list:true},
    {k:'level', l:'수준', t:'text', calc:r=>{const t=(+r.a1||0)+(+r.a2||0)+(+r.a3||0);return t>=80?'상':t>=60?'중':'하';}, list:true, badge:true},
    F.memo(),
  ]},
  pre_eval_meeting: { label:'평가결과 회의록', fields:[
    {k:'evalInfo', l:'평가', t:'ref', r:'pre_eval_info', req:true, list:true},
    F.date('date','일시'), {k:'attendees', l:'참석자', t:'text', list:true},
    {k:'discussion', l:'논의내용', t:'textarea'}, {k:'decision', l:'결정사항', t:'textarea'},
  ]},
  pre_eval_sheet: { label:'사전평가 평가지', fields:[
    {k:'evalInfo', l:'평가', t:'ref', r:'pre_eval_info', req:true, list:true},
    {k:'title', l:'제목', t:'text', list:true},
    {k:'questions', l:'문항', t:'lines', hint:'한 줄에 한 문항'}, F.file(),
  ]},
  exam_file: { label:'시험지 파일등록', fields:[
    F.course(), {k:'kind', l:'구분', t:'select', o:['사전평가','수행평가','능력단위평가'], list:true},
    {k:'title', l:'제목', t:'text', req:true, list:true}, F.file(), F.date('date','등록일'),
  ]},

  /* ---------- 7. 수행평가 ---------- */
  self_diag_setting: { label:'자가진단평가 설정', copy:true, fields:[
    F.course(), {k:'unit', l:'능력단위', t:'text', req:true, list:true},
    {k:'items', l:'진단문항', t:'lines', hint:'한 줄에 한 문항 (5점 척도)'},
  ]},
  self_eval: { label:'자기평가서', fields:[
    F.trainee(), F.course(),
    {k:'setting', l:'자가진단 설정', t:'ref', r:'self_diag_setting', list:true},
    F.date('date','평가일'),
    {k:'answers', l:'문항별 점수', t:'scores', src:'setting', srcField:'items', max:5},
    {k:'avg', l:'평균', t:'number', list:true, calc:r=>{const v=Object.values(r.answers||{}).map(Number).filter(n=>n>0);return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):0;}},
    {k:'reflect', l:'소감/다짐', t:'textarea'},
  ]},
  perf_eval: { label:'수행평가서', fields:[
    F.trainee(), F.course(), {k:'unit', l:'능력단위', t:'text', req:true, list:true},
    {k:'criteria', l:'수행준거', t:'lines', hint:'한 줄에 한 준거. 파일(txt/csv) 업로드 시 자동 생성', upload:true},
    {k:'achieve', l:'준거별 달성', t:'scores', src:'self', srcField:'criteria', o:['달성','미달성','보완필요']},
    {k:'comment', l:'총평', t:'textarea'}, F.staff('evaluator','평가자',{list:true}), F.date('date','평가일'),
  ]},

  /* ---------- 8. 평가관리(능력단위) ---------- */
  subject_eval_setting: { label:'과목별평가설정', copy:true, fields:[
    F.course(), {k:'unit', l:'능력단위', t:'text', req:true, list:true},
    {k:'method', l:'평가방법', t:'text', hint:'예: 필기, 작업형, 포트폴리오'},
    {k:'w1', l:'이론 배점', t:'number', def:40, list:true}, {k:'w2', l:'실기 배점', t:'number', def:50, list:true}, {k:'w3', l:'태도 배점', t:'number', def:10, list:true},
    {k:'pass', l:'합격기준(점)', t:'number', def:60},
    F.date('date','평가일',{req:false}),
  ]},
  grade: { label:'성적 입력', fields:[
    F.trainee(), F.course(),
    {k:'setting', l:'능력단위', t:'ref', r:'subject_eval_setting', req:true, list:true},
    {k:'s1', l:'이론', t:'number', list:true}, {k:'s2', l:'실기', t:'number', list:true}, {k:'s3', l:'태도', t:'number', list:true},
    {k:'total', l:'총점', t:'number', list:true, calc:r=>(+r.s1||0)+(+r.s2||0)+(+r.s3||0)},
    {k:'gradeLetter', l:'등급', t:'text', list:true, badge:true, calc:r=>{const t=(+r.s1||0)+(+r.s2||0)+(+r.s3||0);return t>=90?'A':t>=80?'B':t>=70?'C':t>=60?'D':'F';}},
    F.memo(),
  ]},
  eval_analysis: { label:'평가결과분석/분석회의록', fields:[
    F.course(), F.date('date','일시'), {k:'title', l:'제목', t:'text', req:true, list:true},
    {k:'attendees', l:'참석자', t:'text'},
    {k:'analysis', l:'분석내용', t:'textarea'}, {k:'improve', l:'개선사항', t:'textarea'},
  ]},

  /* ---------- 9. 설문관리 ---------- */
  survey: { label:'설문지', copy:true, fields:[
    {k:'title', l:'설문 제목', t:'text', req:true, list:true},
    F.course({req:false}),
    {k:'target', l:'대상', t:'select', o:['훈련생','교강사','수료생'], list:true},
    {k:'start', l:'시작일', t:'date', list:true}, {k:'end', l:'종료일', t:'date', list:true},
    {k:'questions', l:'문항', t:'questions'},
    {k:'status', l:'상태', t:'select', o:['준비','진행중','마감'], list:true, badge:true, def:'준비'},
  ]},
  survey_response: { label:'설문 응답', fields:[
    {k:'survey', l:'설문', t:'ref', r:'survey', req:true, list:true},
    {k:'respondent', l:'응답자', t:'text', list:true},
    {k:'answers', l:'응답', t:'json'},
    F.date('date','응답일'),
  ]},
  survey_feedback: { label:'설문 총평 및 피드백', fields:[
    {k:'survey', l:'설문', t:'ref', r:'survey', req:true, list:true},
    {k:'summary', l:'총평', t:'textarea'}, {k:'feedback', l:'피드백/개선계획', t:'textarea'},
    F.staff('writer','작성자',{list:true}), F.date('date','작성일'),
  ]},

  /* ---------- 10. 증서관리 ---------- */
  certificate: { label:'증서번호발급', fields:[
    F.trainee(), F.course(),
    {k:'kind', l:'증서 종류', t:'select', o:['수료증','이수증','모범상','개근상','성적우수상'], req:true, list:true, badge:true},
    {k:'number', l:'증서번호', t:'text', list:true, auto:'certNo', ro:true, hint:'저장 시 자동 발급'},
    F.date('date','발급일'), F.staff('issuer','발급자'), F.memo(),
  ]},

  /* ---------- 11. 사후관리 ---------- */
  daily_job_report: { label:'일일 취업 보고', fields:[
    F.date(), F.course(), {k:'count', l:'취업자 수', t:'number', list:true},
    {k:'companies', l:'취업처', t:'text', list:true}, F.memo(),
  ]},
  employment: { label:'취업 현황 보고', fields:[
    F.trainee(), {k:'company', l:'취업처', t:'text', req:true, list:true},
    F.date('date','취업일'), {k:'job', l:'직무', t:'text', list:true},
    {k:'type', l:'고용형태', t:'select', o:['정규직','계약직','인턴','프리랜서','창업'], list:true},
    {k:'insured', l:'고용보험 가입', t:'bool'},
    {k:'related', l:'훈련 관련 취업', t:'bool', def:true},
    F.memo(),
  ]},
  aftercare: { label:'사후관리', fields:[
    F.trainee(), F.date(),
    {k:'kind', l:'유형', t:'select', o:['취업지원','근속확인','취업상담','기타'], list:true},
    {k:'content', l:'내용', t:'textarea', req:true},
    {k:'next', l:'다음 관리일', t:'date', list:true}, F.staff('manager','담당자'),
  ]},
  job_confirm: { label:'취업 확인서 관리', fields:[
    F.trainee(), {k:'company', l:'취업처', t:'text', list:true},
    {k:'kind', l:'확인서 종류', t:'select', o:['재직증명서','고용보험 가입확인서','사업자등록증','근로계약서'], list:true},
    F.date('date','수령일'), F.file(),
  ]},

  /* ---------- 13. 인증평가자료함 ---------- */
  cert_folder: { label:'자료함 폴더', fields:[
    {k:'name', l:'폴더명', t:'text', req:true, list:true},
    {k:'parent', l:'상위 폴더', t:'ref', r:'cert_folder'},
    {k:'order', l:'순서', t:'number', def:1, list:true},
  ]},
  cert_doc: { label:'인증평가 자료', fields:[
    {k:'folder', l:'폴더', t:'ref', r:'cert_folder', req:true, list:true},
    {k:'index', l:'평가지표 번호', t:'text', list:true, hint:'예: 1-2-3'},
    {k:'title', l:'제목', t:'text', req:true, list:true},
    {k:'desc', l:'설명', t:'textarea'}, F.file(), F.date('date','등록일'),
  ]},

  /* ---------- 14. 커뮤니티 ---------- */
  notice: { label:'기관내 공지사항', fields:[
    {k:'title', l:'제목', t:'text', req:true, list:true},
    {k:'target', l:'대상', t:'select', o:['전체','교직원','교강사'], list:true},
    {k:'important', l:'중요', t:'bool'},
    {k:'content', l:'내용', t:'textarea'}, F.staff('writer','작성자',{list:true}), F.date('date','작성일'), F.file(),
  ]},
  schedule: { label:'일정', fields:[
    {k:'title', l:'제목', t:'text', req:true, list:true}, F.date(),
    {k:'time', l:'시간', t:'time'},
    {k:'kind', l:'구분', t:'select', o:['기관','과정','평가','행사','기타'], list:true},
    {k:'content', l:'내용', t:'textarea'},
  ]},

  /* ---------- 15. 기타관리 ---------- */
  staff: { label:'교직원 현황 및 등록', fields:[
    {k:'name', l:'이름', t:'text', req:true, list:true},
    {k:'kind', l:'구분', t:'select', o:['교직원','교강사'], list:true},
    {k:'position', l:'직위', t:'text', list:true},
    {k:'phone', l:'연락처', t:'text', list:true}, {k:'email', l:'이메일', t:'text'},
    {k:'joined', l:'입사일', t:'date'}, {k:'license', l:'자격/전공', t:'text'},
    {k:'status', l:'상태', t:'select', o:['재직','휴직','퇴직'], list:true, badge:true, def:'재직'},
  ]},
  staff_award: { label:'우수교직원 선발', fields:[
    {k:'period', l:'선발기간', t:'text', req:true, list:true, hint:'예: 2026년 상반기'},
    F.staff('staff','교직원',{req:true, list:true}),
    {k:'score', l:'평가점수', t:'number', list:true},
    {k:'reason', l:'선발사유', t:'textarea'},
    {k:'result', l:'결과', t:'select', o:['후보','선발','미선발'], list:true, badge:true},
  ]},
  meeting: { label:'회의록', fields:[
    F.date('date','일시'), {k:'title', l:'회의명', t:'text', req:true, list:true},
    {k:'attendees', l:'참석자', t:'text', list:true},
    {k:'agenda', l:'안건', t:'textarea'}, {k:'decision', l:'결정사항', t:'textarea'}, F.file(),
  ]},
  form_library: { label:'서식자료실', fields:[
    {k:'title', l:'제목', t:'text', req:true, list:true},
    {k:'category', l:'분류', t:'select', o:['행정','훈련','평가','취업','기타'], list:true},
    {k:'desc', l:'설명', t:'text'}, F.file(), F.date('date','등록일'),
  ]},
  asset: { label:'교재/시설/장비 현황', fields:[
    {k:'kind', l:'구분', t:'select', o:['교재','시설','장비'], req:true, list:true},
    {k:'name', l:'명칭', t:'text', req:true, list:true},
    {k:'qty', l:'수량', t:'number', list:true}, {k:'acquired', l:'취득일', t:'date'},
    {k:'location', l:'위치', t:'text', list:true},
    {k:'status', l:'상태', t:'select', o:['정상','수리중','폐기'], list:true, badge:true, def:'정상'}, F.memo(),
  ]},
  user: { label:'사용자 계정', fields:[
    {k:'id', l:'아이디', t:'text', req:true, list:true},
    {k:'pw', l:'비밀번호', t:'text', req:true},
    {k:'name', l:'이름', t:'text', req:true, list:true},
    {k:'role', l:'권한', t:'select', o:['관리자','교직원','교강사'], list:true, badge:true, def:'교직원'},
  ]},
};

/* 메뉴 구조 — 아토소프트 LMS 16개 대분류를 그대로 따릅니다. */
LMS.menus = [
  {n:1, label:'상담 및 접수', icon:'📞', items:[
    {key:'interview_eval'}, {key:'admission_consult'}, {key:'daily_recruit'},
    {view:'enrollment', label:'교육생 등록현황'}, {key:'trainee_file'},
  ]},
  {n:2, label:'과정등록', icon:'📚', items:[ {key:'course'}, {key:'guide_material'}, {key:'timetable'} ]},
  {n:3, label:'학적부', icon:'🗂️', items:[
    {key:'trainee'}, {key:'trainee_counsel'}, {key:'trainee_doc'}, {key:'counsel_report'},
    {view:'interview_result', label:'면접평가 결과표'}, {key:'grievance'}, {key:'course_board'},
  ]},
  {n:4, label:'상담관리', icon:'💬', items:[
    {view:'counsel_by_course', label:'과정별 상담관리'}, {view:'counsel_by_date', label:'일자별 상담관리'}, {view:'counsel_by_trainee', label:'훈련생별 상담관리'},
  ]},
  {n:5, label:'훈련일지', icon:'📝', items:[ {key:'training_log'}, {key:'makeup_log'} ]},
  {n:6, label:'사전평가', icon:'🧪', items:[
    {key:'pre_eval_info'}, {key:'pre_eval'}, {view:'pre_eval_analysis', label:'분석표/최종분석결과'},
    {key:'pre_eval_meeting'}, {key:'pre_eval_sheet'}, {key:'exam_file'},
  ]},
  {n:7, label:'수행평가', icon:'✅', items:[ {key:'self_eval'}, {key:'self_diag_setting'}, {key:'perf_eval'} ]},
  {n:8, label:'평가관리(능력단위)', icon:'📊', items:[
    {key:'subject_eval_setting'}, {key:'grade'},
    {view:'grade_report', label:'훈련생 종합/개별 성적표'}, {view:'unit_analysis', label:'능력단위별 분석표'},
    {view:'deviation', label:'편차비교표/요소별 분석표'}, {key:'eval_analysis'}, {key:'exam_file', label:'시험지 파일업로드'},
  ]},
  {n:9, label:'설문관리', icon:'🗳️', items:[
    {key:'survey'}, {view:'survey_analysis', label:'설문지 결과분석(자동)'}, {key:'survey_response'}, {key:'survey_feedback'},
  ]},
  {n:10, label:'증서관리', icon:'🏅', items:[
    {key:'certificate'}, {view:'cert_print', label:'증서 출력'}, {view:'cert_ledger', label:'증서 발급대장(자동생성)'},
  ]},
  {n:11, label:'사후관리', icon:'💼', items:[
    {key:'daily_job_report'}, {key:'employment'}, {key:'aftercare'}, {view:'aftercare_status', label:'사후관리 현황표'}, {key:'job_confirm'},
  ]},
  {n:12, label:'통합관리', icon:'🏠', items:[ {view:'dashboard', label:'통합 현황판'} ]},
  {n:13, label:'인증평가자료함', icon:'📁', items:[
    {view:'cert_viewer', label:'자료함 (심사위원 Viewer)'}, {key:'cert_folder'}, {key:'cert_doc'},
  ]},
  {n:14, label:'커뮤니티', icon:'📣', items:[ {key:'notice'}, {view:'calendar', label:'스케줄러(달력)'}, {key:'schedule', label:'일정 등록'} ]},
  {n:15, label:'기타관리', icon:'⚙️', items:[
    {key:'staff_award'}, {key:'staff'}, {key:'meeting'}, {key:'form_library'}, {key:'asset'},
    {view:'settings', label:'기관 설정'}, {key:'user'},
  ]},
  {n:16, label:'로그현황', icon:'📈', items:[ {view:'stats', label:'지역별/성별/연령별/지원경로별'} ]},
];

LMS.SIDO = SIDO; LMS.CHANNEL = CHANNEL;
