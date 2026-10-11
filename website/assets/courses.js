// 평생교육원 과정 데이터 — 이 파일만 고치면 평생교육원 페이지의 '프로그램'과 '과정 상세'가 바뀝니다.
// sample:true 는 임시 예시라는 표시입니다. 내용을 확정하면 sample 줄을 지우세요.
// card: '내일배움카드' 적용 여부 → 'both'(카드/자비 모두) | 'self'(자비만)
window.COURSES=[
 {id:'maternity',name:'산모신생아 건강관리사 양성과정',summary:'산모의 산후 회복과 신생아 돌봄을 전문적으로 배우는 대표 과정',target:'산모·신생아 돌봄 업무를 시작하려는 분',card:'both',
  hours:'60시간',hoursDetail:'이론 24 + 실습 36',place:'따사로운 평생교육원 (주소 입력)',fee:'(확정 후 입력)',self:'과정별 상이 · 고용24에서 확인',
  completion:'출석 80% 이상 · 평가 통과',after:'수료증 발급 · 따사로운 통합서비스 취업 연계',
  schedule:[{round:'11기',period:'2026-11-03 ~ 2026-11-27',days:'월~금',time:'09:30~13:30',seats:20,status:'모집중'},{round:'12기',period:'2026-12-08 ~ 2027-01-08',days:'월~금',time:'14:00~18:00',seats:20,status:'모집예정'}],sample:true},
 {id:'infant',name:'영유아 관리사 양성과정',summary:'영유아 발달 단계별 돌봄, 안전, 놀이와 위생 관리',target:'영유아 돌봄 업무를 하려는 분',card:'both',
  hours:'40시간',hoursDetail:'이론 16 + 실습 24',place:'따사로운 평생교육원 (주소 입력)',fee:'(확정 후 입력)',self:'과정별 상이 · 고용24에서 확인',
  completion:'출석 80% 이상 · 평가 통과',after:'수료증 발급 · 취업 연계',
  schedule:[{round:'7기',period:'2026-11-10 ~ 2026-11-27',days:'화·목',time:'10:00~16:00',seats:15,status:'모집중'}],sample:true},
 {id:'home',name:'가사관리 · 정리수납 실무과정',summary:'청소, 세탁, 주방 관리부터 공간별 정리수납 노하우까지',target:'가사관리·정리수납 업무를 하려는 분',card:'self',
  hours:'24시간',hoursDetail:'이론 6 + 실습 18',place:'따사로운 평생교육원 (주소 입력)',fee:'(확정 후 입력)',self:'자비 수강',
  completion:'출석 80% 이상',after:'수료증 발급 · 취업 연계',
  schedule:[{round:'5기',period:'2026-11-17 ~ 2026-12-03',days:'화·목',time:'10:00~16:00',seats:15,status:'모집중'}],sample:true},
 {id:'baby-food',name:'이유식 전문가 과정',summary:'월령별 이유식 식단과 알레르기, 위생 관리',target:'이유식 조리·지도를 하려는 분',card:'self',
  hours:'16시간',hoursDetail:'이론 4 + 실습 12',place:'따사로운 평생교육원 (주소 입력)',fee:'(확정 후 입력)',self:'자비 수강',
  completion:'출석 80% 이상',after:'수료증 발급',
  schedule:[{round:'3기',period:'2026-12-01 ~ 2026-12-12',days:'토',time:'10:00~16:00',seats:12,status:'모집예정'}],sample:true},
 {id:'refresh',name:'보수교육 (현직 관리사)',summary:'현직 관리사를 위한 보수·재교육 (안전, 응급처치, 서비스 응대)',target:'현재 활동 중인 관리사',card:'self',
  hours:'8시간',hoursDetail:'이론+실습',place:'따사로운 평생교육원 (주소 입력)',fee:'(확정 후 입력)',self:'자비 수강',
  completion:'전 과정 참석',after:'보수교육 이수증 발급',
  schedule:[{round:'2026-4분기',period:'2026-12-13',days:'일',time:'10:00~18:00',seats:30,status:'모집예정'}],sample:true}
];
