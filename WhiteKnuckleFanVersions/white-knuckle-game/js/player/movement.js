/**
 * Jump logic (ground, off-hold, hook release, double jump). Holding Shift = boosted (higher) jump.
 */
function jump() {
  const boost = !!K.ShiftLeft,
    gg = hs.filter((h) => h.i >= 0);
  if (HK.on) {
    HK.on = 0;
    V.y += 5;
    snd("jump");
    return;
  }
  if (G) {
    V.y = boost ? 10.9 : 9.5;
    if (boost) {
      V.x *= 1.15; // keep the run momentum
      V.z *= 1.15;
      shk = 0.06;
    }
    snd(boost ? "boost" : "jump");
    return;
  }
  if (gg.length) {
    if (gg.some((h) => h.s < 8)) return;
    cam.getWorldDirection(F);
    const l = Math.hypot(F.x, F.z) || 1;
    V.set(
      (F.x / l) * (boost ? 4.5 : 3.5),
      boost ? 12.6 : 11.5,
      (F.z / l) * (boost ? 4.5 : 3.5),
    );
    gg.forEach((h) => {
      h.s -= 7 * STAM_COST;
      h.i = -1;
      h.cd = 0.22;
    });
    snd("jump");
    return;
  }
  if (PW.dj > 0 && dj) {
    dj = 0;
    PW.dj--;
    V.y = Math.max(V.y, 0) + (boost ? 10 : 9);
    shk = 0.1;
    snd("jump");
  }
}
