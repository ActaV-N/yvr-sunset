# YVR Sunset — Brand System

이 문서는 `yvr-sunset` 프로젝트의 모든 시각 산출물(Remotion 영상, IG 캡션, 향후 사이트/메일)에서 지켜야 할 **색 · 타이포 · 모션** 규칙을 정의한다.

원칙은 단 하나: **시각 결정은 코드가 아니라 토큰에서 한다.** 새로운 색·폰트 사이즈·이징을 컴포넌트에 직접 적어넣는 순간 브랜드는 무너진다. 무조건 `src/brand/tokens.ts`를 수정하고, 거기서만 가져다 쓴다.

## 1. Brand color

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

## 2. Typography

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

## 3. Animation easing

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

## 4. Audio

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
- 위치: `public/audio/`
- 포맷: **mp3 only** (`.wav`, `.m4a` 인식 안 함)
- 네이밍: `NN-track-name.mp3` (예: `01-dusk-walk.mp3`, `02-golden-drift.mp3`). 숫자 prefix로 정렬 순서 제어.
- 길이: 최소 15초 이상 (12초 컴포지션을 페이드아웃 마진과 함께 커버). 첫 12초가 곡의 가장 좋은 부분이 되도록 자르기.
- 라이선스 매니페스트: `public/audio/{filename}.json`에 `{ source, license, attribution, url }` 기록 (선택, 권장).

### 동작
- `src/audio/picker.ts`가 `public/audio/*.mp3`을 알파벳순 정렬 → 날짜 해시로 로테이션.
- 트랙 0개면 무음 영상 + 경고 로그 (graceful fallback).
- 볼륨/페이드는 `AUDIO` 토큰 (`bodyVolume: 0.75`, `fadeInFrames: 15`, `fadeOutFrames: 30`).

### 규칙
- 트랙 추가는 라이선스 확인 후 진행. 출처 모르는 mp3 절대 추가 금지.
- 트랙 교체는 OK, 하지만 한 번에 3개 이상은 두지 말 것 (일관성).
- 새 트랙 카테고리(예: "calmer for Meh score") 추가는 단순함 유지 위해 보류 — 단일 풀에서 무작위 로테이션이 디폴트.

## 5. 적용 위치 매핑

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

## 6. 확장 정책

브랜드는 시간이 지나면 자연스럽게 늘어나려 한다. 다음 원칙으로 막는다.

1. **추가하기 전에 빼본다.** 새 색이 필요하다 = 보통 기존 6개 중 하나를 잘못 쓰고 있다는 신호.
2. **추가는 PR 단위로.** `tokens.ts` 수정은 디자인 결정이므로, "지금 영상 컴포넌트 작업 중에 곁들여" 추가하지 않는다.
3. **추가 사유를 본 문서에 기록.** 토큰을 늘리면 이 문서의 표도 같이 갱신.
4. **로컬에서 한 번만 쓸 거면 추가하지 마라.** 두 군데 이상 쓰일 가능성이 있을 때만 토큰으로 승격.

## 7. 향후 적용 범위

본 시스템은 Remotion 영상에서 시작하지만 다음에도 동일 토큰을 사용한다:
- IG 캡션의 이모지 톤 (🌅, 👍 등 — `tokens.ts`에 향후 `EMOJI` 섹션으로)
- 발행 실패 GH issue 템플릿 색조 (마크다운 한정)
- (확장 시) 랜딩 페이지 / Open Graph 이미지 — Tailwind 토큰으로 미러링

다른 서비스(예: kokio-style-front)와 컬러를 공유할 일이 생기면 토큰을 패키지로 분리한다. 그 전까지 이 프로젝트 안에 유지.
