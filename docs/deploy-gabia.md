# 가비아에 LMS 올리기 — 클릭 순서

현재 상태: 가비아에 도메인 2개(ttasa.co.kr, tasa.co.kr)만 있고 서버는 없음.
목표: 서버 1대 빌려서 `https://ttasa.co.kr`(홈페이지) + `https://lms.ttasa.co.kr`(업무 콘솔) 열기.

## 1단계. 가비아에서 서버 신청 (10분)

1. 가비아 로그인 → 상단 메뉴 **클라우드** → **g클라우드** (또는 "서버 호스팅")
2. 상품: **Linux / Ubuntu 22.04 또는 24.04**, 가장 작은 사양 (CPU 1개, 메모리 1~2GB, 디스크 50GB). 월 1~2만 원대.
   - "웹호스팅"(PHP·워드프레스용)은 이 프로그램이 안 돌아갑니다. 반드시 **서버(g클라우드)** 로 신청하세요.
   - 신청 화면에 "Node.js" 가 보이는 상품이 있으면 그것도 됩니다. 애매하면 캡처해서 보내주세요.
3. 신청 완료 후 받는 것 3가지를 메모: **서버 IP 주소**, **root 비밀번호**(또는 접속 키), **접속 방법 안내**.

## 2단계. 도메인을 서버에 연결 (5분)

1. My가비아 → 도메인 → ttasa.co.kr **관리** → **DNS 정보** → **DNS 관리** (또는 "DNS 설정")
2. 레코드 3줄 추가 (타입은 모두 **A**, 값은 1단계에서 받은 서버 IP):

| 호스트 | 타입 | 값 | TTL |
|---|---|---|---|
| @ | A | 서버 IP | 3600 |
| www | A | 서버 IP | 3600 |
| lms | A | 서버 IP | 3600 |

3. 저장. 반영까지 10분~1시간.

## 3단계. 서버에 프로그램 설치 (5분, 명령 3줄)

가비아가 알려준 방법으로 서버에 접속(웹 콘솔 또는 터미널)한 뒤, 아래 3줄을 차례로 붙여넣기:

```bash
apt-get update -y && apt-get install -y git
git clone https://github.com/TTASAROUN/-.git /root/ttasa && cd /root/ttasa/lms
sudo bash deploy/install.sh ttasa.co.kr lms.ttasa.co.kr
```

끝나면 화면에 "설치 완료"와 주소 3개가 뜹니다. 이 명령이 하는 일: Node.js 설치, HTTPS 자동 발급, 재부팅해도 자동 시작, 매일 새벽 3시 백업.

> 저장소가 비공개면 3줄 대신 `lms` 폴더를 통째로 올려도 됩니다 (FileZilla 같은 프로그램으로 /root/ttasa/lms 에 복사 → 3번째 줄만 실행).

## 4단계. 첫 접속 후 바로 할 것

1. `https://lms.ttasa.co.kr` 접속 → admin / 1234 로그인
2. 기타관리 → **사용자 계정** → admin 비밀번호 변경, 직원 계정 추가
3. 기타관리 → **기관 설정** → 기관명·대표자·주소·전화 입력 → 저장
4. 기관 설정 → **예시 데이터 전체 삭제** (실제 사용 시작)
5. 훈련생에게 안내할 주소: `https://lms.ttasa.co.kr/student`

## 이후 관리

| 언제 | 할 일 |
|---|---|
| 프로그램 수정 후 | 서버에서 `cd /root/ttasa && git pull && sudo bash lms/deploy/install.sh ttasa.co.kr lms.ttasa.co.kr` |
| 백업 확인 | `/opt/lms/backup/` 에 날짜별 파일. 한 달에 한 번 PC로 내려받기 (기관 설정 → 전체 백업 내려받기도 됨) |
| 안 열릴 때 | 서버에서 `systemctl restart lms caddy` |
| 도메인 만료 | ttasa.co.kr 2027-03-02, tasa.co.kr 2028-01-27. 가비아 자동연장 켜두기 |

## tasa.co.kr 은?

예비로 두거나, 가비아 DNS에서 ttasa.co.kr 로 넘어가게(포워딩) 설정. 지금은 안 써도 됩니다.
