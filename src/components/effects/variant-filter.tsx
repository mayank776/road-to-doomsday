/**
 * An invisible SVG holding the "variant split" filter used by the
 * .variant-hover class (globals.css): it separates an image into red, green
 * and blue copies, shifts red left and blue right, and screens them back
 * together. Rendered once in the root layout.
 */
export function VariantFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="variant-split" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feOffset in="red" dx="-7" dy="0" result="redShift" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
        <feOffset in="blue" dx="7" dy="0" result="blueShift" />
        <feBlend in="redShift" in2="green" mode="screen" result="rg" />
        <feBlend in="rg" in2="blueShift" mode="screen" />
      </filter>
    </svg>
  );
}
