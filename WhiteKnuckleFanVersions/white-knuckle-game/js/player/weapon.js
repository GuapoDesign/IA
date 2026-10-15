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
  pitch += 0.045;
  shk = 0.22;
  gunFire();
  cam.getWorldDirection(F);
  if (M.on) {
    const d = M.p.clone().sub(P),
      t = d.dot(F);
    if (t > 0) {
      const q = d.addScaledVector(F, -t).length();
      if (q < 2.6 + t * 0.04) {
        monsterHit();
      }
    }
  }
}
