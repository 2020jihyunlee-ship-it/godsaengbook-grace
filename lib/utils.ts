// ── 로마 숫자 변환 ──────────────────────────────────────────
const ROMAN_MAP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100,  'C'], [90,  'XC'], [50,  'L'], [40,  'XL'],
  [10,   'X'], [9,   'IX'], [5,   'V'], [4,   'IV'],
  [1,    'I'],
]

export function toRoman(n: number): string {
  if (n < 1 || n > 3999) return String(n)
  let result = ''
  for (const [value, numeral] of ROMAN_MAP) {
    while (n >= value) {
      result += numeral
      n -= value
    }
  }
  return result
}

/** 테마 변수에서 챕터 스타일을 읽어 번호 포맷 */
export function formatChapter(index: number, chapterStyle: string): string {
  return chapterStyle === 'roman' ? toRoman(index) : String(index).padStart(2, '0')
}
