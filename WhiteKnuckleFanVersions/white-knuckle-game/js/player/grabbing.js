/**
 * Hand grabbing: grab impulse and handhold / structure-edge / wall-grip picking.
 */
function grabFx(i) {
  snd("grab");
  const p = H[i];
  V.x += (p.x - P.x) * 2;
  V.y += (p.y - P.y) * 2;
  V.z += (p.z - P.z) * 2;
}
/** World position of a point on a structure edge: e = { o, x, y, z } in the structure's local frame. */
function edgePt(e, out) {
  const o = e.o,
    r = Math.hypot(o.position.x, o.position.z) || 1,
    ux = o.position.x / r,
    uz = o.position.z / r;
  return out.set(
    o.position.x - uz * e.x - ux * e.z,
    o.position.y + e.y,
    o.position.z + ux * e.x - uz * e.z,
  );
}
/** Best structure edge in reach and view (closest point on each line), or null. */
function edgePick() {
  let best = null,
    bd = 0.62;
  const w = new T3.Vector3();
  for (const c of COL) {
    const o = c.o;
    if (!c.edges.length || Math.abs(o.position.y - P.y) > 30) continue;
    const ox = o.position.x,
      oz = o.position.z,
      r = Math.hypot(ox, oz) || 1,
      lx = (P.x - ox) * (-oz / r) + (P.z - oz) * (ox / r);
    for (const [x0, x1, y, z] of c.edges) {
      const e = { o, x: Math.max(x0, Math.min(x1, lx)), y, z };
      edgePt(e, w);
      const dx = w.x - P.x,
        dy = w.y - P.y,
        dz = w.z - P.z,
        d = Math.hypot(dx, dy, dz);
      if (d > 3.7 || d < 0.2) continue;
      const k = (dx * F.x + dy * F.y + dz * F.z) / d;
      if (k > bd) {
        bd = k;
        best = e;
      }
    }
  }
  return best;
}
/**
 * Pick what a hand grabs: a real handhold, else a structure edge, else (wall-grip power-up) the wall.
 * hd = hand index (writes that hand's virtual hold slot); omit it for a read-only crosshair test.
 */
function pick(skip, hd) {
  cam.getWorldDirection(F);
  pickEdge = null;
  let b = -1,
    bd = 0.62;
  for (let i = 0; i < VI[0]; i++) {
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
  if (b >= 0) return b;
  const e = edgePick();
  if (e) {
    if (hd == null) return VI[0]; // crosshair only
    pickEdge = e;
    edgePt(e, H[VI[hd]]);
    return VI[hd];
  }
  if (hd != null && PW.wg > 0) {
    const a = F.x * F.x + F.z * F.z,
      bq = 2 * (P.x * F.x + P.z * F.z),
      c = P.x * P.x + P.z * P.z - 182.25,
      D = bq * bq - 4 * a * c;
    if (a > 1e-4 && D > 0) {
      const t = (-bq + Math.sqrt(D)) / (2 * a);
      if (t > 0.3 && t < 3.8) {
        H[VI[hd]].set(P.x + F.x * t, P.y + F.y * t, P.z + F.z * t);
        return VI[hd];
      }
    }
  }
  return -1;
}
