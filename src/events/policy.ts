/**
 * Brand-aligned event filters that go BEYOND Ticketmaster's classification system.
 *
 * kokio.yvr is general-purpose Vancouver lifestyle content, leaning editorial/data.
 * 어떤 콘텐츠를 폄하하는 게 아니라, 매주 1건씩 노출되는 큐레이션 피드에서 같은
 * niche 장르가 반복되면 audience fit 이 좁아지므로 일부러 제외한다.
 *
 * 키워드 추가/제거는 자유. 영문 lowercase 로 적고 부분일치(includes) 로 판정.
 */
export const BLOCKED_KEYWORDS: readonly string[] = [
  // Niche entertainment subgenres — 반복 노출 시 브랜드 톤 좁아짐
  "drag",
  "burlesque",
  // Adult-only — 보편 audience 부적합
  "18+",
  "adults only",
  "adult only",
];

/**
 * Case-insensitive substring match against the blocklist. The caller should
 * pass a haystack that includes the event name + classification labels
 * (segment / genre / subGenre) so subgenres are caught even when the title
 * is benign.
 */
export function isBlockedByKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
}
