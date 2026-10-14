/**
 * Rest platforms every 50 m (ledges, elevators, pipe catwalks) and their pickups.
 */
const PL = [],
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
    gb(2.4, 16, 2.4, pm, 3.4, -8.6, -1.2, m);
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
    gb(0.5, 6, 0.5, pm, 2.4, -3.2, -1.6, m);
  }
  gb(6.4, 0.1, 0.14, ps, 0, ty == 1 ? 0.66 : ty == 2 ? 0.5 : 0.66, 2.2, m);
  const it = k % 2 ? "chalk" : "ammo",
    o = new T3.Group();
  if (it == "gun") {
    gb(0.9, 0.28, 0.3, mt(0x6b645a), 0, 0, 0, o);
    gb(0.26, 0.5, 0.26, mt(0x3a3631), -0.3, -0.3, 0, o);
  } else
    gb(0.55, 0.55, 0.55, mt(it == "ammo" ? 0xc8742a : 0xe8e8e8), 0, 0, 0, o);
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
}
for (let k = 1; k < 14; k++) pad(k * 50, k);
