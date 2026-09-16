/* ============================================================
   app.js — 업무 콘솔 화면 엔진
   modules.js의 정의를 읽어 목록/입력 화면을 자동으로 만들고,
   통계·성적표·증서·설문분석 같은 특수 화면은 아래 VIEWS에 있습니다.
   ============================================================ */
(() => {
const S = LMS.store, E = LMS.entities, $ = (s, el = document) => el.querySelector(s);
const L = (col) => S.listOrg(col);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const REF_LABEL = { trainee: 'name', course: 'name', staff: 'name', pre_eval_info: 'name', subject_eval_setting: 'unit', self_diag_setting: 'unit', survey: 'title', cert_folder: 'name' };
const refLabel = (col, id) => { const r = S.get(col, id); return r ? (r[REF_LABEL[col] || 'name'] || r.id) : (id ? '(삭제됨)' : ''); };
const GOOD = ['승인', '합격', '완료', '재직', '정상', '취업', '등록완료', '선발', '진행중', '달성', 'A', '상', '수료증', '이수증'];
const WARN = ['검토', '보류', '처리중', '수리중', '모집중', '접수', 'B', 'C', '중', '보완필요', '후보', '준비', '휴직', '수료', '상담중'];
const BAD = ['불합격', '취소', '중도탈락', '폐기', '미선발', '미달성', 'F', 'D', '하', '퇴직', '마감', '종료'];
const badge = (v) => v == null || v === '' ? '' : `<span class="badge ${GOOD.includes(v) ? 'good' : WARN.includes(v) ? 'warn' : BAD.includes(v) ? 'bad' : ''}">${esc(v)}</span>`;
const isAdmin = () => S.user && S.user.role === '관리자';
let toastT; const toast = (m, err) => { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); } t.className = 'toast' + (err ? ' err' : ''); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); };
const fmtVal = (f, r) => {
  let v = f.calc ? f.calc(r) : r[f.k];
  if (f.t === 'ref') return esc(refLabel(f.r, v));
  if (f.t === 'org') return `<span class="badge ${v ? 'info' : ''}">${esc(S.orgShort(v))}</span>`;
  if (f.t === 'bool') return v ? '예' : '';
  if (f.t === 'file') return v && v.url ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.name)}</a>` : '';
  if (f.t === 'lines') return esc((v || []).length + '항목');
  if (f.badge) return badge(v);
  if (f.t === 'number') return `<span class="mono">${esc(v ?? '')}</span>`;
  return esc(v ?? '');
};
const rawVal = (f, r) => { const v = f.calc ? f.calc(r) : r[f.k]; if (f.t === 'ref') return refLabel(f.r, v); if (f.t === 'org') return S.orgShort(v); if (f.t === 'bool') return v ? '예' : '아니오'; if (f.t === 'file') return v && v.name || ''; if (Array.isArray(v)) return v.join(' / '); if (v && typeof v === 'object') return JSON.stringify(v); return v ?? ''; };
const age = (birth) => { if (!birth) return null; const b = new Date(birth), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const sd = (arr) => { if (arr.length < 2) return 0; const m = avg(arr); return Math.sqrt(avg(arr.map(x => (x - m) ** 2))); };
const r1 = (n) => Math.round(n * 10) / 10;
const total = (f, r) => f.find(x => x.k === 'total').calc(r);

/* ---------------- 앱 뼈대 ---------------- */
const root = $('#app');
let state = { open: {} };

function renderLogin(msg) {
  root.innerHTML = `<div class="login"><form class="box" id="loginForm">
    <h1>${esc(S.settings().name)}</h1><div class="muted small">업무 콘솔 로그인</div>
    <div class="field"><label>아이디</label><input id="lid" type="text" autocomplete="username" value="admin"></div>
    <div class="field"><label>비밀번호</label><input id="lpw" type="password" autocomplete="current-password" value="1234"></div>
    ${msg ? `<div class="small" style="color:var(--bad);margin-top:8px">${esc(msg)}</div>` : ''}
    <button class="btn primary" type="submit">로그인</button>
    ${S.isEmpty() ? `<div class="small" style="margin-top:10px"><a href="#" id="restoreDemo">예시 데이터를 다시 넣고 시작하기</a></div>` : ''}
    <div class="small muted" style="margin-top:14px">초기 계정 admin / 1234 · 기타관리 &gt; 사용자 계정에서 바꾸세요.<br>${S.mode === 'api' ? '서버 연결됨 (여러 사람이 함께 사용)' : '서버 없이 이 브라우저에만 저장되는 체험 모드'}</div>
  </form></div>`;
  const rd = $('#restoreDemo'); if (rd) rd.onclick = async (e) => { e.preventDefault(); await S.restoreDemo(); toast('예시 데이터를 넣었습니다'); renderLogin(); };
  $('#loginForm').onsubmit = async (e) => { e.preventDefault(); try { await S.login($('#lid').value.trim(), $('#lpw').value); renderShell(); route(); } catch (err) { renderLogin(err.message); } };
}

function renderShell() {
  const org = S.settings();
  root.innerHTML = `<div class="app">
    <aside class="side" id="side">
      <div class="brand"><div class="sub">LMS 업무 콘솔</div><div class="org">${esc(org.name)}</div>${S.curOrg ? `<div class="small muted">${esc(S.orgName(S.curOrg))}</div>` : ''}</div>
      <nav class="nav" id="nav">${LMS.menus.map(m => `<div class="grp" data-n="${m.n}"><button type="button"><span class="num">${m.n}</span><span>${m.icon || ''} ${esc(m.label)}</span></button>
        <div class="items">${m.items.map(it => `<a href="#/${it.view ? 'view/' + it.view : 'entity/' + it.key}">${esc(it.label || E[it.key].label)}</a>`).join('')}</div></div>`).join('')}</nav>
      <div class="foot"><span>${esc(S.user.name)} · ${esc(S.user.role)}<br><a href="student.html" target="_blank" rel="noopener" class="small">훈련생 포털 열기 ↗</a></span><button class="btn sm ghost" id="logout">로그아웃</button></div>
    </aside>
    <main class="main">
      <div class="topbar"><button class="btn menu-btn" id="menuBtn">☰</button><div><div class="crumb" id="crumb"></div><h1 id="title"></h1></div><div class="grow"></div>
        ${S.orgs().length ? `<div class="orgtabs" id="orgtabs"><button class="${!S.curOrg ? 'active' : ''}" data-org="">전체</button>${S.orgs().map(o => `<button class="${o.code === S.curOrg ? 'active' : ''}" data-org="${o.code}">${esc(o.short || o.name)}</button>`).join('')}</div>` : ''}
        <span class="mode-pill ${S.mode}">${S.mode === 'api' ? '서버 연결' : '체험 모드 · 이 브라우저에만 저장'}</span></div>
      ${org.demo ? `<div class="notice-demo no-print">⚠️ 지금 보이는 훈련생·과정·성적은 <b>예시 데이터</b>입니다. <span class="grow"></span><a href="#/view/settings">기관 설정에서 삭제 →</a></div>` : ''}
      <div id="page"></div>
    </main></div>`;
  $('#logout').onclick = async () => { await S.logout(); renderLogin(); };
  document.querySelectorAll('#orgtabs button').forEach(b => b.onclick = () => { S.setOrg(b.dataset.org); renderShell(); route(); });
  $('#menuBtn').onclick = () => { $('#side').classList.toggle('open'); toggleSideBg(); };
  $('#nav').querySelectorAll('.grp>button').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
}
function toggleSideBg() { let bg = $('.side-bg'); if ($('#side').classList.contains('open')) { if (!bg) { bg = document.createElement('div'); bg.className = 'side-bg'; bg.onclick = () => { $('#side').classList.remove('open'); bg.remove(); }; document.body.appendChild(bg); } } else if (bg) bg.remove(); }

function route() {
  if (!S.user) return renderLogin();
  if (!$('#page')) renderShell();
  const h = location.hash.replace(/^#\/?/, '') || 'view/dashboard';
  const [kind, name, ...rest] = h.split('/');
  let title = '', crumb = '';
  LMS.menus.forEach(m => m.items.forEach(it => { const match = kind === 'view' ? it.view === name : it.key === name && !it.view; if (match && !title) { title = it.label || E[it.key].label; crumb = `${m.n}. ${m.label}`; const g = $(`.grp[data-n="${m.n}"]`); if (g) g.classList.add('open'); } }));
  $('#title').textContent = title || (E[name] && E[name].label) || '';
  $('#crumb').textContent = crumb;
  $('#nav').querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + kind + '/' + name));
  $('#side').classList.remove('open'); toggleSideBg();
  const page = $('#page');
  document.body.classList.remove('viewer-mode');
  if (kind === 'entity' && E[name]) renderList(page, name, rest[0]);
  else if (kind === 'view' && VIEWS[name]) VIEWS[name](page, rest);
  else page.innerHTML = '<div class="card empty">화면을 찾을 수 없습니다.</div>';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------------- 목록 화면 ---------------- */
function renderList(page, col, filterCourse) {
  const ent = E[col]; const cols = ent.fields.filter(f => f.list && !(f.t === 'org' && !S.orgs().length));
  let q = '', sortK = null, sortD = 1, courseF = filterCourse || '';
  const hasCourse = ent.fields.some(f => f.k === 'course');
  page.innerHTML = `<div class="toolbar no-print">
      <input type="search" class="search" id="q" placeholder="검색 (모든 항목)">
      ${hasCourse ? `<select id="courseF"><option value="">전체 과정</option>${L('course').map(c => `<option value="${c.id}" ${c.id === courseF ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` : ''}
      <span class="grow"></span>
      ${col === 'training_log' ? `<button class="btn" id="genLog">📅 시간표에서 오늘 일지 생성</button>` : ''}
      ${col === 'survey' ? `` : ''}
      ${ent.csvImport ? `<button class="btn" id="csvIn">CSV 업로드</button><input type="file" id="csvFile" accept=".csv,.txt" hidden>` : ''}
      <button class="btn" id="csvOut">CSV 내려받기</button><button class="btn" id="print">인쇄</button>
      <button class="btn primary" id="add">+ 새로 등록</button></div>
    <div class="table-wrap"><table id="tbl"></table></div><div class="small muted" id="cnt" style="margin-top:8px"></div>`;
  const rows = () => {
    let list = L(col).slice();
    if (courseF) list = list.filter(r => r.course === courseF);
    if (q) { const qq = q.toLowerCase(); list = list.filter(r => ent.fields.some(f => String(rawVal(f, r)).toLowerCase().includes(qq))); }
    const sk = sortK || (ent.fields.find(f => f.t === 'date') || {}).k;
    if (sk) { const f = ent.fields.find(f => f.k === sk); const d = sortK ? sortD : -1; list.sort((a, b) => { const x = rawVal(f, a), y = rawVal(f, b); return (x > y ? 1 : x < y ? -1 : 0) * d; }); }
    return list;
  };
  const draw = () => {
    const list = rows();
    $('#tbl').innerHTML = `<thead><tr>${cols.map(f => `<th data-k="${f.k}" class="${f.t === 'number' ? 'num' : ''}">${esc(f.l)}${sortK === f.k ? (sortD > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}<th class="no-print"></th></tr></thead>
      <tbody>${list.length ? list.map(r => `<tr class="clickable" data-id="${r.id}">${cols.map(f => `<td class="${f.t === 'number' ? 'num' : ''}">${fmtVal(f, r)}</td>`).join('')}
        <td class="no-print right"><span style="white-space:nowrap">${rowActions(col, r)}</span></td></tr>`).join('') : `<tr><td colspan="${cols.length + 1}" class="empty">등록된 내용이 없습니다. 오른쪽 위 "새로 등록"을 누르세요.</td></tr>`}</tbody>`;
    $('#cnt').textContent = `총 ${list.length}건`;
    $('#tbl').querySelectorAll('th[data-k]').forEach(th => th.onclick = () => { const k = th.dataset.k; if (sortK === k) sortD *= -1; else { sortK = k; sortD = 1; } draw(); });
    $('#tbl').querySelectorAll('tbody tr[data-id]').forEach(tr => tr.onclick = (e) => { if (e.target.closest('button,a')) return; openForm(col, S.get(col, tr.dataset.id), draw); });
    $('#tbl').querySelectorAll('[data-act]').forEach(b => b.onclick = (e) => { e.stopPropagation(); rowAction(col, b.dataset.act, b.dataset.id, draw); });
  };
  $('#q').oninput = (e) => { q = e.target.value.trim(); draw(); };
  if (hasCourse) $('#courseF').onchange = (e) => { courseF = e.target.value; draw(); };
  $('#add').onclick = () => openForm(col, courseF ? { course: courseF } : {}, draw);
  $('#print').onclick = () => window.print();
  $('#csvOut').onclick = () => downloadCSV(ent.label, ent.fields, rows());
  if (ent.csvImport) { $('#csvIn').onclick = () => $('#csvFile').click(); $('#csvFile').onchange = async (e) => { await importCSV(col, e.target.files[0]); draw(); }; }
  if (col === 'training_log') $('#genLog').onclick = async () => {
    const tt = L('timetable').filter(t => t.date === today() && (!courseF || t.course === courseF));
    if (!tt.length) return toast('오늘 날짜의 시간표가 없습니다. 2. 과정등록 > 시간표 등록에서 먼저 등록하세요.', true);
    let n = 0; for (const t of tt) { if (L('training_log').some(l => l.date === t.date && l.course === t.course && l.period === t.period)) continue; await S.add('training_log', { course: t.course, date: t.date, period: t.period, subject: t.subject, teacher: t.teacher, approval: '작성' }); n++; }
    toast(n ? `${n}건의 훈련일지를 시간표에서 만들었습니다. 내용을 채워 주세요.` : '오늘 일지는 이미 모두 생성되어 있습니다.'); draw();
  };
  draw();
}
function rowActions(col, r) {
  let h = '';
  if (r.approval && isAdmin() && r.approval !== '승인') h += `<button class="btn sm" data-act="approve" data-id="${r.id}">${r.approval === '작성' ? '검토' : '승인'}</button> `;
  if (col === 'survey') h += `<button class="btn sm" data-act="surveyLink" data-id="${r.id}">응답 링크</button> <a class="btn sm" href="#/view/survey_analysis/${r.id}">결과</a> `;
  if (col === 'certificate') h += `<a class="btn sm" href="#/view/cert_print/${r.id}">출력</a> `;
  if (col === 'trainee') h += `<a class="btn sm" href="#/view/grade_report/${r.id}">성적표</a> `;
  if (E[col].copy) h += `<button class="btn sm" data-act="copy" data-id="${r.id}">복사</button> `;
  h += `<button class="btn sm ghost" data-act="del" data-id="${r.id}">삭제</button>`;
  return h;
}
async function rowAction(col, act, id, draw) {
  const r = S.get(col, id);
  if (act === 'del') { if (!confirm('정말 삭제할까요?')) return; await S.remove(col, id); toast('삭제했습니다'); draw(); }
  if (act === 'copy') { const c = { ...r }; delete c.id; delete c.createdAt; delete c.number; const nameK = ['name', 'title', 'unit'].find(k => c[k]); if (nameK) c[nameK] += ' (복사본)'; await S.add(col, c); toast('복사했습니다'); draw(); }
  if (act === 'approve') { await S.update(col, id, { ...r, approval: r.approval === '작성' ? '검토' : '승인', approver: r.approver || staffIdOfUser() }); toast('결재 처리했습니다'); draw(); }
  if (act === 'surveyLink') { const url = location.origin + location.pathname.replace(/admin(\.html)?$/, '') + 'survey.html?id=' + id; try { await navigator.clipboard.writeText(url); toast('응답 링크를 복사했습니다: ' + url); } catch (e) { prompt('응답 링크', url); } }
}
const staffIdOfUser = () => { const s = L('staff').find(s => s.name === (S.user || {}).name); return s ? s.id : ''; };

function downloadCSV(name, fields, list) {
  const head = fields.map(f => f.l), body = list.map(r => fields.map(f => `"${String(rawVal(f, r)).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob(['﻿' + [head.join(',')].concat(body).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name}_${today()}.csv`; a.click();
}
async function importCSV(col, file) {
  if (!file) return; const text = await file.text(); const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  const parse = (l) => { const out = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(s => s.trim()); };
  const head = parse(lines[0]); const ent = E[col]; let n = 0;
  for (const l of lines.slice(1)) {
    const v = parse(l), rec = {};
    ent.fields.forEach(f => { const i = head.findIndex(h => h === f.l || h === f.k || (f.k === 'subject' && /과목|능력단위|훈련내용/.test(h)) || (f.k === 'date' && /일자|날짜|훈련일/.test(h)) || (f.k === 'period' && /교시/.test(h)) || (f.k === 'start' && /시작/.test(h)) || (f.k === 'end' && /종료/.test(h)) || (f.k === 'room' && /강의실|장소/.test(h))); if (i < 0) return; let x = v[i]; if (f.t === 'ref') { const m = L(f.r).find(r => r[REF_LABEL[f.r] || 'name'] === x); x = m ? m.id : undefined; } if (f.t === 'number') x = +x || 0; if (x !== undefined && x !== '') rec[f.k] = x; });
    if (rec.date && rec.date.includes('.')) rec.date = rec.date.replace(/\./g, '-').replace(/-$/, '');
    if (!rec.course) { const sel = $('#courseF'); if (sel && sel.value) rec.course = sel.value; }
    if (Object.keys(rec).length) { await S.add(col, rec); n++; }
  }
  toast(`${n}건을 가져왔습니다.`);
}

/* ---------------- 입력 폼(서랍) ---------------- */
function openForm(col, rec = {}, onDone) {
  const ent = E[col]; rec = JSON.parse(JSON.stringify(rec)); const isNew = !rec.id;
  ent.fields.forEach(f => { if (rec[f.k] === undefined && f.def !== undefined) rec[f.k] = f.def; if (f.t === 'org' && rec[f.k] === undefined) rec[f.k] = S.curOrg; });
  const bg = document.createElement('div'); bg.className = 'drawer-bg';
  bg.innerHTML = `<div class="drawer" role="dialog"><header><h2>${esc(ent.label)} ${isNew ? '등록' : '수정'}</h2><button class="btn sm ghost" id="fClose">✕</button></header>
    <form class="body" id="fForm"><div class="form">${ent.fields.map(f => fieldHTML(f, rec)).join('')}</div></form>
    <footer>${!isNew ? `<button class="btn danger" id="fDel">삭제</button>` : ''}<span style="flex:1"></span><button class="btn" id="fCancel">취소</button><button class="btn primary" id="fSave">저장</button></footer></div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  $('#fClose', bg).onclick = $('#fCancel', bg).onclick = close;
  bg.addEventListener('click', (e) => { if (e.target === bg) close(); });
  bindFieldEvents(bg, ent, rec);
  if (!isNew) $('#fDel', bg).onclick = async () => { if (!confirm('정말 삭제할까요?')) return; await S.remove(col, rec.id); close(); toast('삭제했습니다'); onDone && onDone(); };
  $('#fSave', bg).onclick = async () => {
    const out = collectForm(bg, ent, rec);
    for (const f of ent.fields) if (f.req && !f.calc && (out[f.k] === undefined || out[f.k] === '' || out[f.k] === null)) return toast(`"${f.l}" 항목을 입력하세요`, true);
    ent.fields.forEach(f => { if (f.calc) out[f.k] = f.calc(out); });
    if (isNew) for (const f of ent.fields) if (f.auto === 'certNo') out[f.k] = nextCertNo(out.course);
    try { await S.save(col, out); close(); toast('저장했습니다'); onDone && onDone(); } catch (e) { toast(e.message, true); }
  };
  $('#fForm', bg).onsubmit = (e) => { e.preventDefault(); $('#fSave', bg).click(); };
}
function nextCertNo(courseId) { const org = S.settings(); const co = S.get('course', courseId); const y = new Date().getFullYear(); const prefix = `${(co && co.org) || org.code || 'ORG'}-${y}-`; const n = L('certificate').filter(c => (c.number || '').startsWith(prefix)).length + 1; return prefix + String(n).padStart(3, '0'); }
function fieldHTML(f, rec) {
  if (f.t === 'org' && !S.orgs().length) return '';
  const v = rec[f.k]; const id = 'f_' + f.k; const wide = ['textarea', 'lines', 'questions', 'scores', 'json', 'file'].includes(f.t);
  const lab = `<label for="${id}">${esc(f.l)}${f.req ? ' <span class="req">*</span>' : ''}</label>`;
  const hint = f.hint ? `<div class="hint">${esc(f.hint)}</div>` : '';
  let inp = '';
  if (f.calc) inp = `<input id="${id}" type="text" readonly value="${esc(f.calc(rec))}">`;
  else if (f.ro) inp = `<input id="${id}" type="text" readonly value="${esc(v ?? '')}" placeholder="자동 발급">`;
  else if (f.t === 'text') inp = `<input id="${id}" type="text" value="${esc(v ?? '')}">`;
  else if (f.t === 'number') inp = `<input id="${id}" type="number" step="any" ${f.max ? `max="${f.max}"` : ''} value="${esc(v ?? '')}">`;
  else if (f.t === 'date') inp = `<input id="${id}" type="date" value="${esc(v ?? (f.req ? today() : ''))}">`;
  else if (f.t === 'time') inp = `<input id="${id}" type="time" value="${esc(v ?? '')}">`;
  else if (f.t === 'textarea') inp = `<textarea id="${id}">${esc(v ?? '')}</textarea>`;
  else if (f.t === 'select') inp = `<select id="${id}"><option value="">선택</option>${f.o.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  else if (f.t === 'ref') inp = `<select id="${id}"><option value="">선택</option>${L(f.r).concat(v && !L(f.r).some(r => r.id === v) && S.get(f.r, v) ? [S.get(f.r, v)] : []).map(r => `<option value="${r.id}" ${r.id === v ? 'selected' : ''}>${esc(r[REF_LABEL[f.r] || 'name'])}${f.r === 'trainee' && r.course ? ` (${esc(refLabel('course', r.course))})` : ''}</option>`).join('')}</select>`;
  else if (f.t === 'org') inp = `<select id="${id}"><option value="">공통 (전체 기관)</option>${S.orgs().map(o => `<option value="${o.code}" ${o.code === (v ?? S.curOrg) ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>`;
  else if (f.t === 'bool') return `<div class="field check"><input id="${id}" type="checkbox" ${v ? 'checked' : ''}><label for="${id}">${esc(f.l)}</label></div>`;
  else if (f.t === 'lines') inp = `<textarea id="${id}" placeholder="한 줄에 하나씩">${esc((v || []).join('\n'))}</textarea>${f.upload ? `<div class="file-row"><button type="button" class="btn sm" data-lines-upload="${id}">📄 파일(txt/csv)에서 불러오기</button><input type="file" accept=".txt,.csv" hidden id="${id}_up"></div>` : ''}`;
  else if (f.t === 'file') inp = `<div class="file-row"><button type="button" class="btn sm" data-file="${id}">파일 선택</button><input type="file" hidden id="${id}_up"><span class="name" id="${id}_name">${v && v.url ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.name)}</a>` : '선택된 파일 없음'}</span>${v && v.url ? `<button type="button" class="btn sm ghost" data-file-clear="${id}">제거</button>` : ''}</div><input type="hidden" id="${id}" value='${esc(JSON.stringify(v || null))}'>`;
  else if (f.t === 'json') inp = `<pre class="small" style="white-space:pre-wrap;background:var(--surface-2);padding:8px;border-radius:6px">${esc(JSON.stringify(v || {}, null, 1))}</pre><input type="hidden" id="${id}" value='${esc(JSON.stringify(v || null))}'>`;
  else if (f.t === 'scores') inp = `<div class="scores" id="${id}" data-src="${f.src}" data-src-field="${f.srcField}">${scoresHTML(f, rec)}</div>`;
  else if (f.t === 'questions') inp = questionsHTML(id, v || []);
  return `<div class="field ${wide ? 'wide' : ''}">${lab}${inp}${hint}</div>`;
}
function scoresHTML(f, rec) {
  let items = [];
  if (f.src === 'self') items = rec[f.srcField] || [];
  else { const s = S.get(E[f.src] ? f.src : '', rec[f.src]); items = s ? (s[f.srcField] || []) : []; }
  if (!items.length) return `<div class="hint">${f.src === 'self' ? '위의 항목을 입력하면 여기에 행이 생깁니다.' : '먼저 설정을 선택하세요.'}</div>`;
  const a = rec[f.k] || {};
  return items.map((it, i) => `<div class="row"><span>${i + 1}. ${esc(it)}</span>${f.o ? `<select data-i="${i}"><option value="">선택</option>${f.o.map(o => `<option ${a[i] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<select data-i="${i}"><option value="">점수</option>${[1, 2, 3, 4, 5].map(n => `<option ${+a[i] === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`}</div>`).join('');
}
function questionsHTML(id, qs) {
  return `<div class="qlist" id="${id}">${qs.map((q, i) => qRow(q, i)).join('')}</div><div style="margin-top:8px"><button type="button" class="btn sm" data-add-q="${id}">+ 문항 추가</button></div>`;
}
const qRow = (q, i) => `<div class="q" data-i="${i}"><select class="qt"><option ${q.type === '객관' ? 'selected' : ''}>객관</option><option ${q.type === '선다' ? 'selected' : ''}>선다</option><option ${q.type === '주관' ? 'selected' : ''}>주관</option></select>
  <input type="text" class="qx" placeholder="문항 내용" value="${esc(q.text || '')}"><button type="button" class="btn sm ghost qdel">✕</button>
  <div class="opts ${q.type === '선다' ? '' : 'hidden'}"><input type="text" class="qo" placeholder="보기를 쉼표(,)로 구분: 예) 이론 강의, 실습, 프로젝트" value="${esc((q.options || []).join(', '))}"></div></div>`;
function bindFieldEvents(bg, ent, rec) {
  bg.querySelectorAll('[data-file]').forEach(b => b.onclick = () => $('#' + b.dataset.file + '_up', bg).click());
  bg.querySelectorAll('input[type=file][id$="_up"]').forEach(inp => inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return; const id = inp.id.replace(/_up$/, '');
    const lines = bg.querySelector(`[data-lines-upload="${id}"]`);
    if (lines) { const t = await file.text(); $('#' + id, bg).value = t.split(/\r?\n/).map(l => l.split(',')[0].trim()).filter(Boolean).join('\n'); $('#' + id, bg).dispatchEvent(new Event('input')); return; }
    try { const r = await S.upload(file); $('#' + id, bg).value = JSON.stringify(r); $('#' + id + '_name', bg).innerHTML = `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a>`; toast('파일을 올렸습니다'); } catch (e) { toast(e.message, true); }
  });
  bg.querySelectorAll('[data-lines-upload]').forEach(b => b.onclick = () => $('#' + b.dataset.linesUpload + '_up', bg).click());
  bg.querySelectorAll('[data-file-clear]').forEach(b => b.onclick = () => { $('#' + b.dataset.fileClear, bg).value = 'null'; $('#' + b.dataset.fileClear + '_name', bg).textContent = '선택된 파일 없음'; b.remove(); });
  // 계산 필드 실시간 갱신 + scores 소스 변경 반영
  const recalc = () => { const cur = collectForm(bg, ent, rec); ent.fields.forEach(f => { if (f.calc) { const el = $('#f_' + f.k, bg); if (el) el.value = f.calc(cur); } if (f.t === 'scores') { const box = $('#f_' + f.k, bg); const html = scoresHTML(f, cur); if (box && box.dataset.sig !== html.length + ':' + (cur[f.src] || '') + (cur[f.srcField] || []).length) { box.dataset.sig = html.length + ':' + (cur[f.src] || '') + (cur[f.srcField] || []).length; box.innerHTML = html; } } }); };
  bg.querySelectorAll('input,select,textarea').forEach(el => { el.addEventListener('input', recalc); el.addEventListener('change', recalc); });
  bg.querySelectorAll('[data-add-q]').forEach(b => b.onclick = () => { const list = $('#' + b.dataset.addQ, bg); list.insertAdjacentHTML('beforeend', qRow({ type: '객관' }, list.children.length)); bindQ(bg); });
  bindQ(bg);
}
function bindQ(bg) { bg.querySelectorAll('.q').forEach(q => { $('.qt', q).onchange = () => $('.opts', q).classList.toggle('hidden', $('.qt', q).value !== '선다'); $('.qdel', q).onclick = () => q.remove(); }); }
function collectForm(bg, ent, rec) {
  const out = { ...rec };
  ent.fields.forEach(f => {
    const el = $('#f_' + f.k, bg); if (!el || f.calc) return;
    if (f.t === 'bool') out[f.k] = el.checked;
    else if (f.t === 'number') out[f.k] = el.value === '' ? undefined : +el.value;
    else if (f.t === 'lines') out[f.k] = el.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    else if (f.t === 'file' || f.t === 'json') { try { out[f.k] = JSON.parse(el.value || 'null'); } catch (e) { } }
    else if (f.t === 'scores') { const a = {}; el.querySelectorAll('select').forEach(s => { if (s.value) a[s.dataset.i] = f.o ? s.value : +s.value; }); out[f.k] = a; }
    else if (f.t === 'questions') out[f.k] = [...el.querySelectorAll('.q')].map(q => ({ type: $('.qt', q).value, text: $('.qx', q).value.trim(), options: $('.qt', q).value === '선다' ? $('.qo', q).value.split(',').map(s => s.trim()).filter(Boolean) : undefined })).filter(q => q.text);
    else out[f.k] = el.value;
  });
  return out;
}

/* ---------------- 공용 표/차트 ---------------- */
const table = (head, rows, opts = {}) => `<div class="table-wrap"><table><thead><tr>${head.map(h => `<th class="${/점|수|율|평균|편차|명|건|%/.test(h) ? 'num' : ''}">${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${rows.length ? rows.map(r => `<tr>${r.map((c, i) => `<td class="${/점|수|율|평균|편차|명|건|%/.test(head[i]) ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${head.length}" class="empty">${opts.empty || '자료가 없습니다'}</td></tr>`}</tbody></table></div>`;
const bars = (pairs) => { const mx = Math.max(1, ...pairs.map(p => p[1])); return `<div class="bars">${pairs.map(([l, n]) => `<div class="bar"><span>${esc(l)}</span><div class="track"><div class="fill" style="width:${(n / mx * 100).toFixed(0)}%"></div></div><span class="n">${n}</span></div>`).join('')}</div>`; };
const courseSelect = (id, cur, all = '전체 과정') => `<select id="${id}"><option value="">${all}</option>${L('course').map(c => `<option value="${c.id}" ${c.id === cur ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`;
const printBtn = `<button class="btn" onclick="window.print()">인쇄</button>`;
const groupBy = (list, fn) => list.reduce((m, r) => { const k = fn(r) || '(미지정)'; (m[k] = m[k] || []).push(r); return m; }, {});
const count = (list, fn) => Object.entries(groupBy(list, fn)).map(([k, v]) => [k, v.length]).sort((a, b) => b[1] - a[1]);

/* ---------------- 특수 화면 ---------------- */
const VIEWS = {};

VIEWS.dashboard = (page) => {
  const tr = L('trainee'), active = tr.filter(t => t.status === '재학'), courses = L('course');
  const t0 = today(); const d30 = new Date(); d30.setDate(d30.getDate() - 30); const s30 = d30.toISOString().slice(0, 10);
  const done = tr.filter(t => ['수료', '취업'].includes(t.status)), emp = L('employment');
  const empRate = done.length ? Math.round(done.filter(t => emp.some(e => e.trainee === t.id)).length / done.length * 100) : 0;
  const alerts = [];
  const ttToday = L('timetable').filter(t => t.date === t0), logs = L('training_log');
  const missing = ttToday.filter(t => !logs.some(l => l.date === t.date && l.course === t.course && l.period === t.period));
  if (missing.length) alerts.push(['bad', `오늘 훈련일지 미작성 ${missing.length}건`, missing.map(t => `${refLabel('course', t.course)} ${t.period}교시`).join(', '), '#/entity/training_log']);
  const pend = logs.filter(l => l.approval !== '승인' && l.date < t0); if (pend.length) alerts.push(['warn', `결재 대기 훈련일지 ${pend.length}건`, '검토/승인이 필요합니다', '#/entity/training_log']);
  const pendM = L('makeup_log').filter(l => l.approval !== '승인'); if (pendM.length) alerts.push(['warn', `결재 대기 보강일지 ${pendM.length}건`, '', '#/entity/makeup_log']);
  const noCert = done.filter(t => !L('certificate').some(c => c.trainee === t.id)); if (noCert.length) alerts.push(['info', `증서 미발급 수료자 ${noCert.length}명`, noCert.slice(0, 5).map(t => t.name).join(', ') + (noCert.length > 5 ? ' 외' : ''), '#/entity/certificate']);
  const cs = L('trainee_counsel'); const noCounsel = active.filter(t => !cs.some(c => c.trainee === t.id && c.date >= s30)); if (noCounsel.length) alerts.push(['warn', `최근 30일 상담 없는 재학생 ${noCounsel.length}명`, noCounsel.slice(0, 6).map(t => t.name).join(', ') + (noCounsel.length > 6 ? ' 외' : ''), '#/entity/trainee_counsel']);
  const cq = L('counsel_request').filter(c => c.status === '접수'); if (cq.length) alerts.push(['warn', `훈련생 상담신청 ${cq.length}건 대기`, cq.slice(0, 5).map(c => refLabel('trainee', c.trainee)).join(', '), '#/entity/counsel_request']);
  const gr = L('grievance').filter(g => g.status !== '완료'); if (gr.length) alerts.push(['warn', `미처리 고충/건의 ${gr.length}건`, '', '#/entity/grievance']);
  const sv = L('survey').filter(s => s.status === '진행중' && s.end && s.end <= t0); if (sv.length) alerts.push(['info', `마감일 지난 설문 ${sv.length}건`, '결과분석 후 마감 처리하세요', '#/entity/survey']);
  const noEmp = done.filter(t => t.status === '수료' && !emp.some(e => e.trainee === t.id)); if (noEmp.length) alerts.push(['info', `미취업 수료생 ${noEmp.length}명`, '사후관리 대상', '#/entity/aftercare']);
  const deadline = courses.filter(c => c.status === '모집중' && c.deadline && c.deadline >= t0 && new Date(c.deadline) - new Date(t0) < 14 * 864e5); deadline.forEach(c => alerts.push(['info', `${c.name} 모집 마감 임박`, `마감일 ${c.deadline}`, '#/entity/course']));
  const nextCare = L('aftercare').filter(a => a.next && a.next <= t0); if (nextCare.length) alerts.push(['warn', `사후관리 예정일 도래 ${nextCare.length}건`, '', '#/entity/aftercare']);
  if (!alerts.length) alerts.push(['good', '오늘 처리할 누락 업무가 없습니다', '', '']);
  const consultToday = L('admission_consult').filter(a => a.date === t0).length;
  const sched = L('schedule').filter(s => s.date >= t0).sort((a, b) => a.date > b.date ? 1 : -1).slice(0, 6);
  page.innerHTML = `<div class="kpis">
      <div class="kpi"><div class="l">재학생</div><div class="v">${active.length}</div><div class="s">전체 ${tr.length}명</div></div>
      <div class="kpi"><div class="l">진행 중 과정</div><div class="v">${courses.filter(c => c.status === '진행중').length}</div><div class="s">모집중 ${courses.filter(c => c.status === '모집중').length}</div></div>
      <div class="kpi"><div class="l">오늘 입학상담</div><div class="v">${consultToday}</div><div class="s">상담중 ${L('admission_consult').filter(a => a.status === '상담중').length}건</div></div>
      <div class="kpi ${missing.length ? 'bad' : ''}"><div class="l">오늘 훈련일지</div><div class="v">${ttToday.length - missing.length}/${ttToday.length}</div><div class="s">작성 / 시간표</div></div>
      <div class="kpi"><div class="l">수료생 취업률</div><div class="v">${empRate}%</div><div class="s">수료 ${done.length}명 중 취업 ${done.filter(t => emp.some(e => e.trainee === t.id)).length}</div></div>
      <div class="kpi ${pend.length ? 'warn' : ''}"><div class="l">결재 대기</div><div class="v">${pend.length + pendM.length}</div><div class="s">훈련·보강일지</div></div></div>
    <div class="grid2"><div class="card"><h2>⚠️ 업무 누수 알림</h2><div class="alert-list">${alerts.map(([c, t, d, h]) => `<div class="alert ${c}"><span class="dot"></span><div><div class="t">${esc(t)}</div>${d ? `<div class="d">${esc(d)}</div>` : ''}</div>${h ? `<a href="${h}">바로가기 →</a>` : ''}</div>`).join('')}</div></div>
      <div><div class="card"><h2>📅 다가오는 일정</h2>${sched.length ? sched.map(s => `<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)"><span class="mono small muted">${s.date}${s.time ? ' ' + s.time : ''}</span><span>${badge(s.kind)} ${esc(s.title)}</span></div>`).join('') : '<div class="muted">등록된 일정이 없습니다</div>'}<div style="margin-top:8px"><a href="#/view/calendar">달력 보기 →</a></div></div>
      <div class="card"><h2>📚 과정별 현황</h2>${table(['과정', '상태', '재학', '정원', '기간'], courses.map(c => [`<a href="#/entity/trainee/${c.id}">${esc(c.name)}</a>`, badge(c.status), tr.filter(t => t.course === c.id && t.status === '재학').length, c.capacity || '', `<span class="mono small">${c.start || ''} ~ ${c.end || ''}</span>`]))}</div></div></div>`;
};

VIEWS.enrollment = (page) => {
  const tr = L('trainee'); const byC = groupBy(tr, t => t.course);
  page.innerHTML = `<div class="toolbar no-print"><span class="grow"></span>${printBtn}<a class="btn primary" href="#/entity/trainee">훈련생 등록/수정 →</a></div>
    <div class="card"><h2>과정별 등록 현황</h2>${table(['과정', '정원', '등록', '재학', '수료', '취업', '중도탈락', '충원율%'], L('course').map(c => { const l = byC[c.id] || []; const n = (s) => l.filter(t => t.status === s).length; return [esc(c.name), c.capacity || '-', l.length, n('재학'), n('수료'), n('취업'), n('중도탈락'), c.capacity ? Math.round(l.length / c.capacity * 100) : '-']; }))}</div>
    <div class="card"><h2>최근 등록 훈련생</h2>${table(['등록일', '이름', '과정', '연락처', '지원경로', '상태'], tr.slice().sort((a, b) => (b.enrollDate || '') > (a.enrollDate || '') ? 1 : -1).slice(0, 30).map(t => [t.enrollDate || '', esc(t.name), esc(refLabel('course', t.course)), esc(t.phone || ''), esc(t.channel || ''), badge(t.status)]))}</div>`;
};

VIEWS.interview_result = (page) => {
  const list = L('interview_eval'); const f = E.interview_eval.fields;
  page.innerHTML = `<div class="toolbar no-print">${courseSelect('cf')}<span class="grow"></span>${printBtn}<a class="btn" href="#/entity/interview_eval">평가표 입력 →</a></div><div id="out"></div>`;
  const draw = () => { const cf = $('#cf').value; const l = list.filter(r => !cf || r.course === cf).sort((a, b) => total(f, b) - total(f, a));
    $('#out').innerHTML = Object.entries(groupBy(l, r => r.course)).map(([c, rows]) => `<div class="card"><h2>${esc(refLabel('course', c))} <span class="muted small">지원 ${rows.length}명 · 합격 ${rows.filter(r => r.result === '합격').length}명 · 평균 ${r1(avg(rows.map(r => total(f, r))))}점</span></h2>
      ${table(['순위', '지원자', '면접일', '학습의지', '직무적합성', '태도/인성', '기초지식', '총점', '결과'], rows.map((r, i) => [i + 1, esc(r.name), r.date, r.s1 ?? '', r.s2 ?? '', r.s3 ?? '', r.s4 ?? '', total(f, r), badge(r.result)]))}</div>`).join('') || '<div class="card empty">면접 평가 자료가 없습니다</div>'; };
  $('#cf').onchange = draw; draw();
};

function counselView(page, mode) {
  const list = L('trainee_counsel');
  page.innerHTML = `<div class="toolbar no-print">${courseSelect('cf')}<span class="grow"></span>${printBtn}<a class="btn" href="#/entity/counsel_report">상담결과보고 →</a><button class="btn primary" id="add">+ 상담 기록</button></div><div id="out"></div>`;
  const draw = () => { const cf = $('#cf').value; const l = list.filter(r => !cf || r.course === cf).sort((a, b) => b.date > a.date ? 1 : -1);
    const key = mode === 'course' ? r => r.course : mode === 'date' ? r => (r.date || '').slice(0, 7) : r => r.trainee;
    const lab = mode === 'course' ? k => refLabel('course', k) : mode === 'date' ? k => k + '월' : k => refLabel('trainee', k) + ' (' + refLabel('course', (S.get('trainee', k) || {}).course) + ')';
    const grp = Object.entries(groupBy(l, key)); if (mode === 'date') grp.sort((a, b) => b[0] > a[0] ? 1 : -1);
    $('#out').innerHTML = grp.map(([k, rows]) => `<div class="card"><h2>${esc(lab(k))} <span class="muted small">${rows.length}건 · ${count(rows, r => r.kind).map(([a, b]) => a + ' ' + b).join(', ')}</span></h2>
      ${table(['상담일', '훈련생', '유형', '상담내용', '조치사항', '상담자'], rows.map(r => [r.date, esc(refLabel('trainee', r.trainee)), esc(r.kind || ''), `<span style="white-space:normal">${esc(r.content || '')}</span>`, `<span style="white-space:normal">${esc(r.action || '')}</span>`, esc(refLabel('staff', r.counselor))]))}</div>`).join('') || '<div class="card empty">상담 기록이 없습니다</div>'; };
  $('#cf').onchange = draw; $('#add').onclick = () => openForm('trainee_counsel', {}, () => VIEWS['counsel_by_' + mode](page)); draw();
}
VIEWS.counsel_by_course = (p) => counselView(p, 'course');
VIEWS.counsel_by_date = (p) => counselView(p, 'date');
VIEWS.counsel_by_trainee = (p) => counselView(p, 'trainee');

VIEWS.pre_eval_analysis = (page) => {
  const infos = L('pre_eval_info');
  page.innerHTML = `<div class="toolbar no-print"><select id="ev">${infos.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join('')}</select><span class="grow"></span>${printBtn}</div><div id="out"></div>`;
  const draw = () => { const ev = $('#ev').value; const rows = L('pre_eval').filter(r => r.evalInfo === ev); const f = E.pre_eval.fields; const tot = rows.map(r => total(f, r));
    const lvl = count(rows, r => f.find(x => x.k === 'level').calc(r));
    $('#out').innerHTML = rows.length ? `<div class="kpis"><div class="kpi"><div class="l">응시</div><div class="v">${rows.length}</div></div><div class="kpi"><div class="l">평균</div><div class="v">${r1(avg(tot))}</div></div><div class="kpi"><div class="l">최고</div><div class="v">${Math.max(...tot)}</div></div><div class="kpi"><div class="l">최저</div><div class="v">${Math.min(...tot)}</div></div><div class="kpi"><div class="l">표준편차</div><div class="v">${r1(sd(tot))}</div></div></div>
      <div class="grid2"><div class="card"><h2>영역별 평균</h2>${bars([['이론', r1(avg(rows.map(r => +r.a1 || 0)))], ['실기', r1(avg(rows.map(r => +r.a2 || 0)))], ['태도', r1(avg(rows.map(r => +r.a3 || 0)))]])}</div><div class="card"><h2>수준 분포</h2>${bars(['상', '중', '하'].map(k => [k, (lvl.find(x => x[0] === k) || [k, 0])[1]]))}</div></div>
      <div class="card"><h2>최종분석결과 (개인별)</h2>${table(['훈련생', '이론', '실기', '태도', '총점', '수준', '판정'], rows.sort((a, b) => total(f, b) - total(f, a)).map(r => { const t = total(f, r); return [esc(refLabel('trainee', r.trainee)), r.a1 ?? '', r.a2 ?? '', r.a3 ?? '', t, badge(f.find(x => x.k === 'level').calc(r)), t < avg(tot) - sd(tot) ? '<span class="badge warn">기초보강 권장</span>' : '']; }))}</div>` : '<div class="card empty">이 평가의 평가표가 없습니다. 6. 사전평가 > 평가표에서 입력하세요.</div>'; };
  $('#ev').onchange = draw; if (infos.length) draw(); else $('#out').innerHTML = '<div class="card empty">평가기본정보를 먼저 등록하세요.</div>';
};

VIEWS.grade_report = (page, [traineeId]) => {
  const tr = L('trainee'); const gf = E.grade.fields;
  page.innerHTML = `<div class="toolbar no-print">${courseSelect('cf', (S.get('trainee', traineeId) || {}).course)}<select id="tr"><option value="">종합 성적표 (과정 전체)</option></select><span class="grow"></span>${printBtn}</div><div id="out"></div>`;
  const fillTr = () => { const cf = $('#cf').value; $('#tr').innerHTML = '<option value="">종합 성적표 (과정 전체)</option>' + tr.filter(t => !cf || t.course === cf).map(t => `<option value="${t.id}" ${t.id === traineeId ? 'selected' : ''}>${esc(t.name)} 개별 성적표</option>`).join(''); };
  const draw = () => { const cf = $('#cf').value, tid = $('#tr').value; const org = S.settings();
    const settings = L('subject_eval_setting').filter(s => !cf || s.course === cf); const grades = L('grade').filter(g => (!cf || g.course === cf));
    if (tid) { const t = S.get('trainee', tid); const gs = grades.filter(g => g.trainee === tid); const tot = gs.map(g => total(gf, g));
      $('#out').innerHTML = `<div class="card"><div style="text-align:center;margin-bottom:16px"><h2 style="font-size:22px">개별 성적표</h2><div class="muted">${esc(S.orgName((S.get('course', t.course) || {}).org))} · ${esc(refLabel('course', t.course))}</div></div>
        <div class="grid3" style="margin-bottom:14px"><div><b>이름</b> ${esc(t.name)}</div><div><b>생년월일</b> ${esc(t.birth || '')}</div><div><b>등록일</b> ${esc(t.enrollDate || '')}</div></div>
        ${table(['능력단위', '평가방법', '이론', '실기', '태도', '총점', '등급', '합격'], gs.map(g => { const s = S.get('subject_eval_setting', g.setting) || {}; const tt = total(gf, g); return [esc(s.unit || ''), esc(s.method || ''), g.s1 ?? '', g.s2 ?? '', g.s3 ?? '', tt, badge(gf.find(x => x.k === 'gradeLetter').calc(g)), tt >= (s.pass || 60) ? badge('합격') : badge('불합격')]; }))}
        <div style="margin-top:14px;display:flex;gap:24px"><span><b>평균</b> <span class="mono">${r1(avg(tot))}</span></span><span><b>합격 능력단위</b> ${gs.filter(g => total(gf, g) >= ((S.get('subject_eval_setting', g.setting) || {}).pass || 60)).length}/${gs.length}</span></div>
        <div class="right muted small" style="margin-top:24px">${today()} · ${esc(org.name)}</div></div>`; return; }
    const trs = tr.filter(t => !cf || t.course === cf);
    $('#out').innerHTML = `<div class="card"><h2>훈련생 종합 성적표 <span class="muted small">${cf ? esc(refLabel('course', cf)) : '전체'}</span></h2>${table(['이름', ...settings.map(s => s.unit), '평균', '등급', '순위'],
      trs.map(t => { const row = settings.map(s => { const g = grades.find(g => g.trainee === t.id && g.setting === s.id); return g ? total(gf, g) : null; }); const vals = row.filter(v => v != null); const a = vals.length ? avg(vals) : null; return { t, row, a }; })
        .sort((x, y) => (y.a ?? -1) - (x.a ?? -1)).map((x, i) => [`<a href="#/view/grade_report/${x.t.id}">${esc(x.t.name)}</a>`, ...x.row.map(v => v ?? '-'), x.a != null ? r1(x.a) : '-', x.a != null ? badge(x.a >= 90 ? 'A' : x.a >= 80 ? 'B' : x.a >= 70 ? 'C' : x.a >= 60 ? 'D' : 'F') : '', x.a != null ? i + 1 : '']), { empty: '성적이 없습니다. 8. 평가관리 > 성적 입력에서 입력하세요.' })}</div>`; };
  $('#cf').onchange = () => { fillTr(); draw(); }; $('#tr').onchange = draw; fillTr(); draw();
};

VIEWS.unit_analysis = (page) => {
  page.innerHTML = `<div class="toolbar no-print">${courseSelect('cf')}<span class="grow"></span>${printBtn}</div><div id="out"></div>`;
  const draw = () => { const cf = $('#cf').value; const gf = E.grade.fields; const settings = L('subject_eval_setting').filter(s => !cf || s.course === cf);
    const rows = settings.map(s => { const gs = L('grade').filter(g => g.setting === s.id); const tot = gs.map(g => total(gf, g)); return { s, gs, tot }; });
    $('#out').innerHTML = `<div class="card"><h2>능력단위별 평균</h2>${bars(rows.map(r => [r.s.unit, r1(avg(r.tot))]))}</div>
      <div class="card"><h2>능력단위/단위별 분석표</h2>${table(['능력단위', '과정', '응시', '평균', '최고', '최저', '표준편차', '합격률%', '이론 평균', '실기 평균', '태도 평균'], rows.map(({ s, gs, tot }) => [esc(s.unit), esc(refLabel('course', s.course)), gs.length, r1(avg(tot)), tot.length ? Math.max(...tot) : '-', tot.length ? Math.min(...tot) : '-', r1(sd(tot)), gs.length ? Math.round(gs.filter(g => total(gf, g) >= (s.pass || 60)).length / gs.length * 100) : '-', r1(avg(gs.map(g => +g.s1 || 0))), r1(avg(gs.map(g => +g.s2 || 0))), r1(avg(gs.map(g => +g.s3 || 0)))]))}</div>`; };
  $('#cf').onchange = draw; draw();
};

VIEWS.deviation = (page) => {
  page.innerHTML = `<div class="toolbar no-print">${courseSelect('cf')}<span class="grow"></span>${printBtn}</div><div id="out"></div>`;
  const draw = () => { const cf = $('#cf').value; const gf = E.grade.fields; const grades = L('grade').filter(g => !cf || g.course === cf); const settings = L('subject_eval_setting').filter(s => !cf || s.course === cf);
    const all = grades.map(g => total(gf, g)); const m = avg(all), s = sd(all);
    const trs = L('trainee').filter(t => !cf || t.course === cf).map(t => { const gs = grades.filter(g => g.trainee === t.id); const a = gs.length ? avg(gs.map(g => total(gf, g))) : null; return { t, a, gs }; }).filter(x => x.a != null).sort((x, y) => y.a - x.a);
    $('#out').innerHTML = `<div class="card"><h2>편차비교표 <span class="muted small">과정 평균 ${r1(m)} · 표준편차 ${r1(s)}</span></h2>${table(['훈련생', '평균', '평균과의 차', 'Z점수', '이론', '실기', '태도', '진단'], trs.map(({ t, a, gs }) => { const z = s ? (a - m) / s : 0; const e = ['s1', 's2', 's3'].map(k => r1(avg(gs.map(g => +g[k] || 0)))); const w = settings.length ? ['s1', 's2', 's3'].map((k, i) => e[i] / Math.max(1, avg(settings.map(st => +st['w' + (i + 1)] || 0)))) : [1, 1, 1]; const weak = ['이론', '실기', '태도'][w.indexOf(Math.min(...w))]; return [esc(t.name), r1(a), (a - m >= 0 ? '+' : '') + r1(a - m), r1(z), e[0], e[1], e[2], z < -1 ? `<span class="badge bad">집중지도 · ${weak} 보완</span>` : z > 1 ? '<span class="badge good">우수</span>' : `<span class="badge">보통 · ${weak} 보완</span>`]; }))}</div>
      <div class="card"><h2>요소별 분석표 (배점 대비 달성률)</h2>${table(['능력단위', '이론 배점', '이론 평균', '달성률%', '실기 배점', '실기 평균', '달성률%', '태도 배점', '태도 평균', '달성률%'], settings.map(st => { const gs = grades.filter(g => g.setting === st.id); const e = ['s1', 's2', 's3'].map(k => r1(avg(gs.map(g => +g[k] || 0)))); const p = (i) => st['w' + (i + 1)] ? Math.round(e[i] / st['w' + (i + 1)] * 100) : '-'; return [esc(st.unit), st.w1, e[0], p(0), st.w2, e[1], p(1), st.w3, e[2], p(2)]; }))}</div>`; };
  $('#cf').onchange = draw; draw();
};

VIEWS.survey_analysis = (page, [sid]) => {
  const svs = L('survey');
  page.innerHTML = `<div class="toolbar no-print"><select id="sv">${svs.map(s => `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}</select><span class="grow"></span>${printBtn}<a class="btn" href="#/entity/survey_feedback">총평/피드백 작성 →</a></div><div id="out"></div>`;
  const draw = () => { const s = S.get('survey', $('#sv').value); if (!s) return $('#out').innerHTML = '<div class="card empty">설문을 먼저 만드세요.</div>';
    const rs = L('survey_response').filter(r => r.survey === s.id);
    const objAvg = (s.questions || []).map((q, i) => q.type === '객관' ? avg(rs.map(r => +(r.answers || {})[i]).filter(n => n > 0)) : null).filter(n => n != null);
    $('#out').innerHTML = `<div class="kpis"><div class="kpi"><div class="l">응답 수</div><div class="v">${rs.length}</div></div><div class="kpi"><div class="l">5점 척도 전체 평균</div><div class="v">${objAvg.length ? r1(avg(objAvg)) : '-'}</div></div><div class="kpi"><div class="l">기간</div><div class="v" style="font-size:15px">${s.start || ''} ~ ${s.end || ''}</div></div><div class="kpi"><div class="l">상태</div><div class="v" style="font-size:15px">${badge(s.status)}</div></div></div>
      ${(s.questions || []).map((q, i) => { const ans = rs.map(r => (r.answers || {})[i]).filter(a => a !== undefined && a !== '');
        if (q.type === '객관') { const n = ans.map(Number).filter(x => x > 0); return `<div class="card"><h2>${i + 1}. ${esc(q.text)} <span class="muted small">평균 ${r1(avg(n))} / 5</span></h2>${bars([5, 4, 3, 2, 1].map(k => [k + '점', n.filter(x => x === k).length]))}</div>`; }
        if (q.type === '선다') return `<div class="card"><h2>${i + 1}. ${esc(q.text)}</h2>${bars((q.options || []).map(o => [o, ans.filter(a => a === o).length]))}</div>`;
        return `<div class="card"><h2>${i + 1}. ${esc(q.text)} <span class="muted small">${ans.length}건</span></h2>${ans.length ? '<ul>' + ans.map(a => `<li>${esc(a)}</li>`).join('') + '</ul>' : '<div class="muted">응답 없음</div>'}</div>`; }).join('')}`; };
  $('#sv').onchange = draw; if (svs.length) draw(); else $('#out').innerHTML = '<div class="card empty">설문을 먼저 만드세요.</div>';
};

VIEWS.cert_print = (page, [cid]) => {
  const certs = L('certificate');
  page.innerHTML = `<div class="toolbar no-print"><select id="ct">${certs.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.number)} · ${esc(refLabel('trainee', c.trainee))} · ${esc(c.kind)}</option>`).join('')}</select><span class="grow"></span><button class="btn primary" onclick="window.print()">🖨 인쇄 / PDF 저장</button></div><div id="out"></div>`;
  const TXT = { 수료증: '위 사람은 본 기관에서 실시한 위 훈련과정을 성실히 수료하였으므로 이 증서를 수여합니다.', 이수증: '위 사람은 본 기관에서 실시한 위 훈련과정을 이수하였음을 증명합니다.', 모범상: '위 사람은 훈련 기간 중 성실한 태도와 모범적인 생활로 타의 귀감이 되었으므로 이 상장을 수여합니다.', 개근상: '위 사람은 훈련 기간 중 단 하루도 결석하지 않고 개근하였으므로 이 상장을 수여합니다.', 성적우수상: '위 사람은 훈련 기간 중 우수한 성적을 거두었으므로 이 상장을 수여합니다.' };
  const draw = () => { const c = S.get('certificate', $('#ct').value); if (!c) return $('#out').innerHTML = '<div class="card empty">발급된 증서가 없습니다. 증서번호발급에서 먼저 발급하세요.</div>';
    const t = S.get('trainee', c.trainee) || {}, co = S.get('course', c.course) || {}, org = { ...S.settings(), name: S.orgName(co.org) };
    $('#out').innerHTML = `<div class="cert"><div class="no">${esc(c.number)}</div><h1>${esc(c.kind)}</h1>
      <div class="who">성 명 : <b>${esc(t.name)}</b><br>생년월일 : ${esc(t.birth || '')}<br>훈련과정 : ${esc(co.name || '')}<br>훈련기간 : ${esc(co.start || '')} ~ ${esc(co.end || '')}${co.hours ? ` (${co.hours}시간)` : ''}</div>
      <div class="txt">${TXT[c.kind] || TXT.수료증}</div>
      <div class="date">${(c.date || today()).replace(/-(\d+)-(\d+)/, '년 $1월 $2일')}</div>
      <div class="org">${esc(org.name)} ${esc(org.ceoTitle || '원장')} ${esc(org.ceo || '')}<span class="seal">직인</span></div></div>`; };
  $('#ct').onchange = draw; draw();
};
VIEWS.cert_ledger = (page) => {
  const certs = L('certificate').slice().sort((a, b) => (a.number || '') > (b.number || '') ? 1 : -1);
  page.innerHTML = `<div class="toolbar no-print"><span class="grow"></span>${printBtn}<button class="btn" id="csv">CSV 내려받기</button></div>
    <div class="card"><h2>증서 발급대장 <span class="muted small">${esc(S.curOrg ? S.orgName(S.curOrg) : S.settings().name)} · 총 ${certs.length}건 · 자동 생성</span></h2>${table(['증서번호', '종류', '성명', '생년월일', '과정', '발급일', '발급자', '비고'], certs.map(c => { const t = S.get('trainee', c.trainee) || {}; return [`<span class="mono">${esc(c.number)}</span>`, badge(c.kind), esc(t.name), esc(t.birth || ''), esc(refLabel('course', c.course)), c.date, esc(refLabel('staff', c.issuer)), esc(c.memo || '')]; }))}</div>`;
  $('#csv').onclick = () => downloadCSV('증서발급대장', [{ k: 'number', l: '증서번호' }, { k: 'kind', l: '종류' }, { k: 'trainee', l: '성명', t: 'ref', r: 'trainee' }, { k: 'course', l: '과정', t: 'ref', r: 'course' }, { k: 'date', l: '발급일' }], certs);
};

VIEWS.aftercare_status = (page) => {
  const tr = L('trainee'), emp = L('employment'), care = L('aftercare');
  page.innerHTML = `<div class="toolbar no-print"><span class="grow"></span>${printBtn}</div>
    <div class="card"><h2>과정별 취업 현황</h2>${table(['과정', '수료(취업 포함)', '취업', '취업률%', '관련분야 취업', '고용보험 가입', '사후관리 건수'], L('course').map(c => { const done = tr.filter(t => t.course === c.id && ['수료', '취업'].includes(t.status)); const e = emp.filter(x => done.some(t => t.id === x.trainee)); return [esc(c.name), done.length, e.length, done.length ? Math.round(e.length / done.length * 100) : '-', e.filter(x => x.related).length, e.filter(x => x.insured).length, care.filter(a => done.some(t => t.id === a.trainee)).length]; }))}</div>
    <div class="card"><h2>수료생별 사후관리 현황표</h2>${table(['이름', '과정', '상태', '취업처', '취업일', '고용형태', '최근 관리', '다음 관리일', '확인서'], tr.filter(t => ['수료', '취업'].includes(t.status)).map(t => { const e = emp.find(x => x.trainee === t.id); const cs = care.filter(a => a.trainee === t.id).sort((a, b) => b.date > a.date ? 1 : -1)[0]; const jc = L('job_confirm').filter(j => j.trainee === t.id).length; return [esc(t.name), esc(refLabel('course', t.course)), badge(t.status), e ? esc(e.company) : '<span class="badge warn">미취업</span>', e ? e.date : '', e ? esc(e.type || '') : '', cs ? `${cs.date} ${esc(cs.kind)}` : '<span class="muted">없음</span>', cs && cs.next ? (cs.next <= today() ? `<span class="badge warn">${cs.next}</span>` : cs.next) : '', jc ? `${jc}건` : '']; }))}</div>`;
};

VIEWS.cert_viewer = (page) => {
  const folders = L('cert_folder').slice().sort((a, b) => (a.order || 0) - (b.order || 0)), docs = L('cert_doc');
  let cur = folders[0] && folders[0].id;
  page.innerHTML = `<div class="toolbar no-print"><span class="muted small">심사위원에게 보여줄 때는 "Viewer 모드"를 켜면 메뉴가 사라지고 자료만 보입니다.</span><span class="grow"></span><button class="btn" id="viewer">🖥 Viewer 모드</button><a class="btn" href="#/entity/cert_folder">폴더 관리</a><a class="btn primary" href="#/entity/cert_doc">자료 등록</a></div>
    <div class="card viewer"><div class="tree" id="tree"></div><div id="docs"></div></div>`;
  const tree = (parent, depth) => folders.filter(f => (f.parent || '') === (parent || '')).map(f => `<div class="f ${f.id === cur ? 'active' : ''}" data-id="${f.id}" style="padding-left:${8 + depth * 14}px">📁 ${esc(f.name)} <span class="muted small">${docs.filter(d => d.folder === f.id).length}</span></div>${tree(f.id, depth + 1)}`).join('');
  const draw = () => { $('#tree').innerHTML = tree('', 0) || '<div class="muted">폴더가 없습니다</div>'; $('#tree').querySelectorAll('.f').forEach(el => el.onclick = () => { cur = el.dataset.id; draw(); });
    const f = S.get('cert_folder', cur); const ds = docs.filter(d => d.folder === cur).sort((a, b) => (a.index || '') > (b.index || '') ? 1 : -1);
    $('#docs').innerHTML = `<h2 style="margin-bottom:12px">${f ? esc(f.name) : ''}</h2>` + (ds.length ? ds.map(d => `<div class="doc"><div class="idx">평가지표 ${esc(d.index || '-')}</div><div style="font-weight:600;font-size:15px">${esc(d.title)}</div><div class="muted small">${esc(d.desc || '')}</div>${d.file && d.file.url ? `<div style="margin-top:6px"><a class="btn sm" href="${esc(d.file.url)}" target="_blank" rel="noopener">📎 ${esc(d.file.name)} 열기</a></div>` : '<div class="muted small" style="margin-top:6px">첨부파일 없음</div>'}</div>`).join('') : '<div class="empty">이 폴더에 자료가 없습니다</div>'); };
  $('#viewer').onclick = () => { document.body.classList.toggle('viewer-mode'); $('#viewer').textContent = document.body.classList.contains('viewer-mode') ? '✕ Viewer 종료' : '🖥 Viewer 모드'; };
  $('#viewer').classList.add('exit-viewer'); draw();
};

VIEWS.calendar = (page) => {
  let cur = new Date(); cur.setDate(1);
  page.innerHTML = `<div class="toolbar no-print"><button class="btn" id="prev">‹</button><h2 id="ym" style="font-size:18px;min-width:120px;text-align:center"></h2><button class="btn" id="next">›</button><button class="btn sm ghost" id="tod">오늘</button><span class="grow"></span><span class="small muted">날짜를 누르면 일정을 등록합니다</span><a class="btn" href="#/entity/schedule">목록으로 보기</a></div><div class="card"><div class="cal" id="cal"></div></div>`;
  const draw = () => { const y = cur.getFullYear(), m = cur.getMonth(); $('#ym').textContent = `${y}년 ${m + 1}월`;
    const first = new Date(y, m, 1), start = new Date(first); start.setDate(1 - first.getDay()); const t0 = today();
    const ev = (d) => [...L('schedule').filter(s => s.date === d).map(s => ({ k: s.kind, t: (s.time ? s.time + ' ' : '') + s.title })), ...L('course').filter(c => c.start === d).map(c => ({ k: '과정', t: '개강: ' + c.name })), ...L('course').filter(c => c.deadline === d).map(c => ({ k: '과정', t: '모집마감: ' + c.name })), ...L('subject_eval_setting').filter(s => s.date === d).map(s => ({ k: '평가', t: '평가: ' + s.unit })), ...L('survey').filter(s => s.end === d).map(s => ({ k: '기타', t: '설문마감: ' + s.title }))];
    let h = ['일', '월', '화', '수', '목', '금', '토'].map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const ds = d.toISOString().slice(0, 10); const es = ev(ds); h += `<div class="day ${d.getMonth() !== m ? 'other' : ''} ${ds === t0 ? 'today' : ''}" data-d="${ds}"><div class="n">${d.getDate()}</div>${es.slice(0, 3).map(e => `<span class="ev ${esc(e.k || '')}">${esc(e.t)}</span>`).join('')}${es.length > 3 ? `<span class="muted">+${es.length - 3}</span>` : ''}</div>`; }
    $('#cal').innerHTML = h; $('#cal').querySelectorAll('.day').forEach(el => el.onclick = () => openForm('schedule', { date: el.dataset.d }, draw)); };
  $('#prev').onclick = () => { cur.setMonth(cur.getMonth() - 1); draw(); }; $('#next').onclick = () => { cur.setMonth(cur.getMonth() + 1); draw(); }; $('#tod').onclick = () => { cur = new Date(); cur.setDate(1); draw(); }; draw();
};

VIEWS.stats = (page) => {
  page.innerHTML = `<div class="toolbar no-print">${courseSelect('cf')}<select id="st"><option value="">전체 상태</option>${['재학', '수료', '취업', '중도탈락'].map(s => `<option>${s}</option>`).join('')}</select><span class="grow"></span>${printBtn}</div><div id="out"></div>`;
  const draw = () => { const cf = $('#cf').value, stt = $('#st').value; const tr = L('trainee').filter(t => (!cf || t.course === cf) && (!stt || t.status === stt)); const ac = L('admission_consult').filter(a => !cf || a.course === cf);
    const ageBand = (t) => { const a = age(t.birth); return a == null ? '미상' : a < 20 ? '10대' : a < 30 ? '20대' : a < 40 ? '30대' : a < 50 ? '40대' : a < 60 ? '50대' : '60대 이상'; };
    const order = ['10대', '20대', '30대', '40대', '50대', '60대 이상', '미상'];
    $('#out').innerHTML = `<div class="kpis"><div class="kpi"><div class="l">훈련생</div><div class="v">${tr.length}</div></div><div class="kpi"><div class="l">입학상담</div><div class="v">${ac.length}</div><div class="s">상담→등록 전환 ${ac.length ? Math.round(ac.filter(a => a.status === '등록완료').length / ac.length * 100) : 0}%</div></div><div class="kpi"><div class="l">평균 연령</div><div class="v">${r1(avg(tr.map(t => age(t.birth)).filter(a => a != null)))}</div></div></div>
      <div class="grid2"><div class="card"><h2>지역별</h2>${bars(count(tr, t => t.region))}</div><div class="card"><h2>성별</h2>${bars(count(tr, t => t.gender))}</div>
      <div class="card"><h2>연령별</h2>${bars(order.map(k => [k, tr.filter(t => ageBand(t) === k).length]).filter(x => x[1]))}</div><div class="card"><h2>지원 경로별 <span class="muted small">훈련생 기준</span></h2>${bars(count(tr, t => t.channel))}</div>
      <div class="card"><h2>지원 경로별 상담 → 등록 전환</h2>${table(['경로', '상담', '등록완료', '전환율%'], count(ac, a => a.channel).map(([k, n]) => [esc(k), n, ac.filter(a => a.channel === k && a.status === '등록완료').length, Math.round(ac.filter(a => a.channel === k && a.status === '등록완료').length / n * 100)]))}</div>
      <div class="card"><h2>학력별</h2>${bars(count(tr, t => t.edu))}</div></div>`; };
  $('#cf').onchange = $('#st').onchange = draw; draw();
};

VIEWS.settings = (page) => {
  const org = S.settings();
  const F = [['name', '기관명'], ['code', '기관코드(증서번호 앞자리)'], ['ceo', '대표자 성명'], ['ceoTitle', '대표자 직함'], ['phone', '전화'], ['email', '이메일'], ['address', '주소'], ['hours', '운영시간'], ['slogan', '홈페이지 한 줄 소개']];
  page.innerHTML = `<div class="card"><h2>기관 정보 <span class="muted small">홈페이지와 증서에 그대로 표시됩니다</span></h2><div class="form">${F.map(([k, l]) => `<div class="field ${k === 'address' || k === 'slogan' ? 'wide' : ''}"><label for="s_${k}">${l}</label><input id="s_${k}" type="text" value="${esc(org[k] || '')}"></div>`).join('')}
    <div class="field wide"><label for="s_about">기관 소개 (홈페이지)</label><textarea id="s_about">${esc(org.about || '')}</textarea></div>
    <div class="field wide"><label>기관 구분 (한 줄에 하나: 코드,기관명,짧은이름) — 증서번호 앞자리와 상단 탭에 쓰입니다</label><textarea id="s_orgs" style="min-height:60px">${esc(S.orgs().map(o => [o.code, o.name, o.short || ''].join(',')).join('\n'))}</textarea><div class="hint">예) EDU,따사로운 평생교육원,평생교육원</div></div></div>
    <div style="margin-top:14px"><button class="btn primary" id="save">저장</button></div></div>
    <div class="card"><h2>데이터 관리</h2><div class="toolbar"><button class="btn" id="exp">전체 백업 내려받기 (JSON)</button><button class="btn" id="imp">백업 불러오기</button><input type="file" id="impF" accept=".json" hidden><span class="grow"></span>${org.demo ? `<button class="btn danger" id="reset">예시 데이터 전체 삭제 (실제 사용 시작)</button>` : `<button class="btn" id="restore">예시 데이터 다시 넣기 (빈 항목만 채움)</button>`}</div>
    <div class="small muted">${S.mode === 'api' ? '서버 모드: 데이터는 서버의 data/db.json 에 저장됩니다. 정기적으로 백업을 내려받으세요.' : '체험 모드: 데이터는 이 브라우저에만 저장됩니다. 다른 컴퓨터에서 보려면 백업을 내려받아 불러오세요. 여러 사람이 함께 쓰려면 서버 설치가 필요합니다.'}</div></div>`;
  $('#save').onclick = async () => { const o = { ...org, id: 'main' }; F.forEach(([k]) => o[k] = $('#s_' + k).value.trim()); o.about = $('#s_about').value;
    o.orgs = $('#s_orgs').value.split(/\r?\n/).map(l => l.split(',').map(x => x.trim())).filter(x => x[0] && x[1]).map(([code, name, short]) => ({ code, name, short: short || name })); if (!o.orgs.some(x => x.code === S.curOrg)) S.setOrg(''); await S.update('settings', 'main', o); toast('저장했습니다'); renderShell(); route(); };
  $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([S.exportJSON()], { type: 'application/json' })); a.download = `lms_backup_${today()}.json`; a.click(); };
  $('#imp').onclick = () => $('#impF').click(); $('#impF').onchange = async (e) => { if (!confirm('현재 데이터를 백업 파일 내용으로 바꿉니다. 계속할까요?')) return; try { await S.importJSON(await e.target.files[0].text()); toast('불러왔습니다'); renderShell(); route(); } catch (err) { toast('파일 형식이 올바르지 않습니다', true); } };
  const rs = $('#restore'); if (rs) rs.onclick = async () => { await S.restoreDemo(); toast('예시 데이터를 다시 넣었습니다'); renderShell(); route(); };
  if (org.demo) $('#reset').onclick = async () => { if (!confirm('예시 데이터를 모두 지우고 빈 상태로 시작합니다. 되돌릴 수 없습니다. 계속할까요?')) return; const keep = { ...org, demo: false }; await S.resetDemo(); await S.update('settings', 'main', keep); S.setOrg(''); toast('예시 데이터를 지웠습니다'); renderShell(); location.hash = '#/view/dashboard'; route(); };
};

/* ---------------- 시작 ---------------- */
S.init().then(() => { if (S.user) { renderShell(); route(); } else renderLogin(); });
})();
