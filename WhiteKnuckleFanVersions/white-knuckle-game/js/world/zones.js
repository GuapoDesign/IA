/**
 * Height-based colour zones (Substructure, Underworks, Nest).
 */
const Z = [
    [0, 0x4a4828, 0x0e0e06],
    [110, 0x5c5c64, 0x060608],
    [240, 0x5238a0, 0x0a0618],
  ],
  c1 = new T3.Color(),
  c2 = new T3.Color(),
  ta = new T3.Color(),
  tb = new T3.Color();
function zone(h) {
  let k = 0;
  while (k < 2 && h >= Z[k + 1][0]) k++;
  const a = Z[k],
    b = Z[Math.min(k + 1, 2)],
    L = b[0] - a[0],
    f = k == 2 ? 0 : Math.min(1, Math.max(0, (h - a[0] - L * 0.6) / (L * 0.4)));
  c1.setHex(a[1]).lerp(ta.setHex(b[1]), f);
  c2.setHex(a[2]).lerp(tb.setHex(b[2]), f);
}
