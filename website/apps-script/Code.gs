// 따사로운 — 접수 폼 → 구글 시트 저장 + 이메일 알림 + 성장노트 공개 목록
const OWNER_EMAIL = '';  // 알림 받을 이메일 (비워두면 알림 없음)
const TAIL = ['상태', '공개승인(Y)', '처리결과', '개선내용']; // 시트에서 직접 관리하는 열

function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e){
  try{
    const d = JSON.parse(e.postData.contents);
    if (d.files && d.files.length) d.values['사진 첨부'] = saveFiles_(d); // 사진은 드라이브에 저장하고 링크를 시트에 기록
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(d.form) || ss.insertSheet(d.form);
    const head = ['접수일시'].concat(d.labels, ['언어'], TAIL);
    if (sh.getLastRow() === 0) { sh.appendRow(head); sh.setFrozenRows(1); }
    const row = [new Date()].concat(d.labels.map(l => String(d.values[l] || '').slice(0, 2000)), [d.lang || 'ko'], ['접수', '', '', '']);
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

// 번개매칭: '관리사' 탭에서 조건에 맞는 선생님만 골라 공개 가능한 정보(마스킹된 이름·경력·성향 등)만 반환
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
  const folder = getFolder_(), urls = [];
  d.files.slice(0, 3).forEach((f, i) => {
    if (!/^image\//.test(f.type) || String(f.data).length > 8e6) return;
    const name = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMdd-HHmmss') + '_' + d.form + '_' + (i + 1) + '.jpg';
    urls.push(folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), 'image/jpeg', name)).getUrl());
  });
  return urls.join('\n');
}
function getFolder_(){
  const it = DriveApp.getFoldersByName('따사로운 접수 첨부');
  return it.hasNext() ? it.next() : DriveApp.createFolder('따사로운 접수 첨부');
}
