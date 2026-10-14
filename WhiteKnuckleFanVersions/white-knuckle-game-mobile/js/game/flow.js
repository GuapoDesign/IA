/**
 * Game flow: overlay visibility, reset and death.
 */
const vis = (i, on) =>
  ($(i).style.display = on ? (i == "menu" ? "block" : "flex") : "none");
function reset() {
  P.set(12, 1.7, 0);
  V.set(0, 0, 0);
  yaw = -1.57;
  pitch = 0.35;
  hz = -7;
  tt = 0;
  fell = 0;
  M.on = 0;
  M.sl = 0;
  M.cd = 0;
  hp = 3;
  ammo = 0;
  SL.fill(null);
  sel = -1;
  G = 0;
  tl.intensity = 2.4;
  PW.dj = PW.wg = PW.hk = PW.st = 0;
  HK.on = 0;
  dj = 1;
  PU.forEach((u) => {
    u.on = 1;
    u.o.visible = true;
  });
  IT.forEach((i) => {
    i.on = 1;
    i.o.visible = true;
  });
  hs.forEach((h) => {
    h.i = -1;
    h.s = 100;
    h.lk = 0;
    h.dn = 0;
    h.cd = 0;
    h.rg = 0;
  });
  st = "play";
  au();
  vis("menu", 0);
  vis("play", 0);
  vis("end", 0);
  $("hud").style.display = "block";
  if (TOUCH) enterTouchMode();
  else if (cv.requestPointerLock) cv.requestPointerLock();
}
function die(t) {
  st = "end";
  snd("die");
  HK.on = 0;
  hkL.visible = false;
  ht = Math.max(0, P.y - 1.7);
  if (ht > best) {
    best = ht;
    try {
      localStorage.setItem("wk_best", best);
    } catch (e) {}
  }
  if (document.exitPointerLock) document.exitPointerLock();
  $("et").textContent = t;
  $("es").textContent =
    "HEIGHT " +
    ht.toFixed(1) +
    " M   BEST " +
    best.toFixed(1) +
    " M   TIME " +
    tt.toFixed(1) +
    " S";
  vis("end", 1);
  $("hud").style.display = "none";
  WH.forEach((w) => (w.style.display = "none"));
}
