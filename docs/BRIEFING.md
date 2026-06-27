# Weekly Briefing — Multi-scene + TTS Reel

`kokio.yvr`의 세 번째 feature. 일요일 저녁(PDT 19:00) 발행되는 30–45초 multi-scene reel. EN voice + KR on-screen 자막. 한 주 회고(지난 주 최고 일몰) + 다음 주말 이벤트 2–3건 디지스트.

기존 sunset(매일 12s) + event(주1회 12s)와 다른 포맷이지만 같은 브랜드 시스템(`BRAND.md`) + 같은 R2 + 같은 IG.

## 1. ElevenLabs TTS 셋업

### API 키 발급 (무료 tier)
1. https://elevenlabs.io → Sign in / Register (Google 등)
2. 우측 상단 Profile → "API Keys" → "Create API Key"
3. **Permissions**: **Text to Speech** 만 체크 (다른 권한 모두 해제)
4. **Credit limit**: 5,000 credits/month 정도 (우리 실제 사용 ~1,300, 폭주 안전망)
5. 발급된 키를 `.env` / Railway Variables 의 `ELEVENLABS_API_KEY` 에 저장

### Voice ID 선택
Free tier API는 **default voices만** 사용 가능 (voice library는 paid). 후보:

| Voice | ID | 톤 |
|-------|-----|----|
| **George** | `JBFqnCBsd6RMkjVDRZzb` | deep male, authoritative — **editorial 톤 fit** |
| Aria | `9BWtsMINqrJLrRacOk9x` | warm female, conversational |
| Roger | `CwhRBWXzGAHq8TQ4Fs17` | mid male, friendly |
| Brian | `nPczCjzI2devNBz1zQrb` | deep male, narration |
| Sarah | `EXAVITQu4vr4xnSDxMaL` | clear female, news-anchor |

`.env` 의 `ELEVENLABS_VOICE_ID` 에 ID 입력. 운영 중 voice 교체 시 R2 voice cache가 같은 텍스트라도 새 voice ID 로 hash 가 달라져 자동 재생성.

### 비용
- Free tier: 10,000 chars/month — 우리 실제 ~1,300 chars/month
- 같은 스크립트(intro/outro 등 고정 멘트)는 첫 주 후 영구 R2 cache hit → 매주 새 호출은 sunset 요약 + event 3개 ≈ 200 chars
- 한도 초과 안 됨. **사실상 무료.**

ElevenLabs ToS 상 free tier 사용 시 "Voice by ElevenLabs" attribution 필요 → 캡션에 자동 포함 (`src/caption/briefing-caption.ts`).

## 2. 콘텐츠 구성

### Scene 구조 (35–45초)
1. **Intro** (~3s) — "This week in Vancouver" + week label
2. **Sunset week** (~8–10s) — 지난 7일 중 최고 점수 일 + spot 사진
3. **Event ×2–3** (~5–7s each) — 다음 주말 큐레이션 이벤트
4. **Outro** (~4–5s) — "Follow @kokio.yvr"

Composition 총 길이는 `calculateMetadata` 로 voice mp3 duration 합산하여 runtime 결정. 각 segment 끝에 6 frames(0.2s) padding — 자막이 마지막 음절 후 약간 lingers.

### Voice / 자막 분리
- **EN voice** — ElevenLabs TTS, segment 별 mp3 + R2 캐시
- **KR 자막** — Noto Sans KR, 모든 scene 공통 위치(safe area 하단)
- 자막은 voice 의 의역(직역 X) — BRAND.md §7 카피 정책 명사형/약체 준수

### 데이터 소스 재사용
- Sunset week: `src/data/snapshot.ts` `fetchSunsetSnapshot` 순차 7회 (open-meteo rate-limit 회피)
- Events: `src/feeds/ticketmaster.ts` + `src/events/pick.ts` `pickTopEvents(date, 3)` — 큐레이션 정책 ([docs/EVENTS.md §3](EVENTS.md))
- Photos: `src/photos/unsplash.ts` + `ticketmaster.ts` 캐시 (idempotent)

## 3. 결정론적 큐레이션

같은 publish date 입력 시 정확히 같은 영상 산출. 검증·디버그·재실행 안전.

- **Best sunset**: 지난 7일 각 일의 sunset score 계산 → 최고점 (동률 시 자연 정렬)
- **Top events**: 다음 7일 fetch → `BLOCKED_KEYWORDS` 필터 → 자격 필터(이미지+venue) → 정렬(주말/venue capacity/id) → `dedupByNameVenue` (동일 act/venue 연속 공연 collapse) → 상위 3건
- **Voice cache**: text + voice + model triple hash → R2 hit 시 ElevenLabs 호출 0

## 4. R2 캐시 구조

| Prefix | 내용 | 갱신 |
|--------|------|------|
| `voice/{hash}.mp3` | TTS mp3 + duration metadata | 신규 스크립트만 생성 |
| `audio/briefing/*.mp3` | BGM 트랙 | 수동 업로드 (R2 대시보드) |
| `audio/sunset/*.mp3` | sunset BGM (briefing fallback) | 수동 업로드 |
| `reels/yvr-briefing-{date}.{mp4,jpg}` | 발행된 영상 + 커버 | 매주 새로 |

## 5. Cadence

- **일요일 19:00 PDT = 월요일 UTC 02:00** (`0 2 * * 1`)
- sunset(매일 22:00 UTC) + event(목요일 23:00 UTC)와 시차 있어 같은 IG 계정 algorithmic burst 안전
- 일요일 저녁 = 한 주 회고 + 다음 주 프리뷰 톤 자연

## 6. 자막 폰트

`@remotion/google-fonts/NotoSansKR` weights 500/700 사용. Google Fonts subset 분할로 빌드 시 ~248개 네트워크 요청 (한 번만, Chromium 캐시). 운영에 영향 X.

## 7. 실패 처리

- **ElevenLabs API down** → cron tick exit 1 → Railway retry 3회 → 다음 주 자연 회복. R2 voice cache 라 재시도 시 추가 spend 없음
- **Ticketmaster 0 events** → 이벤트 섹션 생략하고 진행 (intro + sunset + outro만, 12–18s reel)
- **Best sunset 전부 cloudy** → "Cloudy week ahead" 자동 카피 대체
- 모두 Railway logs 에서 추적 가능

## 8. 향후 확장

- Voice 톤 매주 다르게 (정치 톤? 시즌 톤?) — `voiceId` 동적
- Word-level subtitle highlight (ElevenLabs Pro tier alignment)
- BGM ducking under voice (현재는 단순 0.25/0.95 volume 분리)
- 한국어 voice (KR audience 직접 reach 시점에 결정)

지금은 단순함 유지 — 운영 안정 후 단계적 추가.
