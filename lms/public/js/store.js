/* store.js — 데이터 저장소. 서버가 있으면 API, 없으면 브라우저 저장소를 씁니다. */
window.LMS = window.LMS || {};
LMS.store = (() => {
  const st = { mode: 'local', db: {}, user: null, ready: false };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const LS_KEY = 'lms_db_v1', LS_USER = 'lms_user_v1';

  function ensure() { Object.keys(LMS.entities).concat(['settings']).forEach(k => { if (!Array.isArray(st.db[k])) st.db[k] = []; }); }
  function persistLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(st.db)); } catch (e) { console.warn('저장 실패', e); } }

  async function api(path, opt = {}) {
    if (st.student && /^\/[a-z_]+(\/|$)/.test(path) && !path.startsWith('/student') && !path.startsWith('/logout')) path = '/student' + path;
    const res = await fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...opt });
    if (res.status === 401) { st.user = null; throw new Error('로그인이 필요합니다'); }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || '요청 실패');
    return res.json();
  }

  st.init = async function () {
    // 서버가 있는지 확인
    try {
      const ping = await fetch('/api/ping', { credentials: 'same-origin' });
      if (ping.ok) st.mode = 'api';
    } catch (e) { st.mode = 'local'; }
    if (st.mode === 'api') {
      try { const r = await fetch('/api/me', { credentials: 'same-origin' }); st.user = r.ok ? (await r.json()).user : null; } catch (e) { st.user = null; }
      if (st.user) st.db = await api('/db');
      else { try { const r = await fetch('/api/public/site'); if (r.ok) { const d = await r.json(); if (d.org) st.db.settings = [d.org]; } } catch (e) {} }
    } else {
      try { st.db = JSON.parse(localStorage.getItem(LS_KEY) || 'null') || {}; } catch (e) { st.db = {}; }
      if (!Object.keys(st.db).length) { st.db = LMS.makeSeed(); persistLocal(); }
      else if (st.db.settings && st.db.settings[0] && /한빛|○○/.test(st.db.settings[0].name || '')) { st.db.settings = LMS.makeSeed().settings; persistLocal(); }
      try { st.user = JSON.parse(localStorage.getItem(LS_USER) || 'null'); } catch (e) { st.user = null; }
    }
    ensure(); st.ready = true; return st;
  };
  st.reload = async function () { if (st.mode === 'api' && st.user) { st.db = await api('/db'); ensure(); } };

  st.login = async function (id, pw) {
    if (st.mode === 'api') { st.user = (await api('/login', { method: 'POST', body: JSON.stringify({ id, pw }) })).user; st.db = await api('/db'); ensure(); return st.user; }
    ensure();
    const u = st.db.user.find(u => u.id === id && u.pw === pw);
    if (!u) throw new Error('아이디 또는 비밀번호가 맞지 않습니다');
    st.user = { id: u.id, name: u.name, role: u.role }; try { localStorage.setItem(LS_USER, JSON.stringify(st.user)); } catch (e) {}
    return st.user;
  };
  /* 훈련생 포털: 이름 + 생년월일 + 연락처 뒤 4자리 */
  st.studentLogin = async function (name, birth, phone4) {
    if (st.mode === 'api') { const r = await api('/student/login', { method: 'POST', body: JSON.stringify({ name, birth, phone4 }) }); st.student = r.trainee; st.db = await api('/student/data'); ensure(); return st.student; }
    ensure();
    const t = st.db.trainee.find(t => t.name === name.trim() && t.birth === birth && (t.phone || '').replace(/\D/g, '').slice(-4) === phone4 && t.portal !== false);
    if (!t) throw new Error('일치하는 훈련생이 없습니다. 이름·생년월일·연락처를 확인하세요');
    st.student = t; try { sessionStorage.setItem('lms_student', t.id); } catch (e) {}
    return t;
  };
  st.studentResume = async function () {
    if (st.mode === 'api') { try { const r = await api('/student/me'); st.student = r.trainee; st.db = await api('/student/data'); ensure(); } catch (e) { st.student = null; } return st.student; }
    let id = null; try { id = sessionStorage.getItem('lms_student'); } catch (e) {}
    st.student = id ? st.get('trainee', id) : null; return st.student;
  };
  st.studentLogout = async function () { if (st.mode === 'api') await api('/logout', { method: 'POST' }).catch(() => {}); st.student = null; try { sessionStorage.removeItem('lms_student'); } catch (e) {} };
  st.logout = async function () {
    if (st.mode === 'api') await api('/logout', { method: 'POST' }).catch(() => {});
    st.user = null; try { localStorage.removeItem(LS_USER); } catch (e) {}
  };

  st.list = (col) => st.db[col] || [];
  st.get = (col, id) => (st.db[col] || []).find(r => r.id === id);
  st.settings = () => { const o = (st.db.settings && st.db.settings[0]) || { name: '우리 기관', code: 'ORG' }; if (!Array.isArray(o.orgs)) o.orgs = []; return o; };
  st.orgs = () => st.settings().orgs;
  st.orgName = (code) => { const o = st.orgs().find(o => o.code === code); return o ? o.name : st.settings().name; };
  st.orgShort = (code) => { const o = st.orgs().find(o => o.code === code); return o ? (o.short || o.name) : '공통'; };
  /* 어떤 기록이 어느 기관 것인지 — 직접 org가 있으면 그것, 아니면 과정/훈련생을 따라감 */
  st.orgOf = (col, r) => {
    if (!r) return '';
    if (r.org !== undefined) return r.org || '';
    if (r.course) { const c = st.get('course', r.course); return c ? (c.org || '') : ''; }
    if (r.trainee) { const t = st.get('trainee', r.trainee); return t ? st.orgOf('trainee', t) : ''; }
    if (r.evalInfo) return st.orgOf('pre_eval_info', st.get('pre_eval_info', r.evalInfo));
    if (r.setting) return st.orgOf('x', st.get('subject_eval_setting', r.setting) || st.get('self_diag_setting', r.setting));
    if (r.survey) return st.orgOf('survey', st.get('survey', r.survey));
    if (r.folder) return st.orgOf('cert_folder', st.get('cert_folder', r.folder));
    if (r.parent) return st.orgOf('cert_folder', st.get('cert_folder', r.parent));
    if (r.staff) return st.orgOf('staff', st.get('staff', r.staff));
    return '';
  };
  st.curOrg = '';
  try { st.curOrg = localStorage.getItem('lms_org') || ''; } catch (e) {}
  st.setOrg = (code) => { st.curOrg = code || ''; try { localStorage.setItem('lms_org', st.curOrg); } catch (e) {} };
  /* 현재 선택된 기관 기준으로 걸러진 목록. 기관 표시가 없는 공통 기록은 항상 보임 */
  st.listOrg = (col) => { const l = st.list(col); if (!st.curOrg) return l; return l.filter(r => { const o = st.orgOf(col, r); return !o || o === st.curOrg; }); };
  st.restoreDemo = async function () {
    if (st.mode === 'api') { await api('/restore-demo', { method: 'POST' }); st.db = await api('/db'); ensure(); return; }
    const seed = LMS.makeSeed(); const cur = st.settings(); const wasEmpty = st.isEmpty();
    for (const [k, v] of Object.entries(seed)) { if (k === 'settings') continue; if (!st.db[k] || !st.db[k].length) st.db[k] = v; }
    st.db.settings = wasEmpty ? seed.settings : [{ ...seed.settings[0], ...cur, demo: true, orgs: cur.orgs && cur.orgs.length ? cur.orgs : seed.settings[0].orgs }];
    persistLocal(); ensure();
  };
  st.isEmpty = () => !(st.db.course || []).length && !(st.db.trainee || []).length;

  st.add = async function (col, rec) {
    rec = { ...rec, id: rec.id || uid(), createdAt: new Date().toISOString(), createdBy: st.user && st.user.name };
    if (st.mode === 'api') rec = await api('/' + col, { method: 'POST', body: JSON.stringify(rec) });
    ensure(); st.db[col].push(rec); if (st.mode === 'local') persistLocal(); return rec;
  };
  st.update = async function (col, id, rec) {
    rec = { ...rec, id, updatedAt: new Date().toISOString(), updatedBy: st.user && st.user.name };
    if (st.mode === 'api') rec = await api(`/${col}/${id}`, { method: 'PUT', body: JSON.stringify(rec) });
    const i = st.db[col].findIndex(r => r.id === id); if (i >= 0) st.db[col][i] = rec; else st.db[col].push(rec);
    if (st.mode === 'local') persistLocal(); return rec;
  };
  st.save = (col, rec) => rec.id && st.get(col, rec.id) ? st.update(col, rec.id, rec) : st.add(col, rec);
  st.remove = async function (col, id) {
    if (st.mode === 'api') await api(`/${col}/${id}`, { method: 'DELETE' });
    st.db[col] = st.db[col].filter(r => r.id !== id); if (st.mode === 'local') persistLocal();
  };
  st.upload = async function (file) {
    if (st.mode === 'api') {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', headers: { 'x-filename': encodeURIComponent(file.name) }, body: file });
      if (!res.ok) throw new Error('업로드 실패'); return res.json();
    }
    if (file.size > 1.5 * 1024 * 1024) throw new Error('브라우저 저장 모드에서는 1.5MB 이하 파일만 올릴 수 있습니다 (서버 설치 시 제한 없음)');
    const url = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(file); });
    return { name: file.name, url, size: file.size };
  };
  st.resetDemo = async function () {
    if (st.mode === 'api') { await api('/reset', { method: 'POST' }); st.db = await api('/db'); }
    else { st.db = {}; ensure(); st.db.settings = [{ id: 'main', name: '우리 기관', code: 'ORG' }]; st.db.user = [{ id: 'admin', pw: '1234', name: '관리자', role: '관리자' }]; persistLocal(); }
    ensure();
  };
  st.exportJSON = () => JSON.stringify(st.db, null, 1);
  st.importJSON = async function (text) {
    const data = JSON.parse(text);
    if (st.mode === 'api') { await api('/import', { method: 'POST', body: JSON.stringify(data) }); st.db = await api('/db'); }
    else { st.db = data; persistLocal(); }
    ensure();
  };
  return st;
})();
