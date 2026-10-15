/**
 * Per-frame rendering: camera, monster animation and HUD updates.
 */
// render
const fm = (n, f) => n.toFixed(f);
let roll = 0,
  rLast = 0;
function draw(t) {
  const zh = st == "menu" ? 285 : P.y;
  const rdt = Math.min(0.05, Math.max(0, t - rLast));
  rLast = t;
  if (st != "play") darkT = 0;
  else if (M.on && ht >= 350)
    darkT = 1; // the hunter smothers the silo in dark fog
  else if (ht < 335) darkT = 0;
  DARK += (darkT - DARK) * Math.min(1, rdt * 0.6);
  const dk = DARK * DARK_STRENGTH;
  zone(zh);
  c1.multiplyScalar(1 - 0.8 * dk);
  c2.multiplyScalar(1 - 0.97 * dk);
  wm.color.copy(c1);
  sc.fog.color.copy(c2);
  sc.fog.near = 2.3 - 1.1 * dk;
  sc.fog.far = 25.5 - 14.5 * dk;
  amb.intensity = 1 - 0.96 * dk;
  rn.setClearColor(c2);
  const cin = st == "win" || (st == "end" && VIC.visible); // victory scene stays behind the end screen
  if (cin) victoryLook();
  if (st == "menu") {
    cam.position.set(0, 285, 0);
    cam.rotation.set(0.1, t * 0.06, 0, "YXZ");
  } else if (cin) {
    victoryCam(rdt);
  } else {
    cam.position.copy(P);
    if (shk > 0) {
      cam.position.x += (Math.random() - 0.5) * shk;
      cam.position.y += (Math.random() - 0.5) * shk;
      shk -= 0.012;
    }
    const sp = V.length(),
      rv = V.x * Math.cos(yaw) - V.z * Math.sin(yaw);
    roll += (Math.max(-0.14, Math.min(0.14, -rv * 0.014)) - roll) * 0.1;
    cam.rotation.set(pitch, yaw, roll, "YXZ");
    const fv = 82 + Math.min(18, sp * 0.9);
    if (Math.abs(cam.fov - fv) > 0.2) {
      cam.fov += (fv - cam.fov) * 0.12;
      cam.updateProjectionMatrix();
    }
  }
  hzm.position.y = hz;
  {
    const sp = st == "play" ? V.length() : 0;
    if (wg) {
      wg.gain.setTargetAtTime(
        Math.max(0, Math.min(0.12, (sp - 12) * 0.008)),
        AC.currentTime,
        0.15,
      );
      wf.frequency.value = 300 + sp * 20;
    }
    MG.visible = !!M.on;
    if (M.on) animateMonster(t);
    IT.forEach((i) => {
      i.o.rotation.y = t * 1.6;
      i.o.position.y = 1.1 + Math.sin(t * 2.2) * 0.12;
    });
    $("gn").style.display = st == "play" && eq() == "gun" ? "block" : "none";
    $("gn").style.opacity = 1;
    HD.forEach((h) => (h.style.display = st == "play" ? "" : "none"));
    FL.style.display = st == "play" && lampEq ? "block" : "none";
  }
  if (st != "play") return;
  $("ht").textContent = fm(ht, 1) + " M";
  $("st2").textContent =
    "HP " +
    hp +
    (eq() == "gun" ? "   DARTS " + ammo : "") +
    (M.sl > 0 ? "   SLOWED" : "") +
    (M.irr > 0 ? "   IRRITATED" : "") +
    (lampEq ? "" : "   LIGHT OFF");
  [...$("inv").children].forEach((d, i) => {
    const s = SL[i];
    d.textContent =
      i + 1 + (s ? " " + IN[s.t] + (s.n > 1 ? " x" + s.n : "") : "");
    d.className =
      "sl" + (i == sel || (s && s.t == "light" && lampEq) ? " on" : "");
  });
  $("pw").innerHTML = PN.filter(([k]) => PW[k] > 0)
    .map(([k, n]) => n + " x" + PW[k])
    .join("<br>");
  PU.forEach((u) => {
    u.o.rotation.y = t * 2;
    u.o.rotation.x = t * 1.2;
  });
  hkL.visible = !!HK.on;
  if (HK.on) {
    const pa = hkL.geometry.attributes.position;
    cam.localToWorld(WV.set(0.45, -0.45, -0.8));
    pa.setXYZ(0, WV.x, WV.y, WV.z);
    pa.setXYZ(1, HK.a.x, HK.a.y, HK.a.z);
    pa.needsUpdate = true;
  }
  nIt = null;
  {
    let bd = 2.8;
    for (const i of IT)
      if (i.on) {
        const d = i.o.getWorldPosition(WV).distanceTo(P);
        if (d < bd) {
          bd = d;
          nIt = i;
        }
      }
  }
  $("pr").textContent = nIt
    ? (TOUCH ? "TAP TO TAKE " : "[E] TAKE ") +
      { gun: "DART GUN", ammo: "DARTS", chalk: "CHALK" }[nIt.t] +
      (SL.includes(null) || nIt.t == "ammo" ? "" : " (FULL)")
    : "";
  $("tm").textContent = $("ot").checked
    ? ((tt / 60) | 0) + ":" + fm(tt % 60, 2).padStart(5, "0")
    : "";
  $("dg").style.opacity = Math.min(0.85, Math.max(0, 1 - (P.y - hz) / 14));
  $("ch").className = pick(-1) >= 0 ? "on" : "";
  hs.forEach((h, i) => {
    const b = $("b" + i),
      f = b.firstChild;
    f.style.height = h.s + "%";
    f.style.background =
      h.s < 28
        ? (t * 8) % 2 < 1
          ? "#d41f1f"
          : "#fff"
        : h.lk
          ? "#822"
          : "#eee";
  });
  updateHands(t);
}
