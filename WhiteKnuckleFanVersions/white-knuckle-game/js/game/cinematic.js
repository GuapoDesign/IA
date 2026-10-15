/**
 * Victory cinematic. Reaching 640 m hands the camera over: it rises out of the silo into a sunrise
 * sky over the surface skyline, with letterbox bars, a title and a fanfare. Click / Space / tap
 * skips to the end screen.
 */
const HAZE = new T3.Color(0x9a6a6a),
  SUN_OFF = 2.4, // sun direction relative to the start angle
  VIC = new T3.Group();
let vt = 0; // seconds since the cinematic started
VIC.visible = false;
sc.add(VIC);
const smooth = (a, b, x) => {
  const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const SKY = (() => {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 128;
  const g = c.getContext("2d");
  [
    "#0a0820",
    "#16103a",
    "#2a1a52",
    "#4a2060",
    "#7a2a68",
    "#b43a5c",
    "#e0603c",
    "#f89a40",
    "#ffd070",
    "#ffe9a8",
  ].forEach((col, i) => {
    g.fillStyle = col; // zenith -> horizon (banded for the pixel look)
    g.fillRect(0, (i * 6.4) | 0, 8, 7);
  });
  ["#d8985a", "#a8605a", "#7a3a50", "#4a2440", "#2a1630", "#180c24"].forEach(
    (col, i) => {
      g.fillStyle = col; // below the horizon: warm haze fading to dark
      g.fillRect(0, 64 + ((i * 10.7) | 0), 8, 11);
    },
  );
  const t = new T3.CanvasTexture(c);
  t.magFilter = t.minFilter = T3.NearestFilter;
  const m = new T3.Mesh(
    new T3.SphereGeometry(450, 16, 10),
    new T3.MeshBasicMaterial({
      map: t,
      side: T3.BackSide,
      fog: false,
      depthWrite: false,
    }),
  );
  m.renderOrder = -2;
  VIC.add(m);
  return m;
})();
const SUN = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  [
    [15, "rgba(255,190,90,.22)"],
    [12, "rgba(255,200,100,.4)"],
    [9, "#ffd070"],
    [6, "#fff3c0"],
  ].forEach(([r, col]) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(16, 16, r, 0, 6.283);
    g.fill();
  });
  const t = new T3.CanvasTexture(c);
  t.magFilter = t.minFilter = T3.NearestFilter;
  const s = new T3.Sprite(
    new T3.SpriteMaterial({ map: t, fog: false, depthWrite: false }),
  );
  s.scale.set(80, 80, 1);
  s.renderOrder = -1;
  VIC.add(s);
  return s;
})();
{
  const dark = new T3.MeshBasicMaterial({ color: 0x120c1a }),
    win = new T3.MeshBasicMaterial({ color: 0xffc860 }),
    box = (w, h, d, m, x, y, z) => {
      const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), m);
      o.position.set(x, y, z);
      VIC.add(o);
      return o;
    },
    ground = new T3.Mesh(
      new T3.RingGeometry(14.2, 420, 28),
      new T3.MeshBasicMaterial({ color: 0x1c1424, side: T3.DoubleSide }),
    );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 709.9;
  VIC.add(ground);
  const rim = new T3.Mesh(
    new T3.TorusGeometry(14.3, 0.8, 5, 36),
    new T3.MeshBasicMaterial({ color: 0x3a3640 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 710;
  VIC.add(rim);
  for (let i = 0; i < 90; i++) {
    // skyline of the surface: towers, blocks and cranes with a few lit windows
    const a = (i * 2.399) % 6.283,
      r = 70 + ((i * 37) % 90),
      w = 4 + ((i * 7) % 9),
      h = 4 + ((i * 53) % 28) + (i % 9 == 0 ? 40 : 0),
      x = Math.cos(a) * r,
      z = Math.sin(a) * r;
    box(w, h, w, dark, x, 709.9 + h / 2, z);
    if (i % 3 == 0) {
      const wd = box(
        0.9,
        0.9,
        0.2,
        win,
        x - Math.cos(a) * (w / 2 + 0.1),
        709.9 + h * 0.6,
        z - Math.sin(a) * (w / 2 + 0.1),
      );
      wd.lookAt(0, wd.position.y, 0);
    }
    if (i % 11 == 0) {
      box(1, h + 30, 1, dark, x + 6, 709.9 + (h + 30) / 2, z);
      box(16, 1, 1, dark, x + 6, 709.9 + h + 30, z);
    }
  }
}
if (TOUCH) $("cskip").textContent = "TAP TO SKIP";
const fmtTime = (s) =>
  ((s / 60) | 0) + ":" + (s % 60).toFixed(1).padStart(4, "0");

/** Hand the game over to the cinematic (called when the player reaches 640 m). */
function startVictory() {
  st = "win";
  vt = 0;
  best = Math.max(best, 640);
  try {
    localStorage.setItem("wk_best", best);
  } catch (e) {}
  HK.on = 0;
  hkL.visible = false;
  M.on = 0;
  MG.visible = false;
  K.KeyW = K.KeyA = K.KeyS = K.KeyD = K.ShiftLeft = 0;
  hs.forEach((h) => {
    h.i = -1;
    h.dn = 0;
  });
  VIC.p0 = P.clone();
  VIC.a0 = Math.atan2(P.z, P.x);
  VIC.visible = true;
  cam.far = 800;
  cam.updateProjectionMatrix();
  $("hud").style.display = "none";
  $("cstat").textContent = "TIME " + fmtTime(tt) + "   ·   640 M";
  $("cin").className = "";
  snd("victory");
}
/** Camera move: up the shaft, over the rim, then a slow orbit toward the rising sun. */
function victoryCam(dt) {
  vt += dt;
  const y = VIC.p0.y + (738 - VIC.p0.y) * smooth(0, 9.5, vt),
    r = vt < 4 ? 12.2 - 3.2 * smooth(0, 4, vt) : 9 + 24 * smooth(4, 11, vt),
    a = VIC.a0 + vt * 0.06,
    x = Math.cos(a) * r,
    z = Math.sin(a) * r,
    sa = VIC.a0 + SUN_OFF,
    up = new T3.Vector3(0, y + 60, 0),
    sun = new T3.Vector3(
      Math.cos(sa) * 200 + x,
      y + 18 + 14 * smooth(3, 9, vt),
      Math.sin(sa) * 200 + z,
    );
  cam.position.set(x, y, z);
  cam.lookAt(up.lerp(sun, smooth(2.5, 7, vt)));
  cam.rotateZ(Math.sin(vt * 0.7) * 0.03);
  if (Math.abs(cam.fov - 70) > 0.2) {
    cam.fov += (70 - cam.fov) * 0.05;
    cam.updateProjectionMatrix();
  }
  SKY.position.copy(cam.position);
  SUN.position.set(
    x + Math.cos(sa) * 300,
    y + 20 + 70 * smooth(0, 10, vt),
    z + Math.sin(sa) * 300,
  );
  if (st == "win") {
    if (vt > 0.2) $("cin").classList.add("on");
    if (vt > 5) $("cin").classList.add("show");
    if (vt > 13) finishVictory();
  }
}
/** Dawn light: the dark fog gives way to warm haze. */
function victoryLook() {
  const k = smooth(0, 4, vt);
  sc.fog.near += (30 - sc.fog.near) * k;
  sc.fog.far += (520 - sc.fog.far) * k;
  sc.fog.color.lerp(HAZE, k);
  rn.setClearColor(sc.fog.color);
  amb.intensity += (1.3 - amb.intensity) * k;
  lamp.intensity = 0.3 * (1 - k);
  tl.intensity = 0;
}
/** Cinematic -> end screen (the sunrise keeps turning behind it). */
function finishVictory() {
  if (st != "win") return;
  st = "end";
  if (document.exitPointerLock) document.exitPointerLock();
  $("et").textContent = "SURFACE REACHED";
  $("es").textContent =
    "TIME " + fmtTime(tt) + "   BEST " + best.toFixed(1) + " M";
  $("end").classList.add("win");
  $("cin").className = "";
  vis("end", 1);
}
/** Back to the normal game (called by reset()). */
function endCinematic() {
  VIC.visible = false;
  cam.far = 90;
  cam.updateProjectionMatrix();
  $("cin").className = "";
  $("end").classList.remove("win");
  vt = 0;
}
addEventListener(
  "pointerdown",
  () => st == "win" && vt > 1.2 && finishVictory(),
);
addEventListener("keydown", (e) => {
  if (st == "win" && vt > 1.2 && ["Space", "Enter", "Escape"].includes(e.code))
    finishVictory();
});
