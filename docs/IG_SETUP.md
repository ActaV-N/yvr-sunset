# Instagram 발행 셋업

`kokio.yvr` IG 계정에 자동 발행하기 위한 1회성 셋업. 셋업 끝나면 `npm run daily` 한 번에 캡션 포함 자동 게시.

## 1. IG 계정 준비

1. IG 앱에서 `kokio.yvr` 계정 신규 생성 (이미 만들었으면 스킵)
2. 설정 → 계정 → **비즈니스 계정으로 전환**
   - 카테고리는 "Local Service" 또는 "Travel Company" 정도
3. 비즈니스 계정은 Facebook 페이지에 연결되어야 함:
   - 본인 Facebook → 새 페이지 생성 (이름 자유, 카테고리 "Brand")
   - IG 설정 → "Facebook과 연결" → 방금 만든 페이지 선택

## 2. Meta 개발자 앱 만들기

기존 앱이 있으면 같은 앱에 권한 추가, 없으면 신규.

1. https://developers.facebook.com → My Apps → Create App
2. App Type: **Business**
3. Use case: "Other" → Next
4. App name: `kokio-yvr` (사용자에게만 보임)
5. Add product → **Instagram Graph API** (또는 "Instagram → API setup with Instagram login")
6. Add product → **Facebook Login** (토큰 갱신용)

앱은 **Development mode** 그대로 유지. 본인 계정에만 발행하는 거라 App Review 불필요.

## 3. 페이지 + IG 계정을 앱에 연결

1. Meta for Developers → 좌측 메뉴 "Roles" → "Roles" 탭
   - Instagram Testers에 본인 IG 계정 추가
   - 본인 IG 앱에서 알림 받아 수락
2. App Dashboard → Instagram → API setup 화면에서 페이지 + IG 계정 연결 상태 확인

## 4. IG_USER_ID 얻기

Graph API Explorer (https://developers.facebook.com/tools/explorer/)에서:

1. 우측 상단 앱 선택 → `kokio-yvr`
2. User token 발급 (권한: `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`)
3. 쿼리 입력: `me/accounts` → Submit
   - 결과에서 본인 Facebook 페이지의 `id`와 `access_token` 메모
4. 쿼리 변경: `{page-id}?fields=instagram_business_account` → Submit
   - 결과의 `instagram_business_account.id`가 **IG_USER_ID**

## 5. Long-lived Access Token 얻기

기본 User token은 1~2시간 만료. 60일짜리 long-lived token으로 교환:

```
GET https://graph.facebook.com/v23.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={앱 ID}
  &client_secret={앱 Secret}
  &fb_exchange_token={4단계의 User token}
```

브라우저 주소창에 그대로 붙여넣어도 됨. 결과 JSON의 `access_token`이 **IG_ACCESS_TOKEN**.

> 앱 Secret은 App Dashboard → Settings → Basic → App Secret (Show 클릭).

## 6. .env 채우기

```
IG_USER_ID=<5단계 instagram_business_account.id>
IG_ACCESS_TOKEN=<6단계 long-lived token>
IG_GRAPH_VERSION=v23.0
```

## 7. 검증

먼저 inspect로 캡션 미리보기:
```bash
npm run daily -- inspect
```

다음 토큰 만료 일수 + 풀 파이프라인:
```bash
npm run daily
```

성공 시 로그:
- `ig token healthy` (또는 `expires in N days`)
- `ig container created` `id: xxx`
- `ig container status` `attempt: N status: FINISHED`
- `ig media published`
- `ig permalink` `https://www.instagram.com/reel/...`

permalink 열어서 게시 확인되면 셋업 완료.

## 8. 토큰 만료

60일 후 `IG_ACCESS_TOKEN`이 만료된다. **자동 갱신 안 한다** (kokio_v2 정책). 매일 파이프라인 시작 시 `debug_token` 확인하여 14일 이내 만료면 `pino.warn` 로그가 떨어진다 (GH Actions 워크플로우 로그에서 확인). 만료되기 전에:

1. Graph API Explorer에서 새 User token 발급
2. 위 5단계 반복하여 새 long-lived token 받기
3. `.env` 또는 GH Secret의 `IG_ACCESS_TOKEN` 교체

## 문제 해결

| 증상 | 원인 |
|------|------|
| `container ... ERROR` `media file is invalid or corrupted` | R2 URL이 fetch 안 됨. R2 버킷 public 설정 확인 |
| `container ... ERROR` `media must be 9:16` | 영상 비율 문제 — 우리는 1080×1920이라 정상이지만 확인 |
| `(#10) Application does not have permission` | IG_ACCESS_TOKEN에 `instagram_content_publish` 권한 없음 → Graph Explorer에서 권한 재발급 |
| `container not ready after 8 attempts` | IG 처리 지연 (드물게 5분+). `POLL_DELAYS_SEC` 늘리거나 R2 영상 용량 줄이기 |
