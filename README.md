# kokio.yvr

밴쿠버 데일리 콘텐츠 IG 릴스 자동 발행 시스템. Kokio 패밀리 sub-brand, 시각 정체성은 독립 (`docs/BRAND.md` 참조).

Features:
- **Sunset** (매일 UTC 22:00) — 오늘의 일몰 시각·점수·명당 추천
- **Event** (주 1회, 목요일 UTC 23:00) — 다음 7일 음악·예술 이벤트 큐레이션 (Ticketmaster Discovery API)

향후: tide / moon / seasonal 등 확장 예정.

- IG: [@kokio.yvr](https://www.instagram.com/kokio.yvr)

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
| 브랜드 시스템 (색 · 타입 · 모션 · 오디오 · 캡션 · safe area · 사진 가독성) | [docs/BRAND.md](docs/BRAND.md) | 읽기만 |
| Cloudflare R2 버킷 + API 토큰 | [docs/R2_SETUP.md](docs/R2_SETUP.md) | 5분 |
| Instagram 비즈니스 계정 + long-lived 토큰 | [docs/IG_SETUP.md](docs/IG_SETUP.md) | 15분 |
| Unsplash Access Key (sunset 명당 사진) | https://unsplash.com/developers | 2분 |
| Ticketmaster Consumer Key (event 큐레이션) | [docs/EVENTS.md §1](docs/EVENTS.md) | 2분 |

`.env.example`를 `.env`로 복사 후 위 5곳에서 받은 값 채우기.

## Scripts

### Sunset (매일)
| 명령 | 동작 |
|------|------|
| `npm run daily -- inspect` | 오늘 데이터 + 캡션 미리보기 (렌더X) |
| `npm run daily:dry` | 렌더만, `out/yvr-sunset-{date}.mp4` 생성 |
| `npm run daily:upload` | 렌더 + R2 업로드, IG 발행 스킵 |
| `npm run daily` | 풀 파이프라인 (렌더→업로드→발행) |

### Event (주 1회)
| 명령 | 동작 |
|------|------|
| `npm run event -- inspect` | 다음 7일 이벤트 1건 선정 + 캡션 미리보기 |
| `npm run event:dry` | 렌더만, `out/yvr-event-{event-date}.mp4` |
| `npm run event:upload` | 렌더 + R2 업로드, IG 발행 스킵 |
| `npm run event` | 풀 파이프라인 |

### 공통
| 명령 | 동작 |
|------|------|
| `npm run render:preview` | Remotion Studio (디자인 튜닝용) |

## 프로젝트 레이아웃

```
src/
├── brand/        # 색·타입·이징·safe area·photo overlay·shadow 토큰 (single source)
├── data/         # Sunrise-Sunset + Open-Meteo 클라이언트 (sunset)
├── scoring/      # 노을 점수 휴리스틱 (0–100 + label) (sunset)
├── spots/        # 밴쿠버 8개 명당 + 한글명 + 일별 결정론적 로테이션 (sunset)
├── feeds/        # Ticketmaster Discovery API 클라이언트 (event)
├── events/       # CuratedEvent + 결정론적 큐레이션 + BLOCKED_KEYWORDS (event)
├── photos/       # Unsplash 페처(spots) + Ticketmaster 캐시(events)
├── audio/        # 트랙 로테이션 (public/audio/{sunset,event}/*.mp3)
├── caption/      # KR/EN 이중 캡션 빌더 (sunset · event)
├── remotion/     # SunsetReel + EventReel + scenes/
├── publish/      # R2 업로더 + IG Graph API + 토큰 만료 체크
└── cli.ts        # Orchestrator (--type sunset|event)

public/
├── logo_transparent.png   # 로고 (top-left masthead)
├── spots/                 # 캐시된 Unsplash 사진 + attribution json
├── events/                # 캐시된 Ticketmaster 이미지 (eventId.jpg)
└── audio/
    ├── sunset/*.mp3
    └── event/*.mp3

docs/
├── BRAND.md       # 브랜드 시스템 (10개 섹션, single source of truth)
├── R2_SETUP.md
├── IG_SETUP.md
└── EVENTS.md      # Ticketmaster 통합 + 큐레이션 정책
```

## 배포 (Railway cron)

`kokio_v2` 패밀리(style-api 등)와 동일한 Railway cron 패턴. **Feature 별 1개씩 총 2개 cron service** 가 같은 코드/이미지를 공유.

### 파일

```
nixpacks.toml                       # Chrome Headless Shell 시스템 deps + build 시점 pre-bake (공용)
scripts/warmup.ts                   # ensureBrowser() — image 빌드 시 Chrome 다운로드
railway.daily-cron.toml             # Sunset cron (매일 UTC 22:00)
railway.event-weekly-cron.toml      # Event cron (주 1회, 목요일 UTC 23:00)
```

`nixpacks.toml`은 두 service 가 공통으로 사용:
1. **apt 패키지** — `libnss3` `libgbm1` 등 Chromium 의존성
2. **build 페이즈에 `npx tsx scripts/warmup.ts` 실행** — Chrome Headless Shell(~93MB)을 이미지에 박아둠. 안 하면 cron tick마다 재다운로드 + 30s overhead + remotion.dev CDN 의존.

### Railway 서비스 셋업

Railway 대시보드 → New Project → repo 연결 후 **2개 service** 생성:

| Service 이름 | Type | Config Path | Cron |
|-------------|------|-------------|------|
| `yvr-sunset-daily-cron` | Cron | `yvr-sunset/railway.daily-cron.toml` | `0 22 * * *` |
| `yvr-sunset-event-weekly-cron` | Cron | `yvr-sunset/railway.event-weekly-cron.toml` | `0 23 * * 4` |

(단독 repo 라면 경로 prefix `yvr-sunset/` 생략.)

각 service Settings → Variables 에 아래 시크릿 등록. 두 service 가 같은 Variables 셋을 쓰므로 Project 공통 Variables 활용 권장.

### Service Variables (Railway 시크릿)

| Variable | 사용 | 출처 |
|----------|------|------|
| `IG_USER_ID` | 공통 | [IG_SETUP §4](docs/IG_SETUP.md) |
| `IG_ACCESS_TOKEN` | 공통 | [IG_SETUP §5](docs/IG_SETUP.md) (60일 long-lived) |
| `IG_GRAPH_VERSION` | 공통 | `v23.0` (또는 생략 — 코드 디폴트) |
| `R2_ACCOUNT_ID` | 공통 | [R2_SETUP §3](docs/R2_SETUP.md) |
| `R2_ACCESS_KEY_ID` | 공통 | [R2_SETUP §3](docs/R2_SETUP.md) |
| `R2_SECRET_ACCESS_KEY` | 공통 | [R2_SETUP §3](docs/R2_SETUP.md) |
| `R2_BUCKET` | 공통 | 버킷명 (예: `yvr-sunset`) |
| `R2_PUBLIC_BASE_URL` | 공통 | [R2_SETUP §2](docs/R2_SETUP.md) |
| `UNSPLASH_ACCESS_KEY` | Sunset | https://unsplash.com/developers |
| `TICKETMASTER_API_KEY` | Event | [EVENTS §1](docs/EVENTS.md) |

### 수동 발행 / 디버그

- **Railway 대시보드 → Cron Jobs → Run now**: 다음 tick 안 기다리고 즉시 1회 실행
- 로컬에서 동일 검증 가능 (Railway 환경과 동일한 코드):
  - Sunset: `npm run daily:upload` (R2까지) → `npm run daily` (전체)
  - Event: `npm run event:upload` → `npm run event`

### 실패 처리

Railway logs에서 실패 확인 + Project Settings → Integrations로 Discord/Slack webhook 연결 가능. cron tick이 실패해도 다음 tick은 정상 시도 (state 없음, idempotent).

Event cron 의 경우 발행 시점에 자격 통과 이벤트가 0건이면 `NoEventsAvailableError` throw → exit 1 → 그 주 skip. 다음 주 cron 에서 재시도.

## 토큰 만료

`IG_ACCESS_TOKEN`은 60일마다 만료. **자동 갱신 안 함** (kokio_v2 패밀리 정책 — `kokio.style`/`core-api`/`style-api` 모두 동일). 매일 파이프라인 시작 시 `debug_token`으로 남은 일수 체크 → 14일 이내면 Railway logs에 `⚠️ IG_ACCESS_TOKEN expires in N days` warn 출력. 만료 전 [docs/IG_SETUP.md §8](docs/IG_SETUP.md) 절차로 수동 갱신 후 Railway Variables의 `IG_ACCESS_TOKEN` 교체.

## 라이선스

코드는 비공개. `public/spots/*` 이미지는 [Unsplash License](https://unsplash.com/license), `public/audio/*` 트랙은 각 트랙 라이선스 명세(`public/audio/{filename}.json` 참조) 따름.
