/**
 * Hand grabbing: grab impulse and handhold / wall-grip picking.
 */
function grabFx(i) {
  snd("grab");
  const p = H[i];
  V.x += (p.x - P.x) * 2;
  V.y += (p.y - P.y) * 2;
  V.z += (p.z - P.z) * 2;
}
function pick(skip, hd) {
  cam.getWorldDirection(F);
  let b = -1,
    bd = 0.62;
  for (let i = 0; i < H.length; i++) {
    if (i == skip) continue;
    const p = H[i],
      x = p.x - P.x,
      y = p.y - P.y,
      z = p.z - P.z;
    if (y < -1.2 && y > -9) continue;
    const d = Math.hypot(x, y, z);
    if (d > 3.7 || d < 0.2) continue;
    const o = (x * F.x + y * F.y + z * F.z) / d;
    if (o > bd) {
      bd = o;
      b = i;
    }
  }
  if (b < 0 && hd != null && PW.wg > 0) {
    const a = F.x * F.x + F.z * F.z,
      bq = 2 * (P.x * F.x + P.z * F.z),
      c = P.x * P.x + P.z * P.z - 182.25,
      D = bq * bq - 4 * a * c;
    if (a > 1e-4 && D > 0) {
      const t = (-bq + Math.sqrt(D)) / (2 * a);
      if (t > 0.3 && t < 3.8) {
        const q = VI[hd];
        H[q].set(P.x + F.x * t, P.y + F.y * t, P.z + F.z * t);
        return q;
      }
    }
  }
  return b;
}
