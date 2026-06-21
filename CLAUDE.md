# yvr-sunset

이 디렉토리에서 작업할 때 따라야 할 컨벤션은 아래 문서를 참조한다.

@docs/BRAND.md

## 디자인 작업 절대 규칙

- 색·폰트·이징·타이밍은 **무조건** `src/brand/tokens.ts` + `src/brand/fonts.ts` 경유.
- 컴포넌트 안에 hex 색, `fontSize: 숫자`, `spring(...)`, 매직 시작 프레임 등장하면 즉시 토큰화.
- 새 토큰 추가는 시각 결정이므로 `docs/BRAND.md` 표도 함께 갱신.
- "지금 한 번만 쓸 거"는 토큰화하지 않는다. 두 곳 이상 쓰일 때 승격.

## 영상 변경 시

- 렌더 검증은 `npm run daily:dry` → `out/yvr-sunset-{date}.mp4`.
- 디자인 미리보기는 `npm run render:preview` (Remotion Studio).
- 폰트는 `src/brand/fonts.ts`에서만 `loadFont` 호출. 컴포넌트에서 직접 부르지 말 것.
