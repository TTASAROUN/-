/* seed.js — 처음 실행 시 들어가는 예시 데이터. 기관 설정에서 한 번에 지울 수 있습니다. */
window.LMS = window.LMS || {};
LMS.makeSeed = function () {
  const today = new Date();
  const d = (offset) => { const x = new Date(today); x.setDate(x.getDate() + offset); return x.toISOString().slice(0, 10); };
  const id = (p, i) => `${p}${i}`;
  const S = {};
  S.settings = [{ id: 'main', name: '따사로운 평생교육원', code: 'TS', ceo: '', ceoTitle: '원장', address: '경기도 김포시', phone: '', email: '', hours: '평일 09:00 ~ 18:00', slogan: '배움에서 취업까지 따사로운 평생교육원이 함께합니다', demo: true, orgs: [] }];
  S.user = [
    { id: 'admin', pw: '1234', name: '관리자', role: '관리자' },
    { id: 'teacher', pw: '1234', name: '이교사', role: '교강사' },
  ];
  S.staff = [
    { id: 'st1', name: '원장(이름 입력)', kind: '교직원', position: '원장', joined: '2018-03-02', status: '재직' },
    { id: 'st2', name: '이교사', kind: '교강사', position: '전임강사', phone: '010-0000-0002', joined: '2021-09-01', license: '산모신생아건강관리사 교육강사', status: '재직' },
    { id: 'st3', name: '최상담', kind: '교직원', position: '행정/상담', phone: '010-0000-0003', joined: '2022-01-10', status: '재직' },
    { id: 'st4', name: '정강사', kind: '교강사', position: '외래강사', phone: '010-0000-0004', joined: '2024-04-01', license: '정리수납전문가 1급', status: '재직' },
  ];
  S.course = [
    { id: 'c1', name: '가사관리사 기본교육 1기', ncs: '가사서비스 종합지원센터 기본교육', start: d(-40), end: d(20), hours: 40, capacity: 20, teacher: 'st2', room: '교육장 A', status: '진행중', deadline: d(-45), intro: '가사관리사(홈케어매니저) 기본교육. 청소·주방위생·세탁·정리수납·고객응대까지.', public: true },
    { id: 'c2', name: '산모신생아건강관리사 양성과정 12기', ncs: '산모·신생아 건강관리 지원사업 종사자 양성', start: d(20), end: d(80), hours: 60, capacity: 15, teacher: 'st2', room: '교육장 A', status: '모집중', deadline: d(15), intro: '산모·신생아 돌봄 이론과 실습, 수료 후 통합서비스 취업 연계.', public: true },
    { id: 'c3', name: '정리수납전문가 과정 3기', ncs: '정리수납 전문가 양성', start: d(-200), end: d(-20), hours: 40, capacity: 15, teacher: 'st4', room: '교육장 B', status: '종료', deadline: d(-210), intro: '정리수납 이론과 현장 실습.', public: false },
  ];
  const names = ['김민준', '이서연', '박지호', '최수아', '정예준', '강하윤', '조도윤', '윤지우', '장서준', '임하은', '한시우', '오유진', '서지민', '신은우', '권나연', '황준서'];
  const regions = ['서울', '경기', '인천', '서울', '경기', '서울', '충남', '경기', '서울', '강원', '서울', '경기', '인천', '서울', '경기', '서울'];
  const channels = ['홈페이지', 'HRD-Net', '지인소개', '홈페이지', '고용센터', 'HRD-Net', '블로그/SNS', '홈페이지', '전화문의', 'HRD-Net', '홈페이지', '지인소개', 'HRD-Net', '홈페이지', '고용센터', '홈페이지'];
  S.trainee = names.map((n, i) => ({
    id: id('t', i + 1), name: n, birth: `${1985 + (i * 3) % 20}-0${1 + i % 9}-1${i % 9}`, gender: i % 3 === 0 ? '남' : '여',
    phone: `010-2${i}00-1${i}${i}0`, region: regions[i], edu: ['고졸', '대졸', '전문대졸'][i % 3],
    course: i < 10 ? 'c1' : 'c3', enrollDate: i < 10 ? d(-42) : d(-202),
    status: i < 10 ? '재학' : (i % 2 ? '취업' : '수료'), channel: channels[i], address: `${regions[i]} 어딘가 ${i + 1}길`,
  }));
  S.admission_consult = [
    { id: 'ac1', name: '문의자A', phone: '010-9000-0001', gender: '여', region: '서울', channel: '홈페이지', course: 'c2', date: d(0), content: '수강료 지원 여부와 취업률 문의', status: '상담중', counselor: 'st3' },
    { id: 'ac2', name: '문의자B', phone: '010-9000-0002', gender: '남', region: '경기', channel: 'HRD-Net', course: 'c2', date: d(-1), content: '내일배움카드 사용 가능 여부', status: '접수', counselor: 'st3' },
    { id: 'ac3', name: '문의자C', phone: '010-9000-0003', gender: '여', region: '인천', channel: '지인소개', course: 'c2', date: d(-3), content: '야간반 여부', status: '취소', counselor: 'st3' },
  ];
  S.interview_eval = [
    { id: 'ie1', name: '문의자B', course: 'c2', date: d(-1), s1: 22, s2: 20, s3: 23, s4: 18, result: '합격', interviewer: 'st1' },
    { id: 'ie2', name: '지원자D', course: 'c2', date: d(-1), s1: 15, s2: 12, s3: 18, s4: 10, result: '보류', interviewer: 'st1' },
  ];
  S.daily_recruit = [0, 1, 2, 3, 4].map(i => ({ id: id('dr', i), date: d(-i), course: 'c2', inquiry: 3 + i, consult: 2, apply: i % 2, enroll: i % 3 === 0 ? 1 : 0 }));
  S.timetable = [];
  for (let day = -3; day <= 3; day++) {
    const dt = new Date(today); dt.setDate(dt.getDate() + day);
    if (dt.getDay() === 0 || dt.getDay() === 6) continue;
    [['09:00', '12:00', 1, '청소의 원리와 서비스 방법'], ['13:00', '17:00', 2, '주방 위생 관리']].forEach(([s, e, p, sub]) =>
      S.timetable.push({ id: `tt${day + 3}_${p}`, course: 'c1', date: d(day), period: p, start: s, end: e, subject: sub, teacher: 'st2', room: '1강의실' }));
  }
  S.training_log = S.timetable.filter(t => t.date < d(0)).map(t => ({
    id: 'tl_' + t.id, course: 'c1', date: t.date, period: t.period, subject: t.subject, teacher: 'st2',
    content: `${t.subject} 실습 진행`, present: 9, absent: 1, late: 0, approval: t.date < d(-1) ? '승인' : '작성', approver: 'st1',
  }));
  S.trainee_counsel = [
    { id: 'tc1', trainee: 't1', course: 'c1', date: d(-2), kind: '학습', content: '과제 진도 어려움 호소', action: '보충 자료 제공, 멘토링 연결', counselor: 'st2' },
    { id: 'tc2', trainee: 't2', course: 'c1', date: d(-5), kind: '진로', content: '프론트엔드 vs 백엔드 진로 고민', action: '포트폴리오 방향 상담', counselor: 'st2' },
    { id: 'tc3', trainee: 't3', course: 'c1', date: d(-35), kind: '생활', content: '통학 거리 문제', action: '출석 시간 조정 안내', counselor: 'st3' },
    { id: 'tc4', trainee: 't1', course: 'c1', date: d(-20), kind: '취업', content: '희망 기업 상담', action: '채용공고 3건 안내', counselor: 'st3' },
  ];
  S.grievance = [{ id: 'g1', trainee: 't4', date: d(-4), kind: '건의', content: '강의실 냉방 개선 요청', status: '접수' }];
  S.subject_eval_setting = [
    { id: 'ses1', course: 'c1', unit: '청소의 원리와 서비스 방법', method: '실습평가', w1: 40, w2: 50, w3: 10, pass: 60, date: d(-10) },
    { id: 'ses2', course: 'c1', unit: '세탁 및 의류 관리', method: '필기+실습', w1: 40, w2: 50, w3: 10, pass: 60, date: d(5) },
  ];
  S.grade = [];
  for (let i = 1; i <= 10; i++) S.grade.push({ id: 'gr' + i, trainee: 't' + i, course: 'c1', setting: 'ses1', s1: 25 + (i * 7) % 15, s2: 30 + (i * 11) % 20, s3: 6 + i % 5 });
  S.pre_eval_info = [{ id: 'pe1', course: 'c1', name: '가사관리사 1기 사전평가', date: d(-38), method: '필기+실기', areas: '이론/실기/태도', maxScore: 100 }];
  S.pre_eval = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({ id: 'pev' + i, evalInfo: 'pe1', trainee: 't' + i, a1: 15 + (i * 5) % 20, a2: 20 + (i * 3) % 25, a3: 10 + i % 10 }));
  S.self_diag_setting = [{ id: 'sd1', course: 'c1', unit: '청소의 원리와 서비스 방법', items: ['청소 도구를 용도에 맞게 고를 수 있다', '방/거실 청소 순서를 설명할 수 있다', '욕실 청소 시 위생 수칙을 지킬 수 있다', '고객 응대 기본 화법을 사용할 수 있다'] }];
  S.self_eval = [{ id: 'se1', trainee: 't1', course: 'c1', setting: 'sd1', date: d(-12), answers: { 0: 4, 1: 4, 2: 3, 3: 3 }, reflect: '욕실 청소 실습 더 필요' }];
  S.perf_eval = [{ id: 'pf1', trainee: 't1', course: 'c1', unit: '청소의 원리와 서비스 방법', criteria: ['요구에 맞게 청소 계획을 세울 수 있다', '위생 수칙을 지키며 작업할 수 있다', '작업 후 점검표를 작성할 수 있다'], achieve: { 0: '달성', 1: '달성', 2: '보완필요' }, comment: '전반적으로 우수, 검증 절차 보완', evaluator: 'st2', date: d(-9) }];
  S.survey = [{
    id: 'sv1', title: '가사관리사 1기 중간 만족도 조사', course: 'c1', target: '훈련생', start: d(-7), end: d(2), status: '진행중',
    questions: [
      { type: '객관', text: '강의 내용이 이해하기 쉬웠다' },
      { type: '객관', text: '교강사의 지도가 충분했다' },
      { type: '선다', text: '가장 도움이 된 수업 방식은?', options: ['이론 강의', '실습', '프로젝트', '멘토링'] },
      { type: '주관', text: '개선이 필요한 점을 자유롭게 적어주세요' },
    ],
  }];
  S.survey_response = [1, 2, 3, 4, 5, 6].map(i => ({ id: 'sr' + i, survey: 'sv1', respondent: names[i - 1], date: d(-i % 4), answers: { 0: 3 + i % 3, 1: 4 + i % 2, 2: ['실습', '프로젝트', '실습', '멘토링', '실습', '이론 강의'][i - 1], 3: ['실습 시간이 더 있으면 좋겠어요', '프로젝트 피드백을 더 자주', '', '진도가 조금 빠릅니다', '만족합니다', '과제 양 조절'][i - 1] } }));
  S.certificate = [11, 12, 13].map((i, k) => ({ id: 'cf' + k, trainee: 't' + i, course: 'c3', kind: '수료증', number: `TS-${today.getFullYear()}-00${k + 1}`, date: d(-19), issuer: 'st1' }));
  S.employment = [
    { id: 'em1', trainee: 't12', company: '따사로운 통합서비스', date: d(-10), job: '가사관리사', type: '정규직', insured: true, related: true },
    { id: 'em2', trainee: 't14', company: '행복산후조리원', date: d(-6), job: '산후관리사', type: '계약직', insured: true, related: true },
    { id: 'em3', trainee: 't16', company: '(주)클린홈', date: d(-2), job: '정리수납 전문가', type: '정규직', insured: false, related: true },
  ];
  S.daily_job_report = [{ id: 'dj1', date: d(-2), course: 'c3', count: 1, companies: '(주)클린홈' }];
  S.aftercare = [{ id: 'af1', trainee: 't12', date: d(-3), kind: '근속확인', content: '재직 중, 업무 적응 양호', next: d(27), manager: 'st3' }];
  S.job_confirm = [{ id: 'jc1', trainee: 't12', company: '따사로운 통합서비스', kind: '고용보험 가입확인서', date: d(-5) }];
  S.cert_folder = [
    { id: 'cfd1', name: '1. 기관 운영 (학칙·운영규정)', order: 1 }, { id: 'cfd2', name: '2. 교육과정 운영', order: 2 }, { id: 'cfd3', name: '3. 수강생 관리', order: 3 }, { id: 'cfd4', name: '4. 수료·자격 발급', order: 4 },
    { id: 'cfd21', name: '2-1. 훈련일지·출석부', parent: 'cfd2', order: 1 }, { id: 'cfd22', name: '2-2. 평가 자료', parent: 'cfd2', order: 2 },
  ];
  S.cert_doc = [
    { id: 'cd1', folder: 'cfd1', index: '1-1', title: '평생교육원 운영규정', desc: '내부 운영 규정 전문', date: d(-30) },
    { id: 'cd2', folder: 'cfd21', index: '2-1-1', title: '가사관리사 1기 훈련일지 묶음', desc: '결재 완료본', date: d(-8) },
    { id: 'cd3', folder: 'cfd22', index: '2-2-1', title: '능력단위 평가 결과 분석', date: d(-8) },
    { id: 'cd4', folder: 'cfd3', index: '3-1', title: '수강생 상담 실적', date: d(-8) },
  ];
  S.notice = [
    { id: 'n1', title: '이번 주 금요일 전체 교직원 회의', target: '전체', important: true, content: '오후 4시 회의실. 인증평가 준비 안건.', writer: 'st1', date: d(-1) },
    { id: 'n2', title: '훈련일지 결재 마감 안내', target: '교강사', content: '매주 금요일까지 해당 주 훈련일지 결재 요청 바랍니다.', writer: 'st3', date: d(-3) },
  ];
  S.schedule = [
    { id: 'sc1', title: '가사관리사 1기 능력단위 평가', date: d(5), time: '10:00', kind: '평가', content: '세탁 및 의류 관리' },
    { id: 'sc2', title: '산모신생아 12기 모집 마감', date: d(15), kind: '과정' },
    { id: 'sc3', title: '전체 교직원 회의', date: d(1), time: '16:00', kind: '기관' },
    { id: 'sc4', title: '산모신생아 12기 개강', date: d(20), time: '09:00', kind: '과정' },
  ];
  S.meeting = [{ id: 'm1', date: d(-8), title: '인증평가 준비 회의', attendees: '원장, 이교사, 최상담', agenda: '자료함 구성, 지표별 담당자 배정', decision: '지표 1~2 원장, 3~4 최상담 담당' }];
  S.staff_award = [{ id: 'sa1', period: `${today.getFullYear()}년 상반기`, staff: 'st2', score: 92, reason: '취업률 및 훈련생 만족도 우수', result: '선발' }];
  S.form_library = [
    { id: 'fl1', title: '수강생 상담일지 양식', category: '훈련', desc: '수기 작성용', date: d(-100) },
    { id: 'fl2', title: '취업확인서 양식', category: '취업', date: d(-100) },
  ];
  S.asset = [
    { id: 'as1', kind: '장비', name: '실습용 청소 도구 세트', qty: 10, acquired: '2025-02-01', location: '교육장 A', status: '정상' },
    { id: 'as2', kind: '장비', name: '빔프로젝터', qty: 2, acquired: '2023-06-15', location: '교육장 A/B', status: '수리중' },
    { id: 'as3', kind: '교재', name: '가사관리사 기본교육 교재 (2026)', qty: 30, acquired: '2026-09-06', location: '교재 보관실', status: '정상' },
    { id: 'as4', kind: '시설', name: '교육장 A', qty: 1, location: '2층', status: '정상' },
  ];
  S.guide_material = [{ id: 'gm1', course: 'c1', kind: '평가계획', title: '가사관리사 1기 평가계획서', content: '능력단위별 평가 일정과 방법 안내', date: d(-40) }];
  S.exam_file = [{ id: 'ef1', course: 'c1', kind: '능력단위평가', title: '청소의 원리 실습평가 시험지', date: d(-10) }];
  S.eval_analysis = [{ id: 'ea1', course: 'c1', date: d(-7), title: '청소의 원리 평가결과 분석', attendees: '이교사, 박원장', analysis: '평균 78점, 실기 편차 큼', improve: '실기 보충 세션 2회 추가' }];
  S.pre_eval_meeting = [{ id: 'pm1', evalInfo: 'pe1', date: d(-37), attendees: '이교사, 박원장', discussion: '기초 수준 편차 확인', decision: '초반 2주 기초 보강 편성' }];
  S.counsel_report = [{ id: 'cr1', course: 'c1', period: '지난달', count: 12, summary: '학습 진도 관련 상담 다수', improve: '멘토링 확대', writer: 'st3', date: d(-3), approval: '검토' }];
  S.makeup_log = [{ id: 'mk1', course: 'c1', date: d(-6), trainee: 't5', reason: '병결 보강', content: '청소의 원리 3시간 보강', hours: 3, approval: '작성', approver: 'st1' }];
  S.counsel_request = [{ id: 'cq1', trainee: 't2', date: d(0), wish: d(2), kind: '취업', content: '수료 후 통합서비스 취업 절차가 궁금합니다', status: '접수' }];
  S.survey_feedback = []; S.trainee_file = []; S.trainee_doc = []; S.course_board = [{ id: 'cb1', course: 'c1', title: '이번 주 과제 안내', content: '주방 위생 점검표 작성 과제, 금요일까지', writer: 'st2', date: d(-2) }];
  S.pre_eval_sheet = [{ id: 'ps1', evalInfo: 'pe1', title: '사전평가 문항지', questions: ['가사관리사의 정의를 쓰시오', '청소의 기본 원리 3가지를 쓰시오', '세탁 표시 기호 3가지를 설명하시오'] }];
  return S;
};
