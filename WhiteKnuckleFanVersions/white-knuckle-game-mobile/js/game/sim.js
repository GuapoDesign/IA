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
    if (h.i >= 0) {
      h.s -= (PW.st > 0 ? 0 : 1) * (5 + Math.min(5, V.length() * 0.4)) * dt;
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
      !(h === hs[1] && eq() == "gun")
    ) {
      const o = hs[0] == h ? hs[1].i : hs[0].i;
      h.i = pick(o, hs.indexOf(h));
      if (h.i >= 0) {
        h.s -= 4;
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
    s = (gg.length ? 5 : G ? (K.ShiftLeft ? 52 : 30) : 9) * dt,
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
  M.sl -= dt;
  M.cd -= dt;
  M.fl -= dt;
  if (ht > 150 && !M.on) {
    M.on = 1;
    const a = Math.atan2(P.z, P.x);
    M.p.set(Math.cos(a) * 13.2, Math.max(3, P.y - 26), Math.sin(a) * 13.2);
    snd("roar");
  }
  if (M.on) {
    const d = P.clone().sub(M.p),
      L = d.length() || 1,
      sp = (2.9 + Math.min(2, ht * 0.003)) * (M.sl > 0 ? 0.2 : 1);
    M.p.addScaledVector(d, (sp * dt) / L);
    M.p.y = Math.max(1.5, M.p.y);
    const mr = Math.hypot(M.p.x, M.p.z) || 1;
    M.p.x *= 13.2 / mr;
    M.p.z *= 13.2 / mr;
    if (L < 2.7 && M.cd <= 0) {
      M.cd = 1.6;
      hp--;
      snd("hit");
      shk = 0.5;
      d.normalize();
      V.set(d.x * 12, d.y * 6 + 7, d.z * 12);
      hs.forEach((h) => {
        h.i = -1;
        h.cd = 0.4;
        h.s = Math.min(h.s, 25);
      });
      if (hp <= 0) return die("MAULED");
    }
  }
  if (tt > 5) hz += (0.4 + Math.max(0, P.y) * 0.0016) * dt;
  if (P.y < hz + 0.9) return die("CONSUMED");
  const py = P.y - V.y * dt;
  let gr = 0,
    dd = 0;
  const an2 = Math.atan2(P.z, P.x),
    L = (ty, vy) => {
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
  for (const q of PL)
    if (P.y < q.top + 1.7 && py >= q.pt + 1.68 && r > 9.6) {
      let d = Math.abs(an2 - q.ca);
      d = Math.min(d, 6.283 - d);
      if (d < (q.hw || 0.27)) L(q.top, q.v);
    }
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
  if (ht >= 640) die("SURFACE REACHED");
}
