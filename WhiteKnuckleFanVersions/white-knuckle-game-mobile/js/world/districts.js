/**
 * Parkour districts: rooftops (houses, towers, scaffolds) and cranes.
 */
const mtb = (c) => new T3.MeshBasicMaterial({ color: c });
function roof(y, a, i) {
  const o = new T3.Object3D(),
    t = i % 3;
  o.position.set(Math.cos(a) * 11.7, y - 0.6, Math.sin(a) * 11.7);
  o.lookAt(0, y - 0.6, 0);
  sc.add(o);
  if (t == 0) {
    gb(3.4, 0.6, 4.2, pm, 0, 0.3, 0, o);
    gb(3, 4, 3.6, pm, 0, -2.2, -0.2, o);
    [-0.8, 0.8].forEach((x) =>
      gb(0.7, 0.9, 0.1, mtb(0xffc860), x, -1.6, 1.65, o),
    );
    gb(0.8, 1.6, 0.1, mtb(0x120a08), 0, -3, 1.65, o);
    gb(0.5, 1.2, 0.5, pm, -1, 1.2, -1, o);
  } else if (t == 1) {
    gb(3.4, 0.6, 3.4, pm, 0, 0.3, 0, o);
    gb(2.2, 20, 2.2, pm, 0, -10.3, -0.4, o);
    gb(0.3, 0.3, 0.3, mtb(0xff2020), 1.3, 0.8, 1, o);
  } else {
    gb(3.4, 0.3, 3, pm, 0, 0.45, 0, o);
    const oc = mtb(0xc86a20);
    [
      [-1.6, -1.4],
      [1.6, -1.4],
      [-1.6, 1.4],
      [1.6, 1.4],
    ].forEach(([x, z]) => gb(0.2, 9, 0.2, oc, x, -4, z, o));
    gb(3.4, 0.15, 0.15, oc, 0, -1.5, 1.4, o);
    gb(0.15, 0.15, 3, oc, 1.6, -3, 0, o);
  }
  PL.push({
    y0: y,
    amp: 0,
    sp: 0,
    ph: 0,
    ca: a,
    m: o,
    top: y,
    pt: y,
    v: 0,
    hw: 0.13,
  });
}
function crane(a, y) {
  const o = new T3.Object3D(),
    cm = mtb(0xb85a1c);
  o.position.set(Math.cos(a) * 12.9, y, Math.sin(a) * 12.9);
  o.lookAt(0, y, 0);
  sc.add(o);
  gb(0.7, 30, 0.7, cm, 0, 11, 0, o);
  gb(11, 0.6, 0.6, cm, 3.5, 25.8, 0, o);
  gb(2.2, 1.4, 1.4, mtb(0x3a3a3a), -3.2, 25.4, 0, o);
  gb(0.06, 6, 0.06, mtb(0x222222), 6.5, 22.7, 0, o);
  gb(0.5, 0.5, 0.5, cm, 6.5, 19.5, 0, o);
}
RP.forEach(([y, a, i]) => roof(y, a, i));
CR.forEach(([y, a]) => crane(a, y));
