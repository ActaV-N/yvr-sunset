# Cloudflare R2 Setup

영상/커버 이미지를 IG Graph API가 fetch할 수 있도록 R2에 호스팅한다. IG는 `video_url`을 cURL로 가져가므로 **공개 URL 필수**.

## 1. 계정 / 버킷

1. Cloudflare 대시보드 → **R2 Object Storage** → "Create bucket"
2. 버킷 이름: `yvr-sunset` (또는 .env의 `R2_BUCKET`)
3. Region: Automatic (R2는 single-region 아님)

## 2. 공개 노출

**옵션 A — 빠른 r2.dev URL (초기 개발용)**
1. 버킷 → Settings → "R2.dev subdomain" → Allow Access
2. 발급된 URL (예: `https://pub-abc123.r2.dev`)을 `.env`의 `R2_PUBLIC_BASE_URL`에 넣는다
3. ⚠️ r2.dev는 rate limit이 있고 SLA 없음. 운영 들어가면 옵션 B로.

**옵션 B — Custom domain (운영용)**
1. 버킷 → Settings → "Custom Domains" → "Connect Domain"
2. 본인 도메인(예: `cdn.yvr-sunset.app`)을 연결, Cloudflare가 자동으로 CNAME + SSL 발급
3. `R2_PUBLIC_BASE_URL=https://cdn.yvr-sunset.app`

## 3. API 토큰

1. R2 메인 → "Manage R2 API tokens" → "Create API token"
2. Permissions: **Object Read & Write**
3. Specify bucket: `yvr-sunset`만 선택 (다른 버킷 영향 방지)
4. TTL: Forever (시크릿이라 GH Secrets로 관리됨)
5. 발급 후 표시되는 값들을 `.env`에:
   ```
   R2_ACCOUNT_ID=<token 화면에 표시>
   R2_ACCESS_KEY_ID=<token 화면에 표시>
   R2_SECRET_ACCESS_KEY=<token 화면에 표시>
   ```

## 4. 검증

```bash
npm run daily:upload   # 렌더 + R2 업로드, IG 발행은 스킵
```

성공 시 로그에 `videoUrl` + `coverUrl` 출력. 브라우저에서 `videoUrl` 열어 영상 재생되면 OK.

## 키 네이밍

- 영상: `reels/YYYY-MM-DD.mp4`
- 커버: `reels/YYYY-MM-DD.jpg`
- 동일 날짜에 재실행 시 같은 키로 덮어쓴다 (idempotent). 그래서 `Cache-Control: immutable` 안전.

## 라이프사이클 (선택)

R2 비용 절감 위해 90일 지난 reel은 삭제하는 lifecycle rule 권장:
- 버킷 → Settings → Object Lifecycle → "Add rule"
- Prefix: `reels/`
- Action: "Delete objects" after 90 days

IG는 발행 후 자체 CDN으로 영상 복사하므로 R2 원본은 단기 호스팅 용도. 영구 보관 불필요.
