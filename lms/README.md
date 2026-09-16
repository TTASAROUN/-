# 훈련기관 LMS (홈페이지 + 업무 콘솔)

아토소프트 LMS의 16개 메뉴 구조를 따라 만든, 외부 라이브러리 없는 Node.js 웹앱입니다.

## 실행

```bash
node server.js          # http://localhost:3000  (포트 변경: PORT=8080 node server.js)
```

- `/` 홈페이지 · `/admin` 업무 콘솔 (초기 계정 admin / 1234) · `/survey.html?id=설문ID` 훈련생 설문 응답
- 데이터: `data/db.json`, 첨부파일: `data/uploads/` (둘 다 자동 생성, 백업은 이 폴더만 복사)
- 서버 없이 `public/admin.html`을 브라우저로 열어도 동작 (체험 모드, 그 브라우저에만 저장)

## 구조

| 파일 | 역할 |
|---|---|
| `server.js` | 정적 파일 + API + 로그인 + 파일 업로드 |
| `public/js/modules.js` | **메뉴와 입력 항목 정의** — 항목을 바꾸려면 이 파일만 수정 |
| `public/js/app.js` | 목록/입력 화면 자동 생성, 성적표·증서·통계 등 특수 화면 |
| `public/js/store.js` | 데이터 저장 (서버 API 또는 브라우저 저장소 자동 선택) |
| `public/js/seed.js` | 예시 데이터 |
| `public/index.html` | 홈페이지 · `admin.html` 콘솔 · `survey.html` 설문 응답 |

분석 문서: [../docs/lms-analysis.md](../docs/lms-analysis.md)
