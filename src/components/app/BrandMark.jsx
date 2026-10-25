/* The same four-square mark used in Navbar and the auth pages. */
export default function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3"  y="3"  width="8" height="8" rx="2" fill="currentColor"/>
      <rect x="13" y="3"  width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
      <rect x="3"  y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
    </svg>
  );
}
