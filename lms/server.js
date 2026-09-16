/* ============================================================
   server.js — 외부 라이브러리 없이 Node.js만으로 동작하는 LMS 서버
   실행:  node server.js        (기본 포트 3000)
   접속:  http://localhost:3000        → 홈페이지
          http://localhost:3000/admin  → 업무 콘솔  (초기 계정 admin / 1234)
   데이터: data/db.json  (자동 생성)   첨부파일: data/uploads/
   ============================================================ */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), vm = require('vm');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname, PUB = path.join(ROOT, 'public'), DATA = path.join(ROOT, 'data'), UP = path.join(DATA, 'uploads'), DB = path.join(DATA, 'db.json');
fs.mkdirSync(UP, { recursive: true });

/* ---------- 예시 데이터 (브라우저용 seed.js를 그대로 재사용) ---------- */
function makeSeed() {
  const ctx = { LMS: {} }; ctx.window = ctx;
  vm.runInNewContext(fs.readFileSync(path.join(PUB, 'js/seed.js'), 'utf8'), ctx);
  return ctx.LMS.makeSeed();
}
/* ---------- DB ---------- */
let db;
function load() { try { db = JSON.parse(fs.readFileSync(DB, 'utf8')); } catch (e) { db = makeSeed(); save(); } }
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { const tmp = DB + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, DB); }, 50); }
load();
const hash = (pw) => 'sha256:' + crypto.createHash('sha256').update(String(pw)).digest('hex');
const checkPw = (stored, pw) => String(stored).startsWith('sha256:') ? stored === hash(pw) : stored === pw;

/* ---------- 세션 ---------- */
const sessions = new Map();
function getUser(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  return m && sessions.get(m[1]) || null;
}
/* ---------- 유틸 ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.webp': 'image/webp' };
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
const readBody = (req, limit = 50 * 1024 * 1024) => new Promise((ok, no) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > limit) { no(new Error('too large')); req.destroy(); } c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); req.on('error', no); });
const uid = () => Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
function serveFile(res, file) {
  fs.stat(file, (err, stt) => {
    if (err || !stt.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}

/* ---------- API ---------- */
async function apiHandler(req, res, url) {
  const p = url.pathname.replace(/^\/api/, ''), m = req.method;
  if (p === '/ping') return json(res, 200, { ok: true });
  if (p === '/login' && m === 'POST') {
    const { id, pw } = JSON.parse((await readBody(req)).toString() || '{}');
    const u = (db.user || []).find(u => u.id === id && checkPw(u.pw, pw));
    if (!u) return json(res, 401, { error: '아이디 또는 비밀번호가 맞지 않습니다' });
    const sid = crypto.randomBytes(16).toString('hex'); const user = { id: u.id, name: u.name, role: u.role };
    sessions.set(sid, user);
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    return json(res, 200, { user });
  }
  /* 설문 응답은 로그인 없이 가능 (훈련생이 링크로 응답) */
  if (p.startsWith('/public/survey/') && m === 'GET') {
    const s = (db.survey || []).find(s => s.id === p.split('/')[3]); if (!s) return json(res, 404, { error: '설문이 없습니다' });
    return json(res, 200, { survey: s, org: (db.settings || [])[0] });
  }
  if (p === '/public/survey_response' && m === 'POST') {
    const rec = JSON.parse((await readBody(req)).toString()); rec.id = uid(); rec.createdAt = new Date().toISOString();
    (db.survey_response = db.survey_response || []).push(rec); save(); return json(res, 200, rec);
  }
  if (p === '/public/consult' && m === 'POST') { /* 홈페이지 상담신청 → 입학상담에 자동 등록 */
    const b = JSON.parse((await readBody(req)).toString());
    const rec = { id: uid(), name: b.name, phone: b.phone, course: b.course, channel: '홈페이지', content: b.content, date: new Date().toISOString().slice(0, 10), status: '상담중', createdAt: new Date().toISOString() };
    (db.admission_consult = db.admission_consult || []).push(rec); save(); return json(res, 200, { ok: true });
  }
  if (p === '/public/site' && m === 'GET') {
    return json(res, 200, { org: (db.settings || [])[0], courses: (db.course || []).filter(c => c.public && c.status !== '종료'), employment: (db.employment || []).length, notices: (db.notice || []).filter(n => n.target === '전체').slice(-3) });
  }

  const user = getUser(req);
  if (!user) return json(res, 401, { error: '로그인이 필요합니다' });
  if (p === '/me') return json(res, 200, { user });
  if (p === '/logout') { return json(res, 200, { ok: true }); }
  if (p === '/db') { const out = { ...db, user: (db.user || []).map(u => ({ ...u, pw: '' })) }; return json(res, 200, out); }
  if (p === '/upload' && m === 'POST') {
    const name = decodeURIComponent(req.headers['x-filename'] || 'file').replace(/[\/\\]/g, '_');
    const stored = uid() + '_' + name; fs.writeFileSync(path.join(UP, stored), await readBody(req));
    return json(res, 200, { name, url: '/uploads/' + stored });
  }
  if (user.role !== '관리자' && (p === '/reset' || p === '/import')) return json(res, 403, { error: '관리자만 가능합니다' });
  if (p === '/reset' && m === 'POST') { db = { settings: [{ id: 'main', name: db.settings?.[0]?.name || '우리 기관', code: db.settings?.[0]?.code || 'ORG' }], user: db.user }; save(); return json(res, 200, { ok: true }); }
  if (p === '/import' && m === 'POST') { const data = JSON.parse((await readBody(req)).toString()); if (!data.user?.length) data.user = db.user; db = data; save(); return json(res, 200, { ok: true }); }

  const [, col, id] = p.split('/');
  if (!/^[a-z_]+$/.test(col || '')) return json(res, 404, { error: 'not found' });
  db[col] = db[col] || [];
  if (m === 'POST' && !id) {
    const rec = JSON.parse((await readBody(req)).toString()); rec.id = rec.id || uid();
    if (col === 'user' && rec.pw && !String(rec.pw).startsWith('sha256:')) rec.pw = hash(rec.pw);
    db[col].push(rec); save(); return json(res, 200, col === 'user' ? { ...rec, pw: '' } : rec);
  }
  if (m === 'PUT' && id) {
    const rec = JSON.parse((await readBody(req)).toString()); rec.id = id;
    const i = db[col].findIndex(r => r.id === id);
    if (col === 'user') { if (!rec.pw) rec.pw = i >= 0 ? db[col][i].pw : hash('1234'); else if (!String(rec.pw).startsWith('sha256:')) rec.pw = hash(rec.pw); }
    if (i >= 0) db[col][i] = rec; else db[col].push(rec); save(); return json(res, 200, col === 'user' ? { ...rec, pw: '' } : rec);
  }
  if (m === 'DELETE' && id) { db[col] = db[col].filter(r => r.id !== id); save(); return json(res, 200, { ok: true }); }
  return json(res, 404, { error: 'not found' });
}

/* ---------- 서버 ---------- */
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await apiHandler(req, res, url);
    if (url.pathname.startsWith('/uploads/')) { if (!getUser(req)) { res.writeHead(401); return res.end('로그인 필요'); } return serveFile(res, path.join(UP, path.basename(url.pathname))); }
    let p = url.pathname === '/' ? '/index.html' : url.pathname;
    if (p === '/admin') p = '/admin.html'; if (p === '/survey') p = '/survey.html';
    const file = path.normalize(path.join(PUB, p));
    if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
    serveFile(res, file);
  } catch (e) { console.error(e); json(res, 500, { error: e.message }); }
}).listen(PORT, () => console.log(`LMS 서버 실행 중: http://localhost:${PORT}  (콘솔: /admin, 초기 계정 admin / 1234)`));
