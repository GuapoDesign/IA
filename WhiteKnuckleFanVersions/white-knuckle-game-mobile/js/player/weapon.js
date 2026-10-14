/**
 * Dart gun firing.
 */
function fire() {
  if (eq() != "gun") return;
  if (ammo < 1) {
    if (gcd <= 0) {
      snd("click");
      gcd = 0.3;
    }
    return;
  }
  if (gcd > 0) return;
  ammo--;
  gcd = 0.3;
  snd("shot");
  pitch += 0.03;
  shk = 0.15;
  const g = $("gn"),
    f = $("mf");
  g.classList.add("f");
  f.style.opacity = 1;
  setTimeout(() => {
    g.classList.remove("f");
    f.style.opacity = 0;
  }, 80);
  cam.getWorldDirection(F);
  if (M.on) {
    const d = M.p.clone().sub(P),
      t = d.dot(F);
    if (t > 0) {
      const q = d.addScaledVector(F, -t).length();
      if (q < 2.6 + t * 0.04) {
        M.sl = 6;
        M.fl = 0.2;
        snd("hit2");
      }
    }
  }
}
