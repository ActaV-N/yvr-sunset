# kokio.yvr

밴쿠버 데일리 콘텐츠 IG 릴스 자동 발행 시스템. Kokio 패밀리 sub-brand, 시각 정체성은 독립 (`docs/BRAND.md` 참조).

첫 feature: 오늘의 일몰 시각 · 점수 · 명당 추천. 향후 tide/moon/seasonal 등 확장 예정.

- IG: [@kokio.yvr](https://www.instagram.com/kokio.yvr)
- 발행 주기: 매일 1회, UTC 22:00 (≈ PDT 15:00 / PST 14:00)

## 파이프라인

```
Sunrise-Sunset.org + Open-Meteo  →  점수 + 명당
                                         ↓
                              Unsplash 사진 (캐시)
                                         ↓
                       Remotion 렌더 1080×1920 · 12s · AAC
                                         ↓
                              Cloudflare R2 업로드
                                         ↓
                        IG Graph API (3-step container)
```

## Setup

| 작업 | 문서 | 소요 |
|------|------|------|
| 브랜드 시스템 (색 · 타입 · 모션 · 오디오 · 캡션) | [docs/BRAND.md](docs/BRAND.md) | 읽기만 |
| Cloudflare R2 버킷 + API 토큰 | [docs/R2_SETUP.md](docs/R2_SETUP.md) | 5분 |
| Instagram 비즈니스 계정 + long-lived 토큰 | [docs/IG_SETUP.md](docs/IG_SETUP.md) | 15분 |
| Unsplash Access Key | https://unsplash.com/developers | 2분 |

`.env.example`를 `.env`로 복사 후 위 4곳에서 받은 값 채우기.

## Scripts

| 명령 | 동작 |
|------|------|
| `npm run daily -- inspect` | 오늘 데이터 + 캡션 미리보기 (렌더X) |
| `npm run daily:dry` | 렌더만, `out/yvr-sunset-{date}.mp4` 생성 |
| `npm run daily:upload` | 렌더 + R2 업로드, IG 발행 스킵 |
| `npm run daily` | 풀 파이프라인 (렌더→업로드→발행) |
| `npm run render:preview` | Remotion Studio (디자인 튜닝용) |

## 프로젝트 레이아웃

```
src/
├── brand/        # 색·타입·이징·레이아웃 토큰 (single source of truth)
├── data/         # Sunrise-Sunset + Open-Meteo 클라이언트
├── scoring/      # 노을 점수 휴리스틱 (0–100 + label)
├── spots/        # 밴쿠버 8개 명당 + 한글명 + 일별 결정론적 로테이션
├── photos/       # Unsplash 페처 (public/spots/에 캐시)
├── audio/        # 트랙 로테이션 (public/audio/*.mp3)
├── caption/      # KR/EN 이중 캡션 빌더
├── remotion/     # 컴포지션 + scenes/
├── publish/      # R2 업로더 + IG Graph API + 토큰 만료 체크
└── cli.ts        # Orchestrator

public/
├── logo_transparent.png   # 로고 (top-left masthead)
├── spots/                 # 캐시된 Unsplash 사진 + attribution json
└── audio/                 # 무료 라이선스 BGM mp3 (라이선스 자체 책임)

docs/
├── BRAND.md
├── R2_SETUP.md
└── IG_SETUP.md
```

## 배포 (Railway cron)

`kokio_v2` 패밀리(style-api 등)와 동일한 Railway cron 패턴.

### 파일

```
nixpacks.toml              # Chrome Headless Shell 시스템 deps + build 시점 pre-bake
railway.daily-cron.toml    # 일몰 cron service config (cron + startCommand)
scripts/warmup.ts          # ensureBrowser() — image 빌드 시 Chrome 다운로드
```

`nixpacks.toml`은 두 가지 일을 함:
1. **apt 패키지** — `libnss3` `libgbm1` 등 Chromium 의존성
2. **build 페이즈에 `npx tsx scripts/warmup.ts` 실행** — Chrome Headless Shell(~93MB)을 이미지에 박아둠. 안 하면 cron tick마다 재다운로드 + 30s overhead + remotion.dev CDN 의존.

`railway.daily-cron.toml`이 cron 스케줄(`0 22 * * *` UTC = PDT 15:00 / PST 14:00)과 `startCommand = "npm run daily"` 정의.

### Railway 서비스 셋업

1. Railway 대시보드 → New Project → repo 연결
2. Service 추가: **yvr-sunset-daily-cron**
   - Settings → Service Type: **Cron**
   - Settings → Config Path: `yvr-sunset/railway.daily-cron.toml` (모노레포) 또는 `railway.daily-cron.toml` (단독 repo)
3. Service Variables에 시크릿 8개 등록 (아래 표)
4. Deploy → 첫 빌드에서 nixpacks가 apt + warmup 처리, 이미지에 Chrome 박힘
5. Cron 자동 트리거 또는 대시보드에서 "Run now"로 수동 발행

### Service Variables (Railway 시크릿)

| Variable | 출처 |
|----------|------|
| `IG_USER_ID` | [IG_SETUP §4](docs/IG_SETUP.md) |
| `IG_ACCESS_TOKEN` | [IG_SETUP §5](docs/IG_SETUP.md) (60일 long-lived) |
| `IG_GRAPH_VERSION` | `v23.0` (또는 생략 — 코드 디폴트) |
| `R2_ACCOUNT_ID` | [R2_SETUP §3](docs/R2_SETUP.md) |
| `R2_ACCESS_KEY_ID` | [R2_SETUP §3](docs/R2_SETUP.md) |
| `R2_SECRET_ACCESS_KEY` | [R2_SETUP §3](docs/R2_SETUP.md) |
| `R2_BUCKET` | 버킷명 (예: `yvr-sunset`) |
| `R2_PUBLIC_BASE_URL` | [R2_SETUP §2](docs/R2_SETUP.md) |
| `UNSPLASH_ACCESS_KEY` | https://unsplash.com/developers |

### 수동 발행 / 디버그

- **Railway 대시보드 → Cron Jobs → Run now**: 다음 tick 안 기다리고 즉시 1회 실행
- 로컬에서 `npm run daily:upload`(R2까지) 또는 `npm run daily`(전체)로 그대로 검증 가능 — Railway 환경과 동일한 코드

### 실패 처리

Railway logs에서 실패 확인 + Project Settings → Integrations로 Discord/Slack webhook 연결 가능. cron tick이 실패해도 다음 tick은 정상 시도 (state 없음, idempotent).

## 토큰 만료

`IG_ACCESS_TOKEN`은 60일마다 만료. **자동 갱신 안 함** (kokio_v2 패밀리 정책 — `kokio.style`/`core-api`/`style-api` 모두 동일). 매일 파이프라인 시작 시 `debug_token`으로 남은 일수 체크 → 14일 이내면 Railway logs에 `⚠️ IG_ACCESS_TOKEN expires in N days` warn 출력. 만료 전 [docs/IG_SETUP.md §8](docs/IG_SETUP.md) 절차로 수동 갱신 후 Railway Variables의 `IG_ACCESS_TOKEN` 교체.

## 라이선스

코드는 비공개. `public/spots/*` 이미지는 [Unsplash License](https://unsplash.com/license), `public/audio/*` 트랙은 각 트랙 라이선스 명세(`public/audio/{filename}.json` 참조) 따름.
