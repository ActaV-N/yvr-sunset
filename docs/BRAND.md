# kokio.yvr — Brand System

이 문서는 `kokio.yvr` 브랜드의 모든 시각 산출물(IG 릴스, 캡션, 향후 사이트/스토리/메일)에서 지켜야 할 **색 · 타이포 · 모션 · 카피** 규칙을 정의한다.

원칙은 단 하나: **시각 결정은 코드가 아니라 토큰에서 한다.** 새로운 색·폰트 사이즈·이징을 컴포넌트에 직접 적어넣는 순간 브랜드는 무너진다. 무조건 `src/brand/tokens.ts`를 수정하고, 거기서만 가져다 쓴다.

## 0. 브랜드 포지셔닝

**이름**: `kokio.yvr`

**가족**: Kokio 브랜드 패밀리의 일원 (`kokio.style`처럼 독립적으로 운영되는 sub-brand). 시각 정체성은 **독립** — Kokio 본진의 코랄/골드 팔레트를 따르지 않고 자체 "cinematic dusk" 톤 유지. 패밀리 lineage는 네임에만.

**Audience**: 밴쿠버에 있거나 가려는 한국인. 일부 영어권 현지인 spillover OK.

**Scope**: 밴쿠버 데일리 콘텐츠 전반. 첫 feature는 일몰(sunset score + 명당)이지만 향후 확장 가능:
- 자연 데이터: 일출, 달의 위상, 밀물·간조, 일조량
- 도시 생활: 페리/스카이트레인 상태, 자전거 도로, 곰 출현 알림
- 컬처: 오늘의 마켓, 페스티벌, 신규 오픈
- 계절 신호: 첫 단풍, 첫눈, 벚꽃 개화

폴더 구조(`kokio_v2/yvr-sunset/`)는 첫 feature 기준으로 잡혀있지만, 브랜드 자체는 sunset에 묶이지 않는다. 새 콘텐츠 타입 추가 시 같은 디자인 시스템 + 같은 IG 계정에 합류.

**금지**:
- 비자/이민 직접 광고 콘텐츠 (Kokio 본진 funnel은 자연스러운 awareness만)
- Kokio 본진 팔레트(coral/gold)로의 시각 변질
- 영문 단독 캡션 ([§5 카피 정책](#5-카피-정책) 참고)

## 1. IG Safe Area (필수)

IG Reels는 상단 220px(@handle 영역) + 하단 340px(프로필 바·캡션·아이콘) 약 **560px가 UI 오버레이로 가려짐**. 1080×1920 캔버스 중 실제 정보가 안전하게 보이는 영역은 가운데 **1360px 띠**.

```
 0 ┌────────────────────────────┐
   │  TOP UNSAFE  (220 px)      │ ← @handle, story title (글자/로고 안 보임)
220├────────────────────────────┤
   │   SAFE  ZONE   (1360 px)   │ ← 모든 critical info 여기 안에
1580├───────────────────────────┤
   │  BOTTOM UNSAFE  (340 px)   │ ← 프로필바·캡션·하트/공유 아이콘
1920└────────────────────────────┘
```

### 규칙
- **배경 이미지/그라데이션은 가장자리까지 OK** — UI가 덮어도 시각적 톤만 깔리는 거라 무해
- **모든 텍스트/로고/칩**(시각·점수·장소·가격·로고·attribution)은 safe zone 안에. 가려지면 정보 자체가 사라짐 = 콘텐츠 실패
- 토큰 `SAFE_AREA` (`topPx: 220`, `bottomPx: 340`, `insetPx: 40`)와 그 위에서 파생된 `LAYOUT.topBarPx: 460`, `LAYOUT.bottomChipPx: 380`, `LOGO.topPx: 260` 사용
- 새 scene 컴포넌트는 무조건 `top: SAFE_AREA.topPx, bottom: SAFE_AREA.bottomPx` 안에서 vertical-center. `inset: 0` 금지 (그러면 IG에서 한쪽 잘림)

### 체크리스트 (새 컴포넌트 추가 시)
- [ ] hex 색이 컴포넌트 안에 적혀있지 않은가? → `COLORS.*`
- [ ] `fontSize: 숫자`가 적혀있지 않은가? → `FONT_SIZES.*`
- [ ] `spring(...)` 호출이 없는가? → `interpolate + Easing.bezier(...EASING.*)`
- [ ] 시작 프레임이 컴포넌트 로컬 상수로 박혀있지 않은가? → `TIMELINE.*`
- [ ] 숫자 표시는 `FONTS.tabularNums`를 spread했는가?
- [ ] 가변 길이 hero 텍스트는 `fitFontSize()`로 감쌌는가? `whiteSpace: "nowrap"` 같이 있는가?
- [ ] 좌우 padding은 `LAYOUT.horizontalPaddingPx`를 사용했는가?
- [ ] **컴포넌트의 vertical 영역이 `SAFE_AREA.topPx ~ (1920 - SAFE_AREA.bottomPx)` 안에 있는가?**
- [ ] **바닥 칩은 `LAYOUT.bottomChipPx`, 상단 요소는 `LOGO.topPx` / `LAYOUT.topBarPx` 사용했는가?**

## 2. 사진 위 텍스트 가독성

배경 사진이 밝거나 colorful 한 경우 텍스트가 묻히는 문제는 **3단 레이어**로 대응 — 모두 토큰(`PHOTO_OVERLAY`, `TEXT_SHADOWS`)에서 조정.

### Layer 1 — Photo filter (사진 자체)
`PHOTO_OVERLAY.photoFilter = "saturate(0.92) brightness(0.82) contrast(1.05)"`
- 살짝 채도/밝기 다운 → 톤 통일
- 약간 contrast 증가 → photo 자체 punch 유지
- PhotoBg 내부에서 자동 적용. 새 reel에서 신경 안 써도 됨.

### Layer 2 — Top + Bottom scrim (텍스트 영역 보호)
- **Top scrim**: 상단 0~30% 구간을 `rgba(midnightInk, 0.6)` → 투명 그라데이션으로 덮음. 로고 + TopBar 영역 가독성 보장.
- **Bottom scrim**: 하단 55~100% 구간을 투명 → `rgba(midnightInk, 0.85)` 그라데이션. Hero 중앙 + ScoreCard/EventMeta 칩 보호.
- 사진 중앙(피사체 메인)은 vivid 유지 → 시각 임팩트 살림.

### Layer 3 — Text shadow (마지막 안전망)
`TEXT_SHADOWS.body`/`hero`를 critical 텍스트에 적용:
- `body`: `0 2px 8px rgba(0,0,0,0.5)` — 라벨/칩/캡션
- `hero`: `0 4px 20px rgba(0,0,0,0.55)` — 큰 디스플레이 텍스트, 큰 숫자

Sticker처럼 안 보이는 subtle 강도. DuskGradient fallback에서도 자연스럽게 묻힘.

### 규칙
- 새 텍스트 컴포넌트는 무조건 `textShadow: TEXT_SHADOWS.body` (또는 `hero`)를 기본값으로.
- 사진 한 장이 특히 어렵게 묻는다면 → 해당 사진을 캐시에서 지우거나 (`public/spots/{slug}.jpg` / `public/events/{id}.jpg`) 더 contrast 있는 후보로 교체. PHOTO_OVERLAY 값 조정은 마지막 수단.

## 3. Brand color

### 컨셉
"Cinematic dusk" — 깊은 잉크 위에 단 하나의 밝은 액센트. 매거진 표지 같은 느낌. 순백이 아니라 약간 따뜻한 크림으로 디지털 티를 뺀다.

### 팔레트

| 토큰 | HEX | 역할 | 사용 비중 |
|------|-----|------|----------|
| `sunsetOrange` | `#FF5A1F` | **브랜드 시그너처.** 시각, 점수 숫자, 액센트 룰. | 5% (절제) |
| `goldenHour` | `#FFC857` | 보조 광원. 글로우, 골든아워 하이라이트. | 5% |
| `midnightInk` | `#0B0B14` | 최심부 다크. 메인 배경 fallback, 비네트 베이스. | 40% |
| `twilight` | `#1F1F2E` | 중간 surface. 칩/카드 (보통 70% 알파). | 10% |
| `daylightCream` | `#F5EFE6` | 어두운 배경 위의 1차 텍스트. 순백보다 따뜻함. | 30% |
| `drift` | `#7A7A8C` | 보조 텍스트. 레이블, 단위, attribution. | 10% |

### 규칙
- **액센트(`sunsetOrange`)는 한 화면에 한 번만**. 시각/점수/액센트 룰 등 "오늘의 한 가지" 강조에만. 두 군데 이상 쓰면 즉시 약발 떨어짐.
- 텍스트 색은 `daylightCream`이 디폴트, 보조는 `drift`. 흰색/회색 hex를 직접 쓰지 않는다.
- 그라데이션은 fallback 배경 한 곳에서만 (PhotoBg의 `DuskGradient`). 텍스트나 작은 surface에는 그라데이션 금지.
- 새로운 색이 필요하다고 느끼면 99% 잘못된 신호. 기존 6개 안에서 해결할 수 있다.

## 4. Typography

### 페어링
- **Display — Fraunces Italic 900** (Google Fonts, 무료). 옵티컬 사이즈 적용된 매거진형 세리프. 스팟 이름, 점수 숫자에만.
- **UI — Inter Tight 500–900** (Google Fonts, 무료). 라벨, blurb, 시각 표시 등 모든 비-디스플레이 텍스트.

### 왜 이 두 개인가
- 디스플레이 italic 세리프 + neutral sans = 타입 콘트라스트로 "punch"를 만든다 (색이나 모션 없이도).
- Fraunces는 opsz 가변축이 커서 220px에서도 셰이프가 깨지지 않는다.
- Inter Tight는 narrow 비율이라 9:16 좁은 캔버스에서 가로 공간을 덜 먹는다.

### 사이즈 (`FONT_SIZES`)
| 토큰 | px | 용도 |
|------|----|------|
| `micro` | 22 | attribution |
| `caption` | 28 | eyebrow 라벨, 단위 |
| `body` | 38 | 일반 라벨 |
| `blurb` | 44 | 스팟 설명문 |
| `label` | 48 | 점수 라벨 ("👍 Decent") |
| `numeral` | 56 | 시각 디스플레이 |
| `heroNumber` | 200 | 점수 숫자 |
| `hero` | 220 | 스팟 이름 |

### 규칙
- **숫자에는 무조건 `FONTS.tabularNums`** (시각, 점수, 카운트다운). 자릿수가 흔들리면 영상 품질 0점.
- 새 사이즈가 필요하면 `tokens.ts`에 추가하고 이름을 부여한다. 컴포넌트 안에 `fontSize: 64` 같은 매직 넘버 절대 금지.
- 폰트 로드는 `src/brand/fonts.ts`에서만. 컴포넌트가 `loadFont`를 직접 부르면 안 된다.
- `letterSpacing`도 토큰(`LETTER_SPACING`)에서. 직접 px 지정 금지.

### 가변 길이 텍스트 (스팟 이름 같은 hero 텍스트)
- 콘텐츠 길이가 데이터에 따라 달라지는 디스플레이 텍스트는 **반드시 `fitFontSize()` (`src/brand/fit.ts`) 경유**.
- `withinWidth`는 항상 `REEL_WIDTH - LAYOUT.horizontalPaddingPx * 2 - LAYOUT.italicSafetyPx` 패턴.
- `maxSize`는 토큰 (`FONT_SIZES.hero` 등). 폰트는 항상 가용폭에 맞춰 축소되지, 늘어나지 않는다.
- `whiteSpace: "nowrap"`을 같이 걸어야 줄바꿈으로 도망가지 않고 진짜로 축소된다.
- 짧은 단어(예: "PARK")는 자동으로 max 사이즈로 떨어진다 — 별도 분기 필요 없음.

## 5. Animation easing

### 컨셉
**스프링 금지, 큐빅베지어만 사용.** 스프링은 앱 UI에서 자연스럽지만 영상에서는 "튕김"이 너무 강해 산만하다. 컨텐츠가 정보(시각, 점수, 명당)인 이상 정중한 swoop이 어울린다.

### 곡선 (`EASING`)
| 토큰 | 베지어 | 의도 |
|------|--------|------|
| `entrance` | `0.16, 1, 0.3, 1` | 1차 진입. 히어로 요소 (스팟 이름, 시각). |
| `soft` | `0.25, 1, 0.5, 1` | 2차 진입. eyebrow, blurb, 점수. |
| `inOut` | `0.65, 0, 0.35, 1` | 크로스페이드, 색 전환, 양방향. |
| `count` | `0.33, 1, 0.68, 1` | 숫자 카운트업. 모노토닉 증가. |

### 지속시간 (`TIMING`, 30fps 기준)
| 토큰 | 프레임 | 초 | 용도 |
|------|--------|----|------|
| `entranceFrames` | 24 | 0.8s | 히어로 진입 |
| `softEntranceFrames` | 18 | 0.6s | 보조 진입 |
| `fadeFrames` | 12 | 0.4s | 크로스페이드 |
| `countUpFrames` | 30 | 1.0s | 점수 카운트업 |
| `staggerFrames` | 6 | 0.2s | 형제 요소 시차 |

### 규칙
- `spring()` 호출 금지. `interpolate(... { easing: Easing.bezier(...EASING.entrance) })` 패턴만 사용.
- 새 곡선이 필요하면 위 4개 중 어느 것도 안 맞는지 다시 생각. 보통 `entrance` 또는 `soft`로 충분.
- 한 컴포넌트가 두 종류 이상의 easing을 동시에 쓰지 않는다. 진입 곡선과 fade-out 곡선이 다른 건 OK (`entrance` + `inOut`).
- 타임라인 시작 프레임은 `TIMELINE` 상수에서. 컴포넌트 안에 `const START = 120` 같은 로컬 상수 금지.

## 6. Audio

### 컨셉
밴쿠버 일몰 = 차분한 골든아워. 음악은 **lo-fi / ambient / chill-electronic**만 허용. 비트 강한 음악, 보컬, 영화 OST 풍 절대 금지(매일 12초가 IG 피드에 쌓이면 한 결로 묶여야 한다).

### IG API 제약
IG Graph API로 발행한 Reels에는 **IG 음원 라이브러리를 못 붙인다.** 음원을 영상에 직접 임베드해야 한다. 라이선스는 본인 책임.

### 소스 (라이선스 명확한 곳만)
- **Pixabay Music** (https://pixabay.com/music/) — Pixabay Content License. 상업 사용 OK, attribution 불필요. **1순위.**
- **YouTube Audio Library** — royalty-free, 일부는 attribution 필요. dashboard에서 라이선스 확인.
- **Uppbeat** (https://uppbeat.io/) — 무료 플랜은 "credit when free" 필요. 유료 플랜은 attribution 불필요.

피해야 할 것: SoundCloud 임의 트랙, Spotify, Apple Music 등 — DMCA 리스크.

### 파일 규칙
- 위치: `public/audio/{mood}/*.mp3` — mood는 reel 타입과 1:1 (`sunset`, `event`)
- 포맷: **mp3 only** (`.wav`, `.m4a` 인식 안 함)
- 네이밍: `NN-track-name.mp3` (예: `01-dusk-walk.mp3`, `02-golden-drift.mp3`). 숫자 prefix로 정렬 순서 제어.
- 길이: 최소 15초 이상 (12초 컴포지션을 페이드아웃 마진과 함께 커버). 첫 12초가 곡의 가장 좋은 부분이 되도록 자르기.
- 라이선스 매니페스트: 같은 이름 `.json` 파일에 `{ source, license, attribution, url }` 기록 (선택, 권장).

### 무드 정책 (mood = reel type)
- **`public/audio/sunset/`** — 일몰 reel용. 골든아워 톤. lofi · ambient · slow piano · chill electronic. 80–110 BPM. 보컬 가능하나 instrumental 권장.
- **`public/audio/event/`** — 이벤트 reel용. 약간 더 텐션 있는 mid-tempo. light electronic · uplifting acoustic · indie pop instrumental · chillhop with beat. 100–130 BPM. 댄스/EDM/풀 보컬 금지 (산만).

폴더가 비어있으면 `public/audio/` 루트 트랙으로 fallback (호환 동작). 본격 운영 시엔 무조건 mood 폴더에 두기.

### 동작
- `src/audio/picker.ts`가 `pickTrackForDate(date, mood)` 호출 시 `audio/{mood}/*.mp3` 먼저 → 비면 `audio/*.mp3` fallback → 둘 다 비면 무음.
- 정렬 알파벳순 → 날짜 해시로 결정론적 로테이션.
- 볼륨/페이드는 `AUDIO` 토큰 (`bodyVolume: 0.75`, `fadeInFrames: 15`, `fadeOutFrames: 30`).

### 규칙
- 트랙 추가는 라이선스 확인 후 진행. 출처 모르는 mp3 절대 추가 금지.
- 트랙 교체는 OK, 하지만 한 번에 3개 이상은 두지 말 것 (일관성).
- 새 트랙 카테고리(예: "calmer for Meh score") 추가는 단순함 유지 위해 보류 — 단일 풀에서 무작위 로테이션이 디폴트.

### 로고
- 파일: `public/logo_transparent.png` (320×320 PNG, 투명 배경)
- 위치: 상단-좌측 코너, masthead 패턴 (위 → 룰 → "TONIGHT IN VANCOUVER" 행)
- 크기/위치는 `LOGO` 토큰 (`sizePx: 100`, `topPx: 60`, `leftPx: 80`)
- 페이드인은 top bar와 동시 (TIMELINE.topFrom, soft easing) → 헤더 전체가 하나로 등장
- 다른 모서리(우상단/하단)에 추가 로고 금지. 한 화면 한 마크.

## 7. 카피 정책 (캡션 · 텍스트)

### 언어
**KR + EN 이중 캡션이 디폴트.** 한국어 한 줄 → 빈 줄 → 영문 한 줄 → 빈 줄 → 해시태그. 한쪽만 단독 절대 금지(audience가 한/영 모두 있고 브랜드명이 한국어 코드라 영문 단독은 톤 부조화).

### 길이
- 한국어: **≤60자** (모바일 한 줄 안에 들어와야 함)
- 영문: **≤80자**
- 해시태그 합쳐 캡션 전체 **≤500자** (IG 한도 2200자지만 길면 임팩트 떨어짐)

### 톤
- 정보 우선 (시각·점수·장소 같은 hard data 먼저), 형용사 절제
- 한국어는 **반말 종결 금지**. 매거진 헤드라인처럼 명사형/약체 종결("오늘 9시 23분, 키칠라노 해변")
- 영문도 마찬가지로 헤드라인 톤. 풀 문장보다 phrase

### 템플릿 (sunset feature 기준)
```
오늘 [시각], [명당]
[점수 라벨 한국어]

Tonight's sunset · [time] at [spot]
[score label] / Vancouver, BC

#vancouver #vancouversunset #yvr #밴쿠버 #밴쿠버일몰 ...
```

### 해시태그
- 한/영 섞어서 8–15개
- 영문 코어: `#vancouver #yvr #vancouverbc #explorebc #pnw`
- 콘텐츠별 영문: sunset이면 `#sunset #goldenhour #vancouversunset`
- 한국어 코어: `#밴쿠버 #밴쿠버일상 #밴쿠버여행 #캐나다`
- 콘텐츠별 한국어: sunset이면 `#밴쿠버일몰 #밴쿠버노을`
- 매번 동일 코어 + 콘텐츠별 가변. 무작위 추가 금지(브랜드 검색성 떨어뜨림).

### 이모지
- 시그너처: `🌅`(sunset), `🌊`(tide), `🌙`(moon), `🌸`(seasonal). feature별 1개 고정.
- 본문에 이모지는 시그너처 1개만. 캡션 흩뿌리지 말 것.

### 금지
- 광고 표현, "지금 클릭", "DM 주세요" 류 콜투액션
- 비자/이민/Kokio 본진 직접 언급
- 풀 문장체 한국어 ("오늘 밴쿠버 일몰이 정말 아름다워요!" 같은 거)
- 영문 단독, 한국어 단독

## 8. 적용 위치 매핑

| 파일 | 토큰 사용처 |
|------|-------------|
| `src/brand/tokens.ts` | 모든 색·사이즈·이징·타이밍의 단일 출처 |
| `src/brand/fonts.ts` | Fraunces · Inter Tight 로딩 (`FONTS.display`, `FONTS.ui`) |
| `src/remotion/SunsetReel.tsx` | 루트 배경색 + 디폴트 폰트 |
| `src/remotion/scenes/*.tsx` | 토큰만 import. 색·사이즈·이징 모두 토큰 경유 |

새 컴포넌트를 추가할 때 체크리스트:
- [ ] hex 색이 컴포넌트 안에 적혀있지 않은가? → `COLORS.*` 사용
- [ ] `fontSize: 숫자`가 적혀있지 않은가? → `FONT_SIZES.*` 사용
- [ ] `spring(...)` 호출이 없는가? → `interpolate + Easing.bezier(...EASING.*)` 사용
- [ ] 시작 프레임이 컴포넌트 로컬 상수로 박혀있지 않은가? → `TIMELINE.*` 추가/사용
- [ ] 숫자 표시는 `FONTS.tabularNums`를 spread했는가?
- [ ] 가변 길이 hero 텍스트는 `fitFontSize()`로 감쌌는가? `whiteSpace: "nowrap"` 같이 있는가?
- [ ] 좌우 padding은 `LAYOUT.horizontalPaddingPx`를 사용했는가?

## 9. 확장 정책

브랜드는 시간이 지나면 자연스럽게 늘어나려 한다. 다음 원칙으로 막는다.

1. **추가하기 전에 빼본다.** 새 색이 필요하다 = 보통 기존 6개 중 하나를 잘못 쓰고 있다는 신호.
2. **추가는 PR 단위로.** `tokens.ts` 수정은 디자인 결정이므로, "지금 영상 컴포넌트 작업 중에 곁들여" 추가하지 않는다.
3. **추가 사유를 본 문서에 기록.** 토큰을 늘리면 이 문서의 표도 같이 갱신.
4. **로컬에서 한 번만 쓸 거면 추가하지 마라.** 두 군데 이상 쓰일 가능성이 있을 때만 토큰으로 승격.

## 10. 향후 적용 범위

본 시스템은 Remotion 영상에서 시작하지만 다음에도 동일 토큰을 사용한다:
- IG 캡션의 이모지 톤 (🌅, 👍 등 — `tokens.ts`에 향후 `EMOJI` 섹션으로)
- 스토리/하이라이트 커버 (`SunsetReel` 컴포지션과 별개로 1080×1920 정적 이미지 생성기 추가 가능)
- 발행 실패 GH issue 템플릿 색조 (마크다운 한정)
- (확장 시) 랜딩 페이지 / Open Graph 이미지 — Tailwind 토큰으로 미러링

Kokio 본진(`kokio-front`, `kokio-landing`) 및 자매 sub-brand(`kokio.style`)와는 **색·폰트 공유하지 않는다.** 각 sub-brand는 자체 톤 유지. 패밀리 lineage는 네이밍 + 운영 주체에만 존재.
