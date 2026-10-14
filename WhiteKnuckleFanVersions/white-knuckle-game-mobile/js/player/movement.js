/**
 * Jump logic (ground, off-hold, hook release, double jump).
 */
function jump() {
  const gg = hs.filter((h) => h.i >= 0);
  if (HK.on) {
    HK.on = 0;
    V.y += 5;
    snd("jump");
    return;
  }
  if (G) {
    V.y = 9.5;
    snd("jump");
    return;
  }
  if (gg.length) {
    if (gg.some((h) => h.s < 8)) return;
    cam.getWorldDirection(F);
    const l = Math.hypot(F.x, F.z) || 1;
    V.set((F.x / l) * 3.5, 11.5, (F.z / l) * 3.5);
    gg.forEach((h) => {
      h.s -= 7;
      h.i = -1;
      h.cd = 0.22;
    });
    snd("jump");
    return;
  }
  if (PW.dj > 0 && dj) {
    dj = 0;
    V.y = Math.max(V.y, 0) + 9;
    shk = 0.1;
    snd("jump");
  }
}
