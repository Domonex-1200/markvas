# MarkVas AWS 배포 가이드

## 전체 구성

```
사용자 → CloudFront → S3 (React SPA)
사용자 → Route 53 → ALB/EC2 (Spring Boot API)
                        ↓
                    RDS MySQL 8.0
```

---

## 1. RDS (MySQL) 생성

1. AWS Console → RDS → 데이터베이스 생성
2. 엔진: **MySQL 8.0**
3. 인스턴스: `db.t3.micro` (프리티어)
4. DB 이름: `markdowncanvas`
5. 마스터 사용자: `markvas`
6. 비밀번호: 안전한 랜덤 비밀번호 설정 (저장해 두세요)
7. VPC: EC2와 같은 VPC, **퍼블릭 액세스 없음**
8. 보안그룹: EC2 보안그룹에서 3306 포트 인바운드 허용

---

## 2. EC2 생성

1. AMI: **Amazon Linux 2023**
2. 인스턴스: `t3.small` (최소 권장)
3. 키 페어: 새로 생성 후 PEM 저장
4. 보안그룹 인바운드:
   - 22 (SSH) — 내 IP만
   - 80 (HTTP) — 0.0.0.0/0
   - 443 (HTTPS) — 0.0.0.0/0
5. 탄력적 IP 할당 및 연결

### EC2 초기화

```bash
# 로컬에서 실행
scp -i markvas.pem deploy/ec2-setup.sh ec2-user@<EC2-IP>:~
ssh -i markvas.pem ec2-user@<EC2-IP>
sudo bash ec2-setup.sh
```

### 환경변수 파일 작성

```bash
sudo nano /opt/markvas/.env
```

내용 (`deploy/ec2-env.example` 참고):
```
DB_HOST=<RDS-엔드포인트>
DB_USERNAME=markvas
DB_PASSWORD=<RDS-비밀번호>
JWT_ACCESS_SECRET=<랜덤 64자>
JWT_REFRESH_SECRET=<랜덤 64자>
CORS_ORIGINS=https://<CloudFront-도메인>
SEED_DATA=true
```

### Nginx 설정 복사

```bash
scp -i markvas.pem deploy/nginx.conf ec2-user@<EC2-IP>:~
ssh -i markvas.pem ec2-user@<EC2-IP>
sudo cp nginx.conf /etc/nginx/conf.d/markvas.conf
sudo systemctl start nginx
```

---

## 3. 첫 배포

```bash
EC2_HOST=<EC2-IP> EC2_KEY=~/.ssh/markvas.pem bash deploy/deploy-backend.sh
```

배포 후 확인:
```bash
curl http://<EC2-IP>/api/assets
```

---

## 4. S3 + CloudFront (프론트엔드)

### S3 버킷 생성

```bash
aws s3 mb s3://markvas-frontend --region ap-northeast-2
aws s3 website s3://markvas-frontend --index-document index.html --error-document index.html
```

버킷 정책 (퍼블릭 읽기 — CloudFront OAC 사용 시 불필요):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::markvas-frontend/*"
  }]
}
```

### CloudFront 배포

1. Origin: S3 버킷
2. Default root object: `index.html`
3. Custom error response: 404 → `/index.html` (200) — SPA 라우팅 필수
4. HTTPS 강제 리디렉션 활성화
5. 생성 완료 후 Distribution ID 메모

### 프론트엔드 배포

```bash
S3_BUCKET=markvas-frontend CF_DIST_ID=<CF-ID> \
VITE_API_BASE_URL=http://<EC2-IP>/api \
bash deploy/deploy-frontend.sh
```

---

## 5. Route 53 + HTTPS (선택)

1. Route 53에서 호스팅 영역 생성
2. ACM(Certificate Manager)에서 인증서 발급 (us-east-1 리전 — CloudFront 필수)
3. CloudFront에 커스텀 도메인 + 인증서 연결
4. Route 53 A 레코드 → CloudFront 도메인
5. API 도메인(api.yourdomain.com) → EC2 ALB 또는 탄력적 IP

---

## 6. GitHub Actions 자동 배포 (CI/CD)

`.github/workflows/deploy.yml` 사용 — `main` 브랜치 push 시 자동 실행

GitHub Secrets 설정 (Settings → Secrets → Actions):

| Secret | 값 |
|--------|-----|
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_SSH_KEY` | PEM 파일 내용 전체 |
| `AWS_ACCESS_KEY_ID` | IAM 키 |
| `AWS_SECRET_ACCESS_KEY` | IAM 시크릿 |
| `AWS_REGION` | ap-northeast-2 |
| `S3_BUCKET` | markvas-frontend |
| `CF_DIST_ID` | CloudFront Distribution ID |
| `VITE_API_BASE_URL` | https://api.yourdomain.com/api |

---

## 빠른 참고: 유용한 명령어

```bash
# EC2에서 서비스 로그 확인
sudo journalctl -u markvas -f

# 백엔드 헬스 체크
curl http://localhost:8080/api/assets

# MySQL 접속 (RDS)
mysql -h <RDS-엔드포인트> -u markvas -p markdowncanvas
```
