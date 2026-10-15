/**
 * Per-frame simulation: stamina, grips, physics, monster AI, landing and death.
 */
// sim
function sim(dt) {
  tt += dt;
  PL.forEach((q) => {
    q.pt = q.top;
    const a = tt * q.sp + q.ph;
    q.top = q.y0 + q.amp * Math.sin(a);
    q.v = q.amp * q.sp * Math.cos(a);
    q.m.position.y = q.top - 0.6;
  });
  const g = hs.filter((h) => h.i >= 0).length;
  for (const h of hs) {
    h.cd = Math.max(0, h.cd - dt);
    if (h.free && h.i < 0) h.free = 0; // adrenaline grip ended
    if (h.e && h.i !== h.es) h.e = null; // edge released
    if (h.e) edgePt(h.e, H[h.i]); // keep the hand on a moving structure
    if (h.i >= 0) {
      h.s -=
        (h.free ? 0 : 1) * (5 + Math.min(5, V.length() * 0.4)) * STAM_COST * dt;
      if (h.s <= 0) {
        h.s = 0;
        h.i = -1;
        h.lk = 1;
      }
    } else if ((h.rg -= dt) < 0) {
      h.s = Math.min(100, h.s + (g ? 18.9 : G ? 63 : 35.7) * dt);
    }
    if (h.lk && h.s > 20) h.lk = 0;
    if (
      h.dn &&
      h.i < 0 &&
      !h.lk &&
      !h.cd &&
      h.s > 8 &&
      !(h === hs[1] && eq() == "gun") &&
      !(h === hs[0] && lampEq)
    ) {
      const o = hs[0] == h ? hs[1].i : hs[0].i;
      h.i = pick(o, hs.indexOf(h));
      h.e = h.i >= 0 ? pickEdge : null;
      h.es = h.i;
      if (h.i >= 0) {
        if (h.i >= VI[0] && !h.e) PW.wg--; // wall grip spends a charge
        h.free = PW.st > 0 && PW.st-- > 0; // adrenaline: this grip costs no stamina
        h.s -= 4 * STAM_COST;
        h.rg = 0.5;
        grabFx(h.i);
      }
    }
  }
  const gg = hs.filter((h) => h.i >= 0);
  if (gg.length) {
    let tx = 0,
      ty = 0,
      tz = 0;
    for (const h of gg) {
      const p = H[h.i],
        r = Math.hypot(p.x, p.z);
      tx += p.x * (1 - 1.15 / r);
      ty += p.y - 1.3;
      tz += p.z * (1 - 1.15 / r);
    }
    const n = gg.length;
    V.x += (tx / n - P.x) * 34 * dt;
    V.y += ((ty / n - P.y) * 34 - 10) * dt;
    V.z += (tz / n - P.z) * 34 * dt;
    V.multiplyScalar(Math.max(0, 1 - 3.2 * dt));
    fell = 0;
  } else {
    V.y = Math.max(-42, V.y - 25 * dt);
    fell = Math.max(fell, -V.y);
    if (!G) {
      V.x *= 1 - 0.12 * dt;
      V.z *= 1 - 0.12 * dt;
    }
  }
  const mx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0),
    mz = (K.KeyW ? 1 : 0) - (K.KeyS ? 1 : 0),
    s = (gg.length ? 5 : G ? (K.ShiftLeft ? 60 : 32) : 9) * dt,
    c = Math.cos(yaw),
    n = Math.sin(yaw);
  V.x += (c * mx - n * mz) * s;
  V.z += (-n * mx - c * mz) * s;
  P.addScaledVector(V, dt);
  hkSim(dt);
  const r = Math.hypot(P.x, P.z);
  if (r > 12.75) {
    P.x *= 12.75 / r;
    P.z *= 12.75 / r;
    const d = (V.x * P.x + V.z * P.z) / 12.75 / 12.75;
    if (d > 0) {
      V.x -= P.x * d;
      V.z -= P.z * d;
    }
  }
  gcd -= dt;
  if (updateMonster(dt)) return die("MAULED");
  if (tt > 5) hz += (0.4 + Math.max(0, P.y) * 0.0016) * dt;
  if (P.y < hz + 0.9) return die("CONSUMED");
  const py = P.y - V.y * dt;
  let gr = 0,
    dd = 0;
  const L = (ty, vy) => {
    if (fell > 26) dd = 1;
    if (V.y < -5) snd("land");
    P.y = ty + 1.7;
    V.y = vy;
    V.x *= 1 - 8 * dt;
    V.z *= 1 - 8 * dt;
    fell = 0;
    gr = 1;
  };
  if (P.y < 1.7 && py >= 1.68) L(0, 0);
  const hit = resolveSolids(py);
  if (hit) L(hit.top, hit.vy);
  if (dd) {
    G = gr;
    return die("YOU FELL");
  }
  G = gr;
  if (G && Math.hypot(V.x, V.z) > 1.5 && (stepT -= dt) <= 0) {
    stepT = K.ShiftLeft ? 0.27 : 0.42;
    snd("step");
  }
  ht = Math.max(0, P.y - 1.7);
  if (ht >= 640) startVictory();
}
