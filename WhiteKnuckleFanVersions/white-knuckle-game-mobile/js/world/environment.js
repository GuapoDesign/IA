/**
 * Silo shell: wall, girders, pipes, floor, rising hazard, lights and spores.
 */
const wm = new T3.MeshPhongMaterial({ map: mkTex(26, 80), shininess: 0 });
const wall = new T3.Mesh(new T3.CylinderGeometry(14, 14, 720, 36, 1, true), wm);
wall.material.side = T3.BackSide;
wall.position.y = 350;
sc.add(wall);
const gm = new T3.MeshPhongMaterial({
  map: mkTex(2, 1),
  color: 0x777777,
  shininess: 0,
});
for (let y = 20; y < 700; y += 24) {
  const r = new T3.Mesh(new T3.TorusGeometry(13.5, 0.55, 4, 36), gm);
  r.rotation.x = Math.PI / 2;
  r.position.y = y;
  sc.add(r);
}
for (let i = 0; i < 7; i++) {
  const a = (i / 7) * 6.28 + 0.4,
    p = new T3.Mesh(new T3.CylinderGeometry(0.4, 0.4, 720, 6), gm);
  p.position.set(Math.cos(a) * 13.3, 350, Math.sin(a) * 13.3);
  sc.add(p);
}
const fl = new T3.Mesh(
  new T3.CircleGeometry(14, 36),
  new T3.MeshLambertMaterial({ map: mkTex(14, 14), color: 0x555555 }),
);
fl.rotation.x = -Math.PI / 2;
sc.add(fl);
const hzm = new T3.Mesh(
  new T3.CircleGeometry(14.5, 36),
  new T3.MeshBasicMaterial({
    color: 0x8a0c0c,
    transparent: true,
    opacity: 0.88,
    fog: false,
  }),
);
hzm.rotation.x = -Math.PI / 2;
sc.add(hzm);
const pm = new T3.MeshPhongMaterial({
    map: mkTex(10, 2),
    color: 0x888888,
    side: T3.DoubleSide,
    shininess: 0,
  }),
  ps = new T3.MeshBasicMaterial({
    color: 0xe8c040,
    side: T3.DoubleSide,
    fog: false,
  });
sc.add(new T3.AmbientLight(0x6a6a6a));
const lamp = new T3.PointLight(0xffe0bd, 0.75, 26, 1.3);
cam.add(lamp);
// spores
{
  const n = 4500,
    a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(Math.random()) * 13,
      t = Math.random() * 6.28;
    a[i * 3] = Math.cos(t) * r;
    a[i * 3 + 1] = Math.random() * 700;
    a[i * 3 + 2] = Math.sin(t) * r;
  }
  const g = new T3.BufferGeometry();
  g.setAttribute("position", new T3.BufferAttribute(a, 3));
  sc.add(
    new T3.Points(
      g,
      new T3.PointsMaterial({
        size: 0.09,
        color: 0xcfc8c0,
        transparent: true,
        opacity: 0.6,
      }),
    ),
  );
}
