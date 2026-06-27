# Vancouver Events — Ticketmaster 통합

`kokio.yvr`의 두 번째 feature. 매주 목요일 Ticketmaster Discovery API 에서 다음 7일 음악·예술 이벤트를 1건 큐레이션 → 영상 → R2 → IG 발행.

데이터 소스 선정 배경은 [`plans/reflective-honking-rainbow.md`](/Users/actav/.claude/plans/reflective-honking-rainbow.md) 참조 (Eventbrite Search API deprecated, City of Vancouver opendata 이벤트 0건, Destination Vancouver 공개 API 없음 — Ticketmaster Discovery API 가 유일하게 안정적).

## 1. API 키 발급

1. https://developer.ticketmaster.com → Sign in / Register (무료)
2. My Apps → Create app — 이름 자유 (예: `kokio-yvr`)
3. 발급되는 **Consumer Key** 가 우리가 쓰는 API 키 (Consumer Secret 은 안 씀)
4. Free tier: **5000 req/day**, 5 req/s — 주 1회 1 req 이라 0.02% 사용
5. `.env` / Railway Variables 의 `TICKETMASTER_API_KEY` 에 저장

## 2. 큐레이션 규칙

### Fetch 단계 (Discovery API 요청)
| 파라미터 | 값 | 이유 |
|---------|----|------|
| `dmaId` | `222` | Vancouver 광역 |
| `startDateTime` ~ `endDateTime` | 오늘 ~ +7일 | 주말 프리뷰 톤 |
| `classificationName` | `music,arts` | 스포츠 제외 (브랜드 톤) |
| `size` | 100 | 한 도시 일주일치 충분 |
| `sort` | `date,asc` | 가까운 순 |

### Qualified 필터 (응답 처리)
- `images[]` 1장 이상 (영상 배경 필요)
- `_embedded.venues[0]` 존재 (장소 미정 = 정보 부족)
- **이벤트명 + classification 라벨 합쳐서 [§3 BLOCKED_KEYWORDS](#3-blocked-keywords-브랜드-필터) 부분일치 시 제외**

### 정렬 (tie-break)
```
1. 주말(금/토/일) 이벤트 우선
2. venue capacity 큰 것 (인기 척도 대용, 없으면 0)
3. event id 사전순 (결정론 — 같은 입력 → 같은 결과)
```

→ 1순위 1건 반환.

### Empty 처리
모든 후보가 빠지면 `NoEventsAvailableError` throw → Railway cron tick exit 1 → 그 주는 발행 skip. 다음 주 cron 에서 새 fetch.

## 3. BLOCKED_KEYWORDS — 브랜드 필터

`src/events/policy.ts` 의 `BLOCKED_KEYWORDS` 배열. **lowercase 부분일치 (`String.includes`)** 로 이벤트명 + classification(segment/genre/subGenre) 합쳐 검사.

현재 기본값:
```typescript
[
  "drag",
  "burlesque",
  "18+",
  "adults only",
  "adult only",
]
```

### 추가/제거 가이드
- 동일 niche 장르가 매주 반복되면 audience fit 좁아짐 → 의도적 제외
- 특정 콘텐츠를 폄하하는 게 아니라 **다양성 + 보편 audience 적합도** 보호 목적
- 추가 시 lowercase, 부분일치 임을 의식 (너무 일반 단어는 위험 — 예: `"adult"` 만 적으면 "adult contemporary" 음악도 차단)
- 추가 사유는 PR/커밋 메시지에 남기기

### 확장 후보 (필요해지면)
- 종교 행사: `"gospel"`, `"worship"` — 단 `"church"` 는 venue 명에 자주 등장(예: First Baptist Church) 위험
- 정치/심포지엄: `"summit"`, `"forum"` (전치 위험 — venue 명에도 등장)
- 어덜트: 이미 포함

## 4. Cadence

- **주 1회, 목요일 UTC 23:00 = PDT 16:00 / PST 15:00** 발행
- 일몰(매일 UTC 22:00)과 1시간 시차 → 같은 IG 계정 algorithmic burst 방지
- 목요일 오후 = 주말 이벤트 프리뷰에 자연스러운 타이밍
- 무작위 더 자주 발행하면 IG 알고리즘 페널티 + Ticketmaster ToS 측 부담 (그러나 5000 req/day 한도에서 무관)

## 5. 이미지 캐싱

- `src/photos/ticketmaster.ts` `ensureEventPhoto(eventId, imageUrl)`
- Ticketmaster CDN(`s1.ticketm.net`)에서 한 번 download → `public/events/{eventId}.jpg` 캐시
- 다음 실행 시 cache hit, network skip
- 캐시 무효화: `public/events/{eventId}.jpg` 삭제 후 재실행
- Railway cron 컨테이너는 매 실행 fresh → cache miss → 매번 1회 download (~50–200KB, 부담 X)

## 6. 캡션 (`src/caption/event-caption.ts`)

BRAND.md §7(카피 정책) 준수. KR + EN 이중. 템플릿:

```
이번 주말 밴쿠버, {event name}
{날짜 (요일) 시간} · {venue}

This weekend in Vancouver — {event name}
{Day}, {Month Day} · {time} · {venue}

via Ticketmaster

#vancouver #yvr #vancouverevents #vancouverbc #thingstodo
#밴쿠버 #밴쿠버이벤트 #밴쿠버여행 #캐나다
```

이벤트명은 고유명사라 영문 그대로 노출 (한국어 캡션도 영문 이벤트명 유지).

## 7. 영상 컴포지션 (`EventReel`)

- 1080×1920 / 30fps / 12초 / H.264 + AAC
- 일몰 reel 과 동일한 브랜드 시스템(`BRAND.md`) — 색·타입·이징·safe area 100% 공유
- 신규 scene: `EventTopBar`, `EventHero` (italic + fitFontSize 자동 축소), `EventMeta` (venue chip + price)
- 재사용: `PhotoBg`, `Logo`, `Attribution`, `AudioTrack`

오디오 무드: `public/audio/event/*.mp3` 에서 날짜 해시로 로테이션. 일몰보다 약간 텐션 있는 lo-fi/chill electronic.

## 8. R2 키 네이밍

- 영상: `reels/yvr-event-{event-date}.mp4`
- 커버: `reels/yvr-event-{event-date}.jpg`
- 일몰(`yvr-sunset-{date}`)과 같은 prefix(`reels/`) 안에서 basename 으로 분리. 폴더 분리 안 함 — basename 만으로 collision 회피.

## 9. 토큰 만료 & 실패 알림

- IG 토큰 `debug_token` check 는 일몰 cron 과 동일하게 매 실행 1회 수행 → 14일 이내 만료 시 `pino.warn`
- Railway logs 가 유일한 알림 통로. 별도 통합 안 붙임 (kokio_v2 패밀리 정책)
- cron tick 실패 시 다음 tick 까지 idempotent — state 없음
