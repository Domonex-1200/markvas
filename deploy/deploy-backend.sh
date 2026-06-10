#!/bin/bash
# 백엔드 EC2 배포 스크립트
# 사용법:
#   EC2_HOST=ec2-xx-xx-xx-xx.compute-1.amazonaws.com \
#   EC2_KEY=~/.ssh/markvas.pem \
#   bash deploy-backend.sh

set -e

: "${EC2_HOST:?EC2_HOST 환경변수를 설정하세요}"
: "${EC2_KEY:?EC2_KEY(PEM 파일 경로)를 설정하세요}"

BACKEND_DIR="$(cd "$(dirname "$0")/../backend" && pwd)"

echo "=== 1. JAR 빌드 ==="
cd "$BACKEND_DIR"
./gradlew bootJar --no-daemon -q
JAR=$(ls build/libs/*.jar | head -1)
echo "빌드된 JAR: $JAR"

echo "=== 2. EC2로 업로드 ==="
scp -i "$EC2_KEY" -o StrictHostKeyChecking=no "$JAR" "ec2-user@${EC2_HOST}:/opt/markvas/app.jar"

echo "=== 3. 서비스 재시작 ==="
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "ec2-user@${EC2_HOST}" \
  "sudo systemctl restart markvas && sleep 3 && sudo systemctl status markvas --no-pager"

echo "=== 배포 완료 ==="
