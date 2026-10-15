/**
 * Rest platforms every 50 m (ledges, elevators, pipe catwalks) and their pickups.
 */
const PL = [],
  BON = [], // side-branch spots that hold power-up orbs
  ORB = [], // [x, y, z, type] of every orb
  IT = [],
  WV = new T3.Vector3(),
  gb = (w, h, d, m, x, y, z, p) => {
    const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    p.add(o);
    return o;
  };
function pad(y, k) {
  let ca = 0,
    j = 1e9;
  H.forEach((p) => {
    const d = Math.abs(p.y - y);
    if (d < j) {
      j = d;
      ca = Math.atan2(p.z, p.x);
    }
  });
  const s = k % 3 == 0 ? ((k / 3) % 2 ? -1 : 1) : 1; // lateral side, away from the parkour sweep
  ca += s * 0.46; // structures sit beside the climbing line, never across it
  const ty = (k + 2) % 3,
    mk = () => {
      const o = new T3.Object3D();
      o.position.set(Math.cos(ca) * 11.7, y - 0.6, Math.sin(ca) * 11.7);
      o.lookAt(0, y - 0.6, 0);
      sc.add(o);
      return o;
    },
    m = mk(),
    mt = (c) => new T3.MeshBasicMaterial({ color: c });
  if (ty == 0) {
    gb(6.4, 1.2, 4.6, pm, 0, 0, 0, m);
    gb(2.4, 16, 2.4, pm, s * 3.4, -8.6, -1.2, m);
  } else if (ty == 1) {
    gb(6.4, 0.9, 4.4, pm, 0, 0.15, 0, m);
    const r = mk();
    [-3.5, 3.5].forEach((s) => {
      const c = new T3.Mesh(new T3.CylinderGeometry(0.18, 0.18, 26, 5), pm);
      c.position.set(s, 0, -1.9);
      r.add(c);
    });
  } else {
    [
      [0.8, -0.2, 0],
      [0.5, -0.3, -1.6],
    ].forEach(([rd, yy, zz]) => {
      const c = new T3.Mesh(new T3.CylinderGeometry(rd, rd, 6.4, 8), pm);
      c.rotation.z = 1.5708;
      c.position.set(0, yy, zz);
      m.add(c);
    });
    gb(0.5, 6, 0.5, pm, s * 2.4, -3.2, -1.6, m);
  }
  gb(6.4, 0.1, 0.14, ps, 0, ty == 1 ? 0.66 : ty == 2 ? 0.5 : 0.66, 2.2, m);
  const it = k % 2 ? "chalk" : "ammo",
    o = itemObj(it);
  o.position.set(1, 1.1, 0.4);
  m.add(o);
  IT.push({ o, t: it, on: 1 });
  const q = {
    y0: y,
    amp: ty == 1 ? 4 : 0,
    sp: 0.7,
    ph: k * 1.3,
    ca,
    m,
    top: 0,
    pt: 0,
    v: 0,
  };
  q.top = q.pt = q.y0 + q.amp * Math.sin(q.ph);
  m.position.y = q.top - 0.6;
  PL.push(q);
  solid(
    m,
    ty == 0
      ? [
          [0, 0, 0, 3.2, 0.6, 2.3],
          [s * 3.4, -8.6, -1.2, 1.2, 8, 1.2],
        ]
      : ty == 1
        ? [[0, 0.15, 0, 3.2, 0.45, 2.2]]
        : [
            [0, -0.2, 0, 3.2, 0.8, 0.8],
            [0, -0.3, -1.6, 3.2, 0.5, 0.5],
            [s * 2.4, -3.2, -1.6, 0.25, 3, 0.25],
          ],
    q,
  );
  const bi = [2, 4, 7, 10, 12].indexOf(k);
  if (bi >= 0) BON.push({ y, ca, s, t: ["dj", "hk", "wg", "st", "hk"][bi] });
}
for (let k = 1; k < 14; k++) pad(k * 50, k);
