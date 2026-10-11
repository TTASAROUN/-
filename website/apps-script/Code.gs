// 따사로운 — 접수 폼 → 구글 시트 저장 + 이메일 알림 + 성장노트 공개 목록
const OWNER_EMAIL = '';  // 알림 받을 이메일 (비워두면 알림 없음)
const TAIL = ['상태', '공개승인(Y)', '처리결과', '개선내용']; // 시트에서 직접 관리하는 열

function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e){
  try{
    const d = JSON.parse(e.postData.contents);
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
  if (!e.parameter || e.parameter.list !== 'growth') return out({ ok: true });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('growth');
  if (!sh || sh.getLastRow() < 2) return out({ ok: true, items: [] });
  const v = sh.getDataRange().getValues(), h = v[0];
  const items = v.slice(1).filter(r => r[h.indexOf('공개승인(Y)')] === 'Y').reverse().slice(0, 30).map(r => {
    const o = {}; ['구분','서비스','내용','표시 이름(선택)','처리결과','개선내용'].forEach(k => o[k.replace('(선택)','')] = r[h.indexOf(k)] || '');
    return o;
  });
  return out({ ok: true, items: items });
}
