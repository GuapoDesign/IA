/**
 * The hunter: a pixel-art chitinous crawler (flat-shaded low-poly, 16px dithered texture), its
 * logic (speed ramp, irritated state, wall + structure climbing, stomp shake) and its animation.
 */
const MR = 2.0, // body clearance from any surface it crawls on
  MSURF = 11.9, // body-centre radius when crawling on the silo wall
  STRIDE = 1.65; // metres per footstep
const MG = new T3.Group(),
  chitin = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const g = c.getContext("2d");
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v =
          16 + ((x * 7 + y * 13) % 5) * 4 + (Math.random() < 0.16 ? 16 : 0);
        g.fillStyle = `rgb(${v},${v},${v + 8})`;
        g.fillRect(x, y, 1, 1);
      }
    g.fillStyle = "#3a0a10";
    for (let i = 0; i < 4; i++) g.fillRect((i * 5 + 2) % 16, 0, 1, 16);
    g.fillStyle = "#d8d0d0";
    [
      [3, 4],
      [11, 9],
      [7, 13],
      [13, 2],
    ].forEach(([x, y]) => g.fillRect(x, y, 1, 1)); // specular glints
    const t = new T3.CanvasTexture(c);
    t.wrapS = t.wrapT = T3.RepeatWrapping;
    t.magFilter = t.minFilter = T3.NearestFilter;
    t.repeat.set(2, 2);
    return t;
  })(),
  mat = (o) =>
    new T3.MeshPhongMaterial(
      Object.assign(
        { map: chitin, flatShading: true, specular: 0xd0c8c8, shininess: 70 },
        o,
      ),
    ),
  mb = mat({ color: 0xaaaaaa, emissive: 0x12040a }),
  mo = mat({ color: 0x6a3a28, emissive: 0x120400, shininess: 10 }),
  mj = mat({ color: 0x8a7a68, emissive: 0x0c0805, shininess: 20 }),
  me = new T3.MeshBasicMaterial({ color: 0xff1a1a, fog: false }), // eyes glow through the dark fog
  legs = [],
  knees = [],
  jaws = [],
  M = {
    on: 0,
    p: new T3.Vector3(),
    n: new T3.Vector3(0, 0, -1),
    sl: 0,
    cd: 0,
    fl: 0,
    irr: 0,
    hits: 0,
    dist: 0,
    acc: 0,
  };
let MB, MH, MA; // thorax, head, abdomen
const mesh = (geo, m, x, y, z, parent = MG) => {
  const o = new T3.Mesh(geo, m);
  o.position.set(x, y, z);
  parent.add(o);
  return o;
};
{
  MB = mesh(new T3.IcosahedronGeometry(1, 0), mb, 0, 0, 0);
  MB.scale.set(1, 0.75, 1.25);
  MA = mesh(new T3.IcosahedronGeometry(1.15, 0), mb, 0, 0.05, -1.9);
  MA.scale.set(1, 0.8, 1.35);
  for (let i = 0; i < 6; i++)
    mesh(
      new T3.ConeGeometry(0.16, 0.75, 4),
      mo,
      0,
      0.78 - (i > 2) * 0.1,
      0.9 - i * 0.62,
    ).rotation.x = -0.35;
  MH = new T3.Group();
  MH.position.set(0, 0.05, 1.45);
  MG.add(MH);
  mesh(new T3.IcosahedronGeometry(0.62, 0), mb, 0, 0, 0, MH).scale.set(
    1,
    0.8,
    1,
  );
  [
    [-0.3, 0.22, 0.5, 0.14],
    [0.3, 0.22, 0.5, 0.14],
    [-0.16, 0.4, 0.45, 0.08],
    [0.16, 0.4, 0.45, 0.08],
    [-0.5, 0.05, 0.38, 0.07],
    [0.5, 0.05, 0.38, 0.07],
  ].forEach(([x, y, z, r]) =>
    mesh(new T3.IcosahedronGeometry(r, 0), me, x, y, z, MH),
  );
  [-1, 1].forEach((s) => {
    const j = new T3.Group();
    j.position.set(s * 0.3, -0.2, 0.5);
    MH.add(j);
    mesh(new T3.ConeGeometry(0.16, 1.2, 4), mj, 0, 0, 0.55, j).rotation.x =
      Math.PI / 2;
    for (let k = 0; k < 3; k++)
      mesh(
        new T3.ConeGeometry(0.05, 0.28, 4),
        mo,
        -s * 0.12,
        -0.05,
        0.3 + k * 0.25,
        j,
      ).rotation.z = s * 0.3;
    jaws.push([j, s]);
  });
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? -1 : 1,
      idx = i >> 1,
      hip = new T3.Group();
    hip.position.set(side * 0.7, 0.1, [1.0, 0.35, -0.35, -1.0][idx]);
    hip.scale.x = side; // left legs are mirrored right legs
    MG.add(hip);
    mesh(
      new T3.CylinderGeometry(0.07, 0.11, 1.7, 4),
      mb,
      0.65,
      0.55,
      0,
      hip,
    ).rotation.z = -0.868;
    const knee = new T3.Group();
    knee.position.set(1.3, 1.1, 0);
    hip.add(knee);
    mesh(
      new T3.CylinderGeometry(0.04, 0.07, 3, 4),
      mb,
      0.8,
      -1.25,
      0,
      knee,
    ).rotation.z = -2.575;
    mesh(
      new T3.ConeGeometry(0.1, 0.5, 4),
      mo,
      1.65,
      -2.55,
      0,
      knee,
    ).rotation.z = -2.575; // claw
    mesh(new T3.IcosahedronGeometry(0.14, 0), mo, 0, 0, 0, knee); // knee joint
    hip.userData = {
      side,
      yaw: [0.9, 0.3, -0.3, -0.9][idx],
      ph: (idx % 2) * Math.PI + (side > 0 ? 0 : 1.2),
    };
    legs.push(hip);
    knees.push(knee);
  }
}
MG.scale.setScalar(1.4);
MG.visible = false;
sc.add(MG);

/** Speed: +5% for every 50 m climbed past 150 m; slowed by darts, +20% while irritated. */
function monsterSpeed() {
  const base = 3.0 * (1 + 0.05 * Math.floor(Math.max(0, ht - 150) / 50));
  return base * (M.sl > 0 ? 0.2 : 1) * (M.irr > 0 ? 1.2 : 1);
}
/** A dart hit: 1st-3rd slow the hunter, every 4th one makes it irritated for 5 s. */
function monsterHit() {
  M.hits++;
  M.fl = 0.2;
  if (M.hits % 4 == 0) {
    M.irr = 5;
    M.sl = 0;
    snd("roar");
  } else if (M.irr <= 0) M.sl = 6;
  snd("hit2");
}
/** Push the body out of structures (never downward / outward) so it climbs over or around them. */
function monsterSolids() {
  let n = null;
  for (let pass = 0; pass < 2; pass++)
    for (const c of COL) {
      const o = c.o;
      if (Math.abs(o.position.y - M.p.y) > 40) continue;
      const ox = o.position.x,
        oz = o.position.z,
        r = Math.hypot(ox, oz) || 1,
        ux = ox / r,
        uz = oz / r,
        tx = -uz,
        tz = ux;
      for (const [cx, cy, cz, hx, hy, hz] of c.boxes) {
        const dx = M.p.x - ox,
          dz = M.p.z - oz,
          ax = dx * tx + dz * tz - cx,
          ay = M.p.y - (o.position.y + cy),
          az = -(dx * ux + dz * uz) - cz,
          ex = hx + MR,
          ey = hy + MR,
          ez = hz + MR;
        if (Math.abs(ax) >= ex || Math.abs(ay) >= ey || Math.abs(az) >= ez)
          continue;
        const up = ey - ay,
          side = ex - Math.abs(ax),
          inw = ez - az,
          m = up <= 0.8 ? up : Math.min(up, side, inw); // can mount edges up to 0.8 m
        let sx = 0,
          sy = 0,
          sz = 0;
        if (m == up)
          sy = 1; // climb up and over
        else if (m == side) sx = Math.sign(ax) || 1;
        else sz = 1;
        M.p.y += sy * m;
        M.p.x += (sx * tx - sz * ux) * m;
        M.p.z += (sx * tz - sz * uz) * m;
        n = (n || new T3.Vector3()).set(
          sx * tx - sz * ux,
          sy,
          sx * tz - sz * uz,
        );
      }
    }
  return n;
}
/** One footstep: stomp shake + thump, stronger when close and when irritated. */
function monsterStep() {
  const d = M.p.distanceTo(P),
    k = Math.max(0, (34 - d) / 34) * (M.irr > 0 ? 1.9 : 1);
  if (k <= 0) return;
  shk = Math.max(shk, 0.05 + 0.3 * k);
  snd("mstep", k * 2);
}
/** Per-frame hunter logic (called from game/sim.js). Returns true if it killed the player. */
function updateMonster(dt) {
  M.sl -= dt;
  M.cd -= dt;
  M.fl -= dt;
  M.irr -= dt;
  if (ht > 150 && !M.on) {
    M.on = 1;
    const a = Math.atan2(P.z, P.x);
    M.p.set(Math.cos(a) * MSURF, Math.max(3, P.y - 26), Math.sin(a) * MSURF);
    M.n.set(-Math.cos(a), 0, -Math.sin(a));
    M.dist = M.acc = 0;
    snd("roar");
  }
  if (!M.on) return false;
  const d = P.clone().sub(M.p),
    L = d.length() || 1,
    before = M.p.clone();
  M.p.addScaledVector(d, (monsterSpeed() * dt) / L);
  M.p.y = Math.max(MR + 0.1, M.p.y);
  const mr = Math.hypot(M.p.x, M.p.z) || 1,
    k = Math.min(1, dt * 3),
    r2 = mr > MSURF ? MSURF : mr + (MSURF - mr) * k; // settle back onto the wall after a structure
  M.p.x *= r2 / mr;
  M.p.z *= r2 / mr;
  const hit = monsterSolids(),
    wall = new T3.Vector3(
      -M.p.x / (Math.hypot(M.p.x, M.p.z) || 1),
      0,
      -M.p.z / (Math.hypot(M.p.x, M.p.z) || 1),
    );
  M.n.lerp(hit ? hit.normalize() : wall, Math.min(1, dt * 7)).normalize(); // smooth surface normal
  const moved = M.p.distanceTo(before);
  M.dist += moved;
  M.acc += moved;
  while (M.acc >= STRIDE) {
    M.acc -= STRIDE;
    monsterStep();
  }
  if (L < 2.7 && M.cd <= 0) {
    const k2 = M.irr > 0 ? 1.4 : 1;
    M.cd = 1.6;
    hp--;
    snd("hit");
    shk = M.irr > 0 ? 0.8 : 0.5;
    d.normalize();
    V.set(d.x * 12 * k2, d.y * 6 * k2 + 7, d.z * 12 * k2);
    hs.forEach((h) => {
      h.i = -1;
      h.cd = 0.4;
      h.s = Math.min(h.s, 25);
    });
    if (hp <= 0) return true;
  }
  return false;
}
/** Pose the hunter for time t: it lies on the surface it crawls on, gait phase follows distance walked. */
function animateMonster(t) {
  MG.position.copy(M.p);
  MG.up.copy(M.n);
  const dir = P.clone().sub(M.p);
  dir.addScaledVector(M.n, -dir.dot(M.n));
  if (dir.lengthSq() > 1e-3) MG.lookAt(M.p.clone().add(dir));
  const sl = M.sl > 0,
    irr = M.irr > 0,
    near = M.p.distanceTo(P) < 9 && !sl,
    g = M.dist * 1.9; // feet follow the ground actually covered
  legs.forEach((l, i) => {
    const ph = g + l.userData.ph,
      lift = Math.max(0, Math.sin(ph + 1.6)),
      twitch = Math.sin(t * 7 + i * 2) * (sl ? 0.07 : 0.02);
    l.rotation.set(
      0,
      -l.userData.side * (l.userData.yaw + Math.sin(ph) * 0.32 + twitch),
      lift * 0.5 - 0.1,
    );
    knees[i].rotation.z = -lift * 0.9 + 0.12 * Math.sin(ph * 2 + i);
  });
  MB.position.y = Math.sin(g * 2) * 0.08;
  MA.rotation.set(Math.sin(t * 3) * 0.04, Math.sin(g) * 0.14, 0);
  MA.scale.set(1 + Math.sin(t * 3) * 0.04, 0.8, 1.35);
  MH.rotation.set(
    Math.sin(t * 2.3) * 0.08,
    Math.sin(t * 1.4) * 0.18,
    Math.sin(t * 3.1) * 0.05,
  );
  const open = near
    ? 0.55 + 0.3 * Math.sin(t * 20)
    : 0.16 + 0.1 * Math.sin(t * 3);
  jaws.forEach(([j, s]) => (j.rotation.y = s * open));
  MG.scale.setScalar(irr ? 1.52 : 1.4);
  me.color.setHex(irr ? 0xff7a30 : 0xff1a1a);
  mb.emissive.setHex(
    M.fl > 0
      ? 0xffffff
      : irr
        ? Math.sin(t * 24) > 0
          ? 0x5a0808
          : 0x2a0404
        : sl
          ? 0x1840a0
          : 0x12040a,
  );
}
