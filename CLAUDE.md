# kokio.yvr (folder: yvr-sunset)

브랜드 이름은 `kokio.yvr`. 폴더명은 첫 feature(sunset) 기준 `yvr-sunset`으로 잡혀있지만 브랜드 자체는 sunset에 묶이지 않는다 — 향후 밴쿠버 데일리 콘텐츠(tide, moon, weather 등)가 같은 브랜드/IG 계정에 합류한다.

이 디렉토리에서 작업할 때 따라야 할 컨벤션은 아래 문서를 참조한다.

@docs/BRAND.md

## 디자인 작업 절대 규칙

- 색·폰트·이징·타이밍은 **무조건** `src/brand/tokens.ts` + `src/brand/fonts.ts` 경유.
- 컴포넌트 안에 hex 색, `fontSize: 숫자`, `spring(...)`, 매직 시작 프레임 등장하면 즉시 토큰화.
- 새 토큰 추가는 시각 결정이므로 `docs/BRAND.md` 표도 함께 갱신.
- "지금 한 번만 쓸 거"는 토큰화하지 않는다. 두 곳 이상 쓰일 때 승격.
- Kokio 본진/자매 sub-brand 팔레트(coral/gold 등) 절대 가져오지 않는다. 시각 정체성 독립 유지.

## 카피 작업 절대 규칙

- 캡션은 **한/영 이중**. 한쪽만 단독 금지.
- 톤은 매거진 헤드라인(명사형/약체). 풀 문장 한국어 금지.
- 비자/이민/Kokio 본진 직접 언급 금지.
- 해시태그 한/영 코어 셋은 매번 동일 (`docs/BRAND.md §5` 참조).

## 영상 변경 시

- 렌더 검증은 `npm run daily:dry` → `out/yvr-sunset-{date}.mp4`.
- 디자인 미리보기는 `npm run render:preview` (Remotion Studio).
- 폰트는 `src/brand/fonts.ts`에서만 `loadFont` 호출. 컴포넌트에서 직접 부르지 말 것.
