/**
 * The hunter: mesh, legs and shared state.
 */
let MB; // hunter body mesh (animated in game/render.js)
// monster + gun
const MG = new T3.Group(),
  mb = new T3.MeshLambertMaterial({ color: 0x14161f, emissive: 0x12040a }),
  mo = new T3.MeshBasicMaterial({ color: 0x8a2a12 }),
  legs = [],
  M = { on: 0, p: new T3.Vector3(), sl: 0, cd: 0, fl: 0 };
{
  const b = new T3.Mesh(new T3.IcosahedronGeometry(1.1, 1), mb);
  b.scale.set(1, 0.8, 1.3);
  MG.add(b);
  MB = b;
  for (let i = 0; i < 7; i++) {
    const e = new T3.Mesh(
      new T3.SphereGeometry(0.2, 6, 4),
      new T3.MeshBasicMaterial({ color: 0xff1818 }),
    );
    e.position.set(((i % 3) - 1) * 0.4, 0.25 + (i > 2) * 0.3, 1.35);
    MG.add(e);
  }
  for (let i = 0; i < 8; i++) {
    const l = new T3.Group(),
      u = new T3.Mesh(new T3.CylinderGeometry(0.07, 0.1, 2.4, 5), mb),
      d = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.07, 2.2, 5), mb),
      s = new T3.Mesh(new T3.ConeGeometry(0.2, 0.7, 4), mo);
    u.position.set(1, 0.5, 0);
    u.rotation.z = -1.1;
    d.position.set(2.57, 0.06, 0);
    d.rotation.z = -2.67;
    s.position.set(2.07, 1.2, 0);
    l.add(u, d, s);
    MG.add(l);
    legs.push(l);
  }
}
MG.scale.setScalar(1.4);
MG.visible = false;
sc.add(MG);
