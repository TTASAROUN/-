// 따사로운 — 접수 폼 → 구글 시트 저장 + 이메일 알림 + 성장노트 공개 목록
const OWNER_EMAIL = '';  // 알림 받을 이메일 (비워두면 알림 없음)
const TAIL = ['상태', '공개승인(Y)', '처리결과', '개선내용']; // 시트에서 직접 관리하는 열
const TAIL_LETTER = ['상태', '전달 예정일', '전달 메모']; // 영상편지 탭 전용 열

function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e){
  try{
    const d = JSON.parse(e.postData.contents);
    if (d.form === 'letter' && d.files && d.files.length) { d.values['영상 파일'] = saveLetter_(d); d.files = null; }
    if (d.files && d.files.length) { // 사진은 드라이브에 저장하고 링크를 시트에 기록
      const r = saveFiles_(d);
      d.values['사진 첨부'] = r.urls;
      if (isPublicPhoto_(d.form)) { d.labels = d.labels.concat(['사진ID']); d.values['사진ID'] = r.ids; }
    } else if (isPublicPhoto_(d.form)) { d.labels = d.labels.concat(['사진ID']); d.values['사진ID'] = ''; }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(d.form) || ss.insertSheet(d.form);
    const tail = d.form === 'letter' ? TAIL_LETTER : TAIL;
    const head = ['접수일시'].concat(d.labels, ['언어'], tail);
    if (sh.getLastRow() === 0) { sh.appendRow(head); sh.setFrozenRows(1); }
    const row = [new Date()].concat(d.labels.map(l => String(d.values[l] || '').slice(0, 2000)), [d.lang || 'ko'], d.form === 'letter' ? ['접수', (d.values['전달 희망일'] || ''), ''] : ['접수', '', '', '']);
    sh.appendRow(row);
    if (OWNER_EMAIL) MailApp.sendEmail(OWNER_EMAIL, '[따사로운] 새 접수: ' + d.title,
      d.labels.map(l => l + ': ' + (d.values[l] || '')).join('\n') + '\n\n시트에서 확인하세요: ' + ss.getUrl());
    return out({ ok: true });
  }catch(err){ return out({ ok: false, error: String(err) }); }
}

// 성장노트: '공개승인(Y)' 열에 Y가 입력된 건만 사이트에 공개
function doGet(e){
  const p = e.parameter || {};
  if (p.list === 'match') return matchList_(p);
  if (p.list === 'share') return shareList_();
  if (p.list === 'community') return communityList_();
  if (p.list !== 'growth') return out({ ok: true });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('growth');
  if (!sh || sh.getLastRow() < 2) return out({ ok: true, items: [] });
  const v = sh.getDataRange().getValues(), h = v[0];
  const items = v.slice(1).filter(r => r[h.indexOf('공개승인(Y)')] === 'Y').reverse().slice(0, 30).map(r => {
    const o = {}; ['구분','서비스','내용','표시 이름(선택)','처리결과','개선내용'].forEach(k => o[k.replace('(선택)','')] = r[h.indexOf(k)] || '');
    return o;
  });
  return out({ ok: true, items: items });
}

// 번개매칭: '관리사' 탭에서 조건에 맞는 관리사님만 골라 공개 가능한 정보(마스킹된 이름·경력·성향 등)만 반환
// 전화번호·주소·생년월일·서류 정보는 절대 반환하지 않음 (Match.gs의 match 함수가 필터링)
function matchList_(p){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('관리사');
  if (!sh || sh.getLastRow() < 2) return out({ ok: true, items: [] });
  const v = sh.getDataRange().getValues(), h = v[0].map(String);
  const rows = v.slice(1).filter(r => r[0]).map(r => { const o = {}; h.forEach((k, i) => o[k] = r[i]); return o; });
  const q = { service: (p.service || '').split(',').filter(Boolean), region: p.region, start: p.start, end: p.end,
              traits: (p.traits || '').split(',').filter(Boolean), extras: (p.extras || '').split(',').filter(Boolean),
              ages: (p.ages || '').split(',').filter(Boolean),
              religions: (p.religions || '').split(',').filter(Boolean), virtues: (p.virtues || '').split(',').filter(Boolean), needHoliday: p.needHoliday || '', mbti: p.mbti || '', minYears: p.minYears || '' };
  return out({ ok: true, items: MatchCore.match(rows, q) });
}

// 첨부 사진: 드라이브 '따사로운 접수 첨부' 폴더에 저장 (직원만 열람, 외부 공개 안 함)
function saveFiles_(d){
  const folder = getFolder_(), urls = [], ids = [];
  d.files.slice(0, 5).forEach((f, i) => {
    if (!/^image\//.test(f.type) || String(f.data).length > 8e6) return;
    const name = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMdd-HHmmss') + '_' + d.form + '_' + (i + 1) + '.jpg';
    const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), 'image/jpeg', name));
    // 무료나눔 물품 사진만 링크로 볼 수 있게 공유(공개 승인 시 사이트에 표시). 그 외 사진은 직원 전용.
    if (isPublicPhoto_(d.form)) file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    urls.push(file.getUrl()); ids.push(file.getId());
  });
  return { urls: urls.join('\n'), ids: ids.join(',') };
}
function getFolder_(){
  const it = DriveApp.getFoldersByName('따사로운 접수 첨부');
  return it.hasNext() ? it.next() : DriveApp.createFolder('따사로운 접수 첨부');
}

// 무료나눔: 'share' 탭에서 '공개승인(Y)'인 물품만 공개 (이름·연락처는 내려보내지 않음)
// '상태' 열은 접수 → 나눔중 / 예약중 / 나눔완료 로 직원이 직접 수정
function shareList_(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('share');
  if (!sh || sh.getLastRow() < 2) return out({ ok: true, items: [] });
  const v = sh.getDataRange().getValues(), h = v[0].map(String), g = k => h.indexOf(k);
  const items = v.slice(1).filter(r => r[g('공개승인(Y)')] === 'Y').reverse().slice(0, 40).map(r => {
    const id = String(r[g('사진ID')] || '').split(',')[0];
    const st = String(r[g('상태')] || '');
    return { title: r[g('물품명')], cat: r[g('분류')], cond: r[g('물품 상태')], area: r[g('동네')], desc: r[g('설명')],
             photo: id ? 'https://drive.google.com/thumbnail?id=' + id + '&sz=w480' : '',
             status: ['예약중', '나눔완료'].indexOf(st) > -1 ? st : '나눔중' };
  });
  return out({ ok: true, items: items });
}

// 공개 게시용 사진만 '링크가 있는 사람은 볼 수 있음'으로 공유 (무료나눔 'share', 커뮤니티 'post')
function isPublicPhoto_(form){ return form === 'share' || form === 'post'; }

// 커뮤니티: '공개승인(Y)'인 글·댓글만 내려보냄 (닉네임·내용·사진만, 연락처 등은 없음)
function communityList_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const day = d => d instanceof Date ? Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd') : String(d).slice(0, 10);
  const rowsOf = name => {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return [];
    const v = sh.getDataRange().getValues(), h = v[0].map(String);
    return v.slice(1).filter(r => r[h.indexOf('공개승인(Y)')] === 'Y').reverse().map(r => { const o = {}; h.forEach((k, i) => o[k] = r[i]); return o; });
  };
  const posts = rowsOf('post').slice(0, 100).map(r => { const id = String(r['사진ID'] || '').split(',')[0];
    return { id: r['글번호'], boardName: r['게시판'], title: r['제목'], nick: r['닉네임'], body: r['내용'], detail: r['상세'],
             photo: id ? 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800' : '', date: day(r['접수일시']) }; });
  const comments = rowsOf('comment').slice(0, 300).map(r => ({ pid: r['글번호'], nick: r['닉네임'], body: r['내용'], date: day(r['접수일시']) }));
  return out({ ok: true, posts: posts, comments: comments });
}

// ── 아기에게 영상편지 (완전 비공개) ──
// 영상은 '따사로운 영상편지(비공개)' 폴더에 저장하고 공유하지 않습니다. 직원 계정만 열 수 있습니다.
function saveLetter_(d){
  const f = d.files[0];
  if (!/^video\//.test(f.type) || String(f.data).length > 30e6) return '(영상이 너무 커서 저장하지 못했습니다 — 영상 링크로 받으세요)';
  const it = DriveApp.getFoldersByName('따사로운 영상편지(비공개)');
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder('따사로운 영상편지(비공개)');
  const ext = f.type.indexOf('mp4') > -1 ? 'mp4' : f.type.indexOf('quicktime') > -1 ? 'mov' : 'webm';
  const name = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMdd-HHmmss') + '_' + String(d.values['아기 태명'] || '').replace(/[^가-힣A-Za-z0-9]/g, '') + '.' + ext;
  return folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), f.type, name)).getUrl();
}

// 전달일 알림: Apps Script '트리거'에서 이 함수를 매일 1회 실행하도록 설정하세요.
// 'letter' 탭의 '전달 예정일'이 오늘이고 '상태'가 '전달완료'가 아니면, 직원(OWNER_EMAIL)에게 알려 줍니다.
// (부모님께 실제 전달은 직원이 연락해 진행 — 영상 열람 권한은 직원이 시트의 링크에서 부모님 이메일로 직접 공유)
function remindLetters(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('letter');
  if (!sh || sh.getLastRow() < 2 || !OWNER_EMAIL) return;
  const v = sh.getDataRange().getValues(), h = v[0].map(String), g = k => h.indexOf(k);
  const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  const due = v.slice(1).filter(r => {
    const d = r[g('전달 예정일')];
    const ds = d instanceof Date ? Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd') : String(d).slice(0, 10);
    return ds === today && r[g('상태')] !== '전달완료';
  });
  if (due.length) MailApp.sendEmail(OWNER_EMAIL, '[따사로운] 오늘 전달할 영상편지 ' + due.length + '건',
    due.map(r => r[g('산모 성함')] + ' / ' + r[g('연락처')] + ' / ' + r[g('영상 파일')]).join('\n'));
}
