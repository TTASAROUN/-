#!/usr/bin/env bash
# ============================================================
# 따사로운 LMS 서버 설치 스크립트 (Ubuntu 22.04 / 24.04)
# 사용법:  sudo bash install.sh ttasa.co.kr lms.ttasa.co.kr
#   첫 번째 인자 = 홈페이지 주소, 두 번째 인자 = 업무 콘솔 주소
# 하는 일: Node.js·Caddy 설치 → /opt/lms 에 복사 → 자동 시작 등록
#          → HTTPS 자동 발급 → 매일 새벽 3시 데이터 백업
# ============================================================
set -euo pipefail
HOME_DOMAIN="${1:-}"; LMS_DOMAIN="${2:-}"
[ -z "$HOME_DOMAIN" ] && { echo "사용법: sudo bash install.sh 홈페이지주소 콘솔주소   예) sudo bash install.sh ttasa.co.kr lms.ttasa.co.kr"; exit 1; }
[ -z "$LMS_DOMAIN" ] && LMS_DOMAIN="lms.$HOME_DOMAIN"
[ "$(id -u)" -eq 0 ] || { echo "sudo 로 실행하세요"; exit 1; }
SRC="$(cd "$(dirname "$0")/.." && pwd)"

echo "== 1/5 Node.js 설치"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  apt-get update -y && apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v

echo "== 2/5 Caddy(HTTPS 자동) 설치"
if ! command -v caddy >/dev/null 2>&1; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -y && apt-get install -y caddy
fi

echo "== 3/5 프로그램 복사 (/opt/lms)"
mkdir -p /opt/lms
rsync -a --delete --exclude data "$SRC/" /opt/lms/ 2>/dev/null || cp -r "$SRC/." /opt/lms/
mkdir -p /opt/lms/data /opt/lms/backup
id -u lms >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin -d /opt/lms lms
chown -R lms:lms /opt/lms

echo "== 4/5 자동 시작 등록"
sed "s|__PORT__|3000|" "$SRC/deploy/lms.service" > /etc/systemd/system/lms.service
systemctl daemon-reload && systemctl enable --now lms
sed -e "s|__HOME__|$HOME_DOMAIN|g" -e "s|__LMS__|$LMS_DOMAIN|g" "$SRC/deploy/Caddyfile" > /etc/caddy/Caddyfile
systemctl restart caddy

echo "== 5/5 매일 새벽 3시 백업 (30일 보관)"
cat > /etc/cron.daily/lms-backup <<'CRON'
#!/bin/sh
d=$(date +%F); cp /opt/lms/data/db.json /opt/lms/backup/db-$d.json 2>/dev/null
tar czf /opt/lms/backup/uploads-$d.tgz -C /opt/lms/data uploads 2>/dev/null
find /opt/lms/backup -mtime +30 -delete
CRON
chmod +x /etc/cron.daily/lms-backup

echo
echo "설치 완료."
echo "  홈페이지:   https://$HOME_DOMAIN"
echo "  업무 콘솔:  https://$LMS_DOMAIN      (초기 계정 admin / 1234 → 즉시 변경)"
echo "  훈련생:     https://$LMS_DOMAIN/student"
echo "가비아 DNS에서 $HOME_DOMAIN 과 $LMS_DOMAIN 의 A 레코드가 이 서버 IP($(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}'))를 가리켜야 합니다."
echo "상태 확인: systemctl status lms caddy    로그: journalctl -u lms -f"
