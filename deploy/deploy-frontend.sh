#!/bin/bash
# 프론트엔드 S3 + CloudFront 배포 스크립트
# 사전 요구사항: aws cli 설치 & 자격증명 설정
#
# 사용법:
#   S3_BUCKET=your-bucket-name CF_DIST_ID=E1ABCDEF bash deploy-frontend.sh

set -e

: "${S3_BUCKET:?S3_BUCKET 환경변수를 설정하세요}"
: "${CF_DIST_ID:?CF_DIST_ID(CloudFront Distribution ID)를 설정하세요}"

FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"

echo "=== 1. 빌드 ==="
cd "$FRONTEND_DIR"
npm ci
VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://api.yourdomain.com}" npm run build

echo "=== 2. S3 업로드 (cache-control 분리) ==="
# HTML: no-cache (항상 최신 버전 받도록)
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --exclude "*" --include "*.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --delete

# JS/CSS/이미지: 1년 캐시 (해시가 파일명에 포함되므로 안전)
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable" \
  --delete

echo "=== 3. CloudFront 캐시 무효화 ==="
aws cloudfront create-invalidation \
  --distribution-id "${CF_DIST_ID}" \
  --paths "/*"

echo "=== 배포 완료 ==="
