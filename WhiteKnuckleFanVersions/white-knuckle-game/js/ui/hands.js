/**
 * Hands, gun and item sprites. Everything is drawn procedurally as greyscale shapes, then converted
 * into a dithered, palette-limited pixel sprite with a 1px outline (dark for hands, light for items).
 * Hand poses are continuous (curl / spread / thumb), so every state change is tweened smoothly:
 * idle, reaching, gripping a hold (follows the hold on screen), holding an object, exhausted (open).
 * Hands get redder as stamina drops.
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const rgb = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
/** 4 tones (dark -> light) of one base colour. */
const ramp = (h) =>
  [0.22, 0.55, 0.85, 1.15].map((m) => rgb(h).map((v) => Math.min(255, v * m)));
const mix = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Greyscale drawing in canvas g -> ordered-dither 4-tone sprite with a 1px outline. */
function pixelize(g, w, h, tones, edge) {
  const d = g.getImageData(0, 0, w, h).data,
    o = new Uint8ClampedArray(d.length),
    solid = (x, y) =>
      x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 110,
    put = (k, c) => {
      o[k] = c[0];
      o[k + 1] = c[1];
      o[k + 2] = c[2];
      o[k + 3] = 255;
    };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      if (solid(x, y)) {
        const l = (d[k] / 255) * 4 + (BAYER[(y & 3) * 4 + (x & 3)] - 7.5) / 16;
        put(k, tones[Math.max(0, Math.min(3, Math.floor(l)))]);
      } else if (
        edge &&
        (solid(x - 1, y) ||
          solid(x + 1, y) ||
          solid(x, y - 1) ||
          solid(x, y + 1))
      )
        put(k, edge);
    }
  g.putImageData(new ImageData(o, w, h), 0, 0);
}

// ---- Hand drawing -------------------------------------------------------------------------
const HW = 44,
  HH = 60;
/** Finger base x, y, spread angle and the 3 segment lengths (index -> pinky, right hand seen from behind). */
const FING = [
  [-7.6, -31, -0.32, [7, 6, 4.6]],
  [-2.7, -35, -0.11, [8.6, 7, 5]],
  [2.6, -35, 0.09, [8, 6.6, 4.8]],
  [7.1, -32, 0.3, [6.6, 5.6, 4]],
];
const grey = (v) => `rgb(${v},${v},${v})`;
function drawHand(g, S) {
  g.clearRect(0, 0, HW, HH);
  g.lineCap = g.lineJoin = "round";
  g.save();
  g.translate(HW / 2, HH);
  g.rotate(-0.22); // one shared viewing angle for every pose
  const fg = g.createLinearGradient(-9, 0, 9, 0);
  fg.addColorStop(0, grey(70));
  fg.addColorStop(1, grey(135));
  g.fillStyle = fg; // forearm
  g.beginPath();
  g.moveTo(-9, 2);
  g.lineTo(-8, -20);
  g.lineTo(8, -20);
  g.lineTo(9, 2);
  g.fill();
  const pg = g.createLinearGradient(-10, -36, 10, -18);
  pg.addColorStop(0, grey(190));
  pg.addColorStop(1, grey(112));
  g.fillStyle = pg; // palm / back of hand
  g.beginPath();
  g.ellipse(0, -27, 10.5, 9, 0, 0, 6.283);
  g.fill();
  g.fillStyle = grey(192);
  g.beginPath();
  g.ellipse(-1.5, -29, 6, 4.5, 0, 0, 6.283);
  g.fill();
  g.fillStyle = grey(78);
  g.fillRect(-8, -19, 16, 1);
  const thumb = () => {
    let px = -9,
      py = -24,
      th = -1.15 + S.thumb * 1.9;
    [
      [6.5, 5.2, 200],
      [5.2, 4.6, 184],
    ].forEach(([L, w, v], j) => {
      g.strokeStyle = grey(v);
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(px, py);
      th += j * S.thumb * 0.6;
      px += Math.sin(th) * L;
      py -= Math.cos(th) * L;
      g.lineTo(px, py);
      g.stroke();
    });
  };
  if (S.thumb < 0.5) thumb();
  FING.forEach(([x, y, a, L], i) => {
    const dir = i < 2 ? 1 : -1;
    let px = x,
      py = y;
    g.fillStyle = grey(228); // knuckle highlight
    g.beginPath();
    g.arc(x, y, 2.3 + S.curl * 0.9, 0, 6.283);
    g.fill();
    [0.15, 0.3, 0.45].forEach((bend, j) => {
      const th = a * (0.35 + S.spread * 1.3) + dir * S.curl * bend;
      g.strokeStyle = grey([212, 194, 174][j]);
      g.lineWidth = [4.9, 4.5, 4.1][j];
      g.beginPath();
      g.moveTo(px, py);
      const len = L[j] * (1 - S.curl * [0.45, 0.7, 0.85][j]); // curled fingers foreshorten
      px += Math.sin(th) * len;
      py -= Math.cos(th) * len;
      g.lineTo(px, py);
      g.stroke();
      g.fillStyle = grey(j < 2 ? 112 : 236); // joint crease / fingertip
      g.beginPath();
      g.arc(px, py, j < 2 ? 0.9 : 1.2, 0, 6.283);
      g.fill();
    });
  });
  if (S.thumb >= 0.5) thumb();
  g.restore();
}
const FW = 24,
  FH = 40;
/** Pixel flashlight (held in the left hand), thin light outline, glowing lens. */
const FL = (() => {
  const c = document.createElement("canvas");
  c.id = "fl";
  c.width = FW;
  c.height = FH;
  document.body.appendChild(c);
  const g = c.getContext("2d"),
    R = (v, x, y, w, h) => {
      g.fillStyle = grey(v);
      g.fillRect(x, y, w, h);
    },
    bg = g.createLinearGradient(8, 0, 17, 0);
  bg.addColorStop(0, grey(80));
  bg.addColorStop(0.4, grey(185));
  bg.addColorStop(1, grey(70));
  g.fillStyle = bg;
  g.fillRect(8, 14, 9, 22); // body
  R(150, 5, 4, 15, 10); // head
  R(60, 6, 3, 13, 3); // lens ring
  for (let i = 0; i < 4; i++) R(55, 8, 18 + i * 4, 9, 1); // grip ridges
  R(210, 11, 24, 3, 4); // switch
  R(95, 8, 36, 9, 3); // tail cap
  pixelize(g, FW, FH, ramp(0x5a5d66), [200, 200, 205]);
  g.fillStyle = "#fff3b0"; // lit lens
  g.fillRect(7, 2, 11, 2);
  g.fillStyle = "#ffd96a";
  g.fillRect(9, 1, 7, 1);
  return c;
})();
const HSKIN = ramp(0xe9c6da),
  HBLOOD = ramp(0xd23232),
  HC = [0, 1].map((i) => {
    const c = document.createElement("canvas");
    c.width = HW;
    c.height = HH;
    c.className = "hd";
    c.id = "h" + i;
    document.body.appendChild(c);
    return c;
  }),
  HD = HC,
  HX = HC.map((c) => c.getContext("2d")),
  HST = [0, 1].map(() => ({
    x: null,
    y: 0,
    rot: 0,
    curl: 0.2,
    spread: 0.45,
    thumb: 0.2,
    red: 0,
    key: "",
  }));
const rf = (a, b) => a + Math.random() * (b - a),
  mkPool = (cls) =>
    Array.from({ length: cls == "pf" ? 8 : 4 }, () => {
      const d = document.createElement("div");
      d.className = cls;
      document.body.appendChild(d);
      return { d, life: 0 };
    }),
  PF = mkPool("pf"), // smoke puffs
  CS = mkPool("cs"), // ejected casings
  MZ = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 24;
    c.id = "mz";
    document.body.appendChild(c);
    const g = c.getContext("2d");
    g.translate(12, 12);
    for (let i = 0; i < 8; i++) {
      g.save();
      g.rotate((i * Math.PI) / 4);
      g.fillStyle = grey(i % 2 ? 140 : 215);
      g.beginPath();
      g.moveTo(0, -2);
      g.lineTo(2.2, -(i % 2 ? 7 : 11));
      g.lineTo(-2.2, -(i % 2 ? 7 : 11));
      g.fill();
      g.restore();
    }
    g.fillStyle = grey(255);
    g.beginPath();
    g.arc(0, 0, 4, 0, 6.283);
    g.fill();
    g.setTransform(1, 0, 0, 1, 0, 0);
    pixelize(
      g,
      24,
      24,
      [
        [120, 30, 8],
        [255, 110, 24],
        [255, 200, 80],
        [255, 250, 210],
      ],
      null,
    );
    return c;
  })();
let muzzleT = 0, // muzzle-flash time left
  gunPose = null, // muzzle / ejection-port screen positions
  pfI = 0,
  csI = 0,
  itemT = 0, // seconds left that the left hand shows a picked-up item
  gunKick = 0, // recoil 1 -> 0
  gunIn = 1, // gun raise animation 0 -> 1
  hLast = -1;

/** Trigger the shot visuals: recoil, muzzle flash, smoke and a flying casing. */
function gunFire() {
  gunKick = 1;
  muzzleT = 0.075;
  if (!gunPose) return;
  for (let k = 0; k < 3; k++)
    Object.assign(PF[pfI++ % PF.length], {
      x: gunPose.mx + rf(-6, 6),
      y: gunPose.my,
      vx: rf(-25, 25),
      vy: -rf(25, 70),
      s: 0.6,
      life: 0.9,
    });
  Object.assign(CS[csI++ % CS.length], {
    x: gunPose.px,
    y: gunPose.py,
    vx: rf(160, 260),
    vy: -rf(160, 260),
    r: 0,
    vr: rf(8, 16),
    life: 0.75,
  });
}
/** Per-frame hand state machine + tween (called from game/render.js while playing). */
function updateHands(t) {
  const dt = hLast < 0 ? 0 : Math.min(0.05, Math.max(0, t - hLast)),
    sc = Math.max(2.2, Math.min(5, innerHeight / 250)),
    hpx = HH * sc;
  hLast = t;
  itemT = Math.max(0, itemT - dt);
  gunKick = Math.max(0, gunKick - dt * 7);
  gunIn = Math.min(1, gunIn + dt * 2.6);
  hs.forEach((h, i) => {
    const S = HST[i],
      grip = h.i >= 0,
      tired = h.lk,
      reach = h.dn && !grip && !tired,
      obj = (i == 1 && eq() == "gun") || (i == 0 && (itemT > 0 || lampEq)),
      T = {
        x: innerWidth * (i ? 1 - (TOUCH ? 0.3 : 0.2) : TOUCH ? 0.3 : 0.2),
        y: innerHeight - hpx * 0.12 + Math.sin(t * 1.7 + i * 2) * hpx * 0.012,
        rot: Math.sin(t * 1.2 + i) * 0.03,
        curl: 0.22,
        spread: 0.45,
        thumb: 0.2,
        k: 12,
      };
    if (obj)
      Object.assign(T, {
        curl: 0.85,
        thumb: 0.95,
        spread: 0.1,
        y: T.y - hpx * 0.08,
      });
    if (reach)
      Object.assign(T, {
        curl: 0,
        thumb: 0,
        spread: 0.85,
        rot: 0.12,
        y: T.y - hpx * 0.5,
      });
    if (grip) {
      const v = H[h.i].clone().project(cam);
      if (v.z < 1) {
        T.x = ((v.x + 1) / 2) * innerWidth;
        T.y = ((1 - v.y) / 2) * innerHeight + hpx * 0.1;
      }
      Object.assign(T, { curl: 1, thumb: 1, spread: 0.08, k: 20 });
      if (h.s < 30) {
        T.x += (Math.random() - 0.5) * hpx * 0.03; // strain tremble
        T.y += (Math.random() - 0.5) * hpx * 0.03;
      }
    }
    if (tired)
      Object.assign(T, {
        curl: 0,
        thumb: 0,
        spread: 1.3,
        k: 32,
        y: T.y - hpx * 0.32,
        x: T.x + (Math.random() - 0.5) * hpx * 0.04,
        rot: (Math.random() - 0.5) * 0.1,
      });
    if (i == 1 && eq() == "gun") {
      T.y += gunKick * hpx * 0.08; // recoil
      T.rot -= gunKick * 0.1;
    }
    if (S.x === null) Object.assign(S, { x: T.x, y: T.y + hpx });
    const a = 1 - Math.exp(-T.k * dt),
      r = 1 - Math.exp(-6 * dt);
    ["x", "y", "rot", "curl", "spread", "thumb"].forEach(
      (p) => (S[p] += (T[p] - S[p]) * a),
    );
    S.red += ((tired ? 1 : clamp01((78 - h.s) / 62)) - S.red) * r;
    const key = [
      (S.curl * 24) | 0,
      (S.spread * 24) | 0,
      (S.thumb * 24) | 0,
      (S.red * 16) | 0,
    ].join();
    if (key != S.key) {
      S.key = key;
      drawHand(HX[i], S);
      pixelize(
        HX[i],
        HW,
        HH,
        HSKIN.map((c, j) => mix(c, HBLOOD[j], S.red)),
        mix([30, 14, 22], [36, 4, 4], S.red),
      );
    }
    const el = HC[i];
    el.style.width = HW * sc + "px";
    el.style.height = HH * sc + "px";
    el.style.transform = `translate(${S.x}px,${S.y}px) translate(-50%,-55%) rotate(${S.rot * (i ? 1 : -1)}rad) scaleX(${i ? 1 : -1})`;
  });
  FL.style.display = lampEq ? "block" : "none";
  tl.intensity = lampEq ? 3.2 : 0; // the flashlight only shines while it is in the hand
  if (lampEq) {
    FL.style.width = FW * sc + "px";
    FL.style.height = FH * sc + "px";
    FL.style.transform = `translate(${HST[0].x}px,${HST[0].y}px) translate(-50%,-86%) rotate(${0.18 - HST[0].rot}rad)`;
  }
  const S1 = HST[1];
  gunPose = null;
  if (eq() == "gun") {
    const gn = $("gn"),
      gy =
        S1.y + (1 - gunIn) * hpx * 0.9 + gunKick * hpx * 0.12 - GH * sc * 0.82,
      sb = Math.round(gunKick * 6);
    if (sb != gunSb) {
      gunSb = sb;
      gunArt(gn, sb); // slide racks back and returns
    }
    gn.style.width = GW * sc + "px";
    gn.style.height = GH * sc + "px";
    gn.style.transform = `translate(${S1.x}px,${S1.y + (1 - gunIn) * hpx * 0.9 + gunKick * hpx * 0.12}px) translate(-50%,-82%) rotate(${S1.rot - gunKick * 0.12}rad)`;
    gunPose = {
      mx: S1.x + 4 * sc,
      my: gy + 4 * sc,
      px: S1.x + 7 * sc,
      py: gy + 19 * sc,
    };
  }
  muzzleT = Math.max(0, muzzleT - dt);
  lamp.intensity = 0.5 * (1 - DARK * DARK_STRENGTH) + 3 * (muzzleT / 0.075); // the shot lights up the walls
  if (muzzleT > 0 && gunPose) {
    MZ.style.display = "block";
    MZ.style.transform = `translate(${gunPose.mx}px,${gunPose.my}px) translate(-50%,-60%) rotate(${Math.random() * 6.28}rad) scale(${sc * (0.6 + Math.random() * 0.5)})`;
  } else MZ.style.display = "none";
  PF.forEach((p) => {
    if (p.life > 0) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy *= 0.985;
      p.s += dt * 2.2;
      p.d.style.display = "block";
      p.d.style.opacity = Math.max(0, (p.life / 0.9) * 0.55);
      p.d.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) scale(${p.s * sc * 0.5})`;
    } else p.d.style.display = "none";
  });
  CS.forEach((c) => {
    if (c.life > 0) {
      c.life -= dt;
      c.vy += 900 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.r += c.vr * dt;
      c.d.style.display = "block";
      c.d.style.transform = `translate(${c.x}px,${c.y}px) rotate(${c.r}rad) scale(${sc * 0.35})`;
    } else c.d.style.display = "none";
  });
}

// ---- Gun and item sprites (thin light outline) --------------------------------------------
const GW = 48,
  GH = 60,
  ITC = {};
/** Pixel dart pistol seen from behind (1911-style, leaning right). `back` = slide recoil in px. */
function gunArt(c, back = 0) {
  c.width = GW;
  c.height = GH;
  const g = c.getContext("2d"),
    path = (pts) => {
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
    },
    lean = (y) => (Math.max(0, -y - 21) / 29) * 4;
  g.translate(24, 57);
  const gg = g.createLinearGradient(-6, 0, 8, 0); // grip with checkering and magazine base
  gg.addColorStop(0, grey(125));
  gg.addColorStop(1, grey(62));
  g.fillStyle = gg;
  path([
    [-6, 0],
    [7, 0],
    [8.5, -19],
    [-4.5, -19],
  ]);
  g.fill();
  g.fillStyle = grey(42);
  for (let yy = -17; yy < -2; yy += 3)
    for (let xx = -4 + ((yy / 3) & 1) * 1.5; xx < 7; xx += 3)
      g.fillRect(xx, yy, 1, 1);
  g.fillStyle = grey(50);
  g.fillRect(-6.5, -2, 14, 3);
  g.strokeStyle = grey(88); // trigger guard, trigger, hammer
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-5, -20);
  g.lineTo(-10, -20);
  g.lineTo(-10, -27);
  g.lineTo(-4, -27);
  g.stroke();
  g.fillStyle = grey(150);
  g.fillRect(-8, -24, 1.5, 3);
  g.fillRect(-1.5, -22, 3, 3);
  g.fillStyle = grey(118); // barrel (shows when the slide is back)
  g.fillRect(1.5, -54, 5, 11);
  g.save();
  g.translate(0, back); // slide
  const sg = g.createLinearGradient(-8, 0, 12, 0);
  sg.addColorStop(0, grey(192));
  sg.addColorStop(0.45, grey(140));
  sg.addColorStop(1, grey(78));
  g.fillStyle = sg;
  path([
    [-8, -21],
    [8, -21],
    [12, -50],
    [-4, -50],
  ]);
  g.fill();
  g.fillStyle = grey(228); // lit left edge
  path([
    [-8, -21],
    [-6.5, -21],
    [-2.5, -50],
    [-4, -50],
  ]);
  g.fill();
  g.fillStyle = grey(52); // rear serrations
  for (let i = 0; i < 5; i++)
    g.fillRect(-7 + lean(-23 - i * 1.8), -23 - i * 1.8, 14, 1);
  g.fillStyle = grey(24); // ejection port
  g.fillRect(6, -40, 4, 9);
  g.fillStyle = grey(34); // muzzle
  g.beginPath();
  g.ellipse(4, -50, 4, 1.8, 0, 0, 6.283);
  g.fill();
  g.fillStyle = grey(8);
  g.beginPath();
  g.ellipse(4, -50, 1.6, 0.8, 0, 0, 6.283);
  g.fill();
  g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  pixelize(g, GW, GH, ramp(0x7a6e62), [214, 204, 182]);
  g.fillStyle = "#8cff8c"; // green night sights (crisp, after dithering)
  [
    [-7.5, -23],
    [5.5, -23],
    [3.5, -52],
  ].forEach(([x, y]) =>
    g.fillRect(Math.floor(24 + x + lean(y)), Math.floor(57 + y + back), 2, 2),
  );
}
let gunSb = 0; // slide offset currently rendered into #gn
gunArt($("gn"));
/** Cached sprite canvas for an item type: gun | ammo | chalk. */
function itemCanvas(t) {
  if (ITC[t]) return ITC[t];
  const c = document.createElement("canvas");
  if (t == "gun") {
    gunArt(c);
    return (ITC[t] = c);
  }
  const W = 24,
    Hh = t == "ammo" ? 18 : 26;
  c.width = W;
  c.height = Hh;
  const g = c.getContext("2d"),
    R = (v, x, y, w, h) => {
      g.fillStyle = grey(v);
      g.fillRect(x, y, w, h);
    };
  if (t == "ammo") {
    R(150, 2, 6, 20, 11);
    R(205, 2, 6, 20, 2);
    R(80, 2, 15, 20, 2);
    R(235, 6, 9, 12, 3);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = grey(230);
      g.beginPath();
      g.arc(5 + i * 5, 4, 2, 0, 6.283);
      g.fill();
    }
    pixelize(g, W, Hh, ramp(0xc8742a), [255, 226, 170]);
  } else {
    g.fillStyle = grey(205);
    g.beginPath();
    g.ellipse(12, 17, 9.5, 8, 0, 0, 6.283);
    g.fill();
    R(185, 9, 4, 6, 6);
    R(120, 8, 3, 8, 1);
    R(105, 8, 13, 8, 5);
    g.fillStyle = grey(245);
    g.beginPath();
    g.ellipse(9, 14, 3, 4, 0, 0, 6.283);
    g.fill();
    pixelize(g, W, Hh, ramp(0xe6e2da), [255, 255, 240]);
  }
  return (ITC[t] = c);
}
/** World pickup: a billboard sprite of the item inside a group (bobbed by game/render.js). */
function itemObj(t) {
  const c = itemCanvas(t),
    tex = new T3.CanvasTexture(c);
  tex.magFilter = tex.minFilter = T3.NearestFilter;
  const d = t == "gun" ? 40 : 28,
    s = new T3.Sprite(new T3.SpriteMaterial({ map: tex, color: 0xd8d8d8 })),
    o = new T3.Group();
  s.scale.set(c.width / d, c.height / d, 1);
  o.add(s);
  return o;
}
