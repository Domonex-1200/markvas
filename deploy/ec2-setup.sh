#!/bin/bash
# EC2 초기 세팅 스크립트 (Amazon Linux 2023 기준)
# 루트로 실행: sudo bash ec2-setup.sh

set -e

echo "=== 1. 시스템 업데이트 ==="
dnf update -y

echo "=== 2. Java 21 설치 ==="
dnf install -y java-21-amazon-corretto-headless

echo "=== 3. Nginx 설치 ==="
dnf install -y nginx
systemctl enable nginx

echo "=== 4. 앱 디렉터리 생성 ==="
mkdir -p /opt/markvas
useradd -r -s /sbin/nologin markvas 2>/dev/null || true
chown markvas:markvas /opt/markvas

echo "=== 5. Systemd 서비스 등록 ==="
cat > /etc/systemd/system/markvas.service << 'EOF'
[Unit]
Description=MarkVas Spring Boot API
After=network.target

[Service]
User=markvas
WorkingDirectory=/opt/markvas
ExecStart=/usr/bin/java \
  -Dspring.profiles.active=prod \
  -DPORT=8080 \
  -jar /opt/markvas/app.jar
EnvironmentFile=/opt/markvas/.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable markvas

echo "=== 완료. 다음 단계: ==="
echo "  1. /opt/markvas/.env 파일 작성 (DB_PASSWORD, JWT secrets 등)"
echo "  2. app.jar 업로드 후: systemctl start markvas"
echo "  3. Nginx 설정 복사 후: systemctl start nginx"
