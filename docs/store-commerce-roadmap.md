# Store Commerce Roadmap

## 목표

MarkVas Store는 단순 에셋 목록이 아니라 데스크탑 앱을 배포하고, 검증된 제작자가 테마, 템플릿, 플러그인을 등록하며, 사용자가 구매하거나 설치해서 데스크탑 앱에 동기화하는 마켓플레이스로 발전시킨다.

## 사용자 역할

- `USER`: 에셋 탐색, 찜하기, 장바구니, 구매, 설치, 리뷰 작성
- `DEVELOPER`: 에셋 등록, 버전 업로드, 판매 현황 확인
- `ADMIN`: 판매자 승인, 에셋 심사, 신고 처리, 강제 비공개, 앱 릴리스 관리

## 에셋 생명주기

1. 제작자가 에셋 초안을 등록한다.
2. 에셋은 `DRAFT` 상태로 저장된다.
3. 제작자가 심사를 요청하면 `IN_REVIEW`가 된다.
4. 관리자가 보안, metadata, 스크린샷, 가격, manifest를 검수한다.
5. 승인 시 `PUBLISHED`, 반려 시 `REJECTED`가 된다.
6. 구매 또는 무료 설치 후 사용자의 라이브러리에 들어간다.
7. 데스크탑 앱은 사용자의 라이브러리에서 설치 가능한 에셋만 동기화한다.

## 핵심 도메인 모델

```text
User
SellerProfile
Asset
AssetVersion
AssetReviewSubmission
AssetMedia
WishlistItem
Cart
CartItem
Order
OrderItem
Entitlement
Download
AppRelease
```

`Asset`은 제품 페이지의 안정적인 식별자이고, 실제 다운로드/설치 단위는 `AssetVersion`이다. 구매 권한은 `Entitlement`로 분리한다. 사용자가 구매한 뒤 최신 버전을 받을 수 있는지는 `Entitlement`와 `AssetVersion`의 호환성으로 판단한다.

## 구매와 이용 권한

- 무료 에셋은 설치 시 바로 `Entitlement`를 생성한다.
- 유료 에셋은 주문 결제 성공 후 `Entitlement`를 생성한다.
- 장바구니는 구매 전 임시 묶음이고, 찜하기는 구매 의도 표시다.
- 데스크탑 동기화 API는 설치 이력이 아니라 `Entitlement` 기준으로 접근 가능한 에셋만 내려준다.

## 제품 소개와 다운로드

스토어 홈은 다음 진입점을 제공한다.

- 메모앱 소개
- Windows/macOS/Linux 다운로드
- 최신 릴리스 노트
- 에셋 마켓플레이스
- 개발자 등록 안내

데스크탑 앱 업데이트는 `AppRelease`를 기준으로 제공한다.

```text
AppRelease
- version
- platform
- channel: stable | beta
- downloadUrl
- checksum
- signature
- releaseNotes
- publishedAt
```

상용 배포에서는 자동 업데이트가 서명된 릴리스와 checksum 검증을 통과한 파일만 설치해야 한다.

## 다음 API 후보

- `POST /seller/apply`
- `POST /assets`
- `POST /assets/:id/submit-review`
- `POST /admin/assets/:id/approve`
- `POST /wishlist/:assetId`
- `POST /cart/items`
- `POST /orders/checkout`
- `GET /library/assets`
- `GET /downloads/assets/:assetVersionId`
- `GET /app/releases/latest?platform=windows&channel=stable`

## 현재 구현과의 연결

현재의 `UserAsset` 설치 이력은 초기 MVP용이다. 상거래 기능을 붙일 때는 `Entitlement`를 추가하고, 기존 `GET /assets/me/installed`는 라이브러리/권한 기반 응답으로 점진적으로 전환한다.

데스크탑 앱의 에셋 동기화, 템플릿 설치, 플러그인 manifest 실행 구조는 이 전환 이후에도 그대로 유지한다.
