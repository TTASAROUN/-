// 출산지원 지도 데이터 — 이 파일(또는 구글 시트의 '출산지원' 탭)만 고치면 지도 페이지 내용이 바뀝니다.
// ⚠ 금액·대상·신청방법은 해마다 바뀌므로, 아래 내용은 '참고용 초안'입니다. 확정 전에 공식 누리집으로 꼭 확인해 주세요.
// sample:true 는 확인 전 임시 내용이라는 표시입니다. 확인을 마치면 지우세요.
window.SUPPORT={
 asOf:'최종 확인일: (입력 필요)',
 portals:[
  {name:'복지로',url:'https://www.bokjiro.go.kr',desc:'지원 대상 확인과 온라인 신청'},
  {name:'정부24',url:'https://www.gov.kr',desc:'출생신고와 함께 신청'},
  {name:'아이사랑',url:'https://www.childcare.go.kr',desc:'보육·양육 지원 안내'}
 ],
 // 전국 공통 지원 (참고용 · 금액과 조건은 해마다 달라질 수 있어요)
 national:[
  {id:'meet',name:'첫만남이용권',amount:'출생아 1명당 200만 원 (둘째 이상은 더 많음)',target:'출생신고를 한 아기',how:'출생신고 후 복지로·정부24 또는 주민센터에서 신청. 국민행복카드 포인트로 지급돼요.',link:'https://www.bokjiro.go.kr',sample:true},
  {id:'parent',name:'부모급여',amount:'만 0세 월 100만 원 · 만 1세 월 50만 원',target:'만 0~1세 아기를 키우는 가정',how:'출생 후 60일 이내에 신청하면 출생한 달부터 받아요. 복지로·정부24·주민센터.',link:'https://www.bokjiro.go.kr',sample:true},
  {id:'child',name:'아동수당',amount:'만 8세 미만 월 10만 원',target:'만 8세 미만 아동 (소득과 관계없음)',how:'복지로·정부24·주민센터에서 신청해요.',link:'https://www.bokjiro.go.kr',sample:true},
  {id:'visit',name:'임신·출산 진료비 지원',amount:'임신 1회당 100만 원 (다태아는 태아당 더 많음)',target:'임신·출산한 건강보험 가입자',how:'국민행복카드를 발급받아 병원에서 사용해요. 신청은 국민건강보험공단.',link:'https://www.nhis.or.kr',sample:true},
  {id:'voucher',name:'산모·신생아 건강관리 지원 (산후도우미)',amount:'소득에 따라 정부 지원금과 본인부담금이 달라요 · 이용 기간은 출산 형태에 따라 달라요',target:'출산 가정 (소득 기준·지역별 기준이 있어요)',how:'출산 예정일 전후 정해진 기간에 주민센터·보건소 또는 복지로에서 신청하고, 제공기관을 선택해요. 따사로운 이용 상담도 도와드려요.',link:'https://www.bokjiro.go.kr',sample:true,ours:true},
  {id:'infertility',name:'난임부부 시술비 지원',amount:'시술 종류별로 횟수와 금액 한도가 있어요',target:'난임 진단을 받은 부부',how:'관할 보건소에서 신청해요.',link:'https://www.bokjiro.go.kr',sample:true}
 ],
 // 시·도 공식 누리집 (대표 주소)
 provSite:{'11':'https://www.seoul.go.kr','21':'https://www.busan.go.kr','22':'https://www.daegu.go.kr','23':'https://www.incheon.go.kr','24':'https://www.gwangju.go.kr','25':'https://www.daejeon.go.kr','26':'https://www.ulsan.go.kr','29':'https://www.sejong.go.kr','31':'https://www.gg.go.kr','32':'https://www.gwd.go.kr','33':'https://www.chungbuk.go.kr','34':'https://www.chungnam.go.kr','35':'https://www.jeonbuk.go.kr','36':'https://www.jeonnam.go.kr','37':'https://www.gb.go.kr','38':'https://www.gyeongnam.go.kr','39':'https://www.jeju.go.kr'},
 // 지역별 제도: 키는 시·도 코드(2자리) 또는 시·군·구 코드(5자리). programs 항목은 지역에서 따로 주는 지원입니다.
 local:{
  '11230':{checked:'(예시)',phone:'(담당 부서 전화 입력)',link:'',sample:true,programs:[
   {name:'(예시) 출산축하금',amount:'○○만 원',target:'(대상 입력)',how:'(신청 방법 입력)'},
   {name:'(예시) 산후조리비 지원',amount:'○○만 원',target:'(대상 입력)',how:'(신청 방법 입력)'}]}
 }
};
