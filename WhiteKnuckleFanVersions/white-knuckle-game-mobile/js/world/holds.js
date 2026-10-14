/**
 * Procedural climbing routes, handhold meshes and parkour-district layout.
 */
// holds
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const H = [],
  dm = new T3.Object3D();
let an = 0;
const PB = [150, 300, 450, 600],
  RP = [],
  CR = [],
  RF = {};
let md = 0,
  mc = 0,
  dr = 1;
for (let y = 2.3; y < 700;) {
  const pk = PB.find((b) => y >= b && y < b + 10);
  if (pk) {
    if (!RF[pk]) {
      RF[pk] = 1;
      const dd = (pk / 150) % 2 ? 1 : -1;
      for (let i = 0; i < 8; i++)
        RP.push([
          pk + 1 + i * 1.1,
          an + dd * (0.4 + i * 0.4 + rnd() * 0.06),
          i,
        ]);
      CR.push([pk - 4, an - dd * 0.4]);
      an += dd * 3.3;
    }
    y = pk + 10;
    continue;
  }
  if (--mc <= 0) {
    md = (rnd() * 5) | 0;
    mc = 6 + ((rnd() * 8) | 0);
    dr = rnd() < 0.5 ? -1 : 1;
  }
  for (let k = 0; k < 2; k++) {
    const a = an + (k ? 1 : -1) * (0.06 + rnd() * 0.08);
    H.push(
      new T3.Vector3(Math.cos(a) * 13.55, y + rnd() * 0.4, Math.sin(a) * 13.55),
    );
  }
  an +=
    md == 0
      ? (rnd() - 0.5) * 0.1
      : md == 1
        ? dr * 0.14
        : md == 2
          ? dr * 0.07
          : md == 3
            ? dr * 0.17
            : (rnd() < 0.5 ? -1 : 1) * 0.2;
  y += md == 3 ? 0.4 + rnd() * 0.3 : 0.9 + rnd() * 0.95;
}
const hi = new T3.InstancedMesh(
  new T3.BoxGeometry(0.95, 0.42, 0.75),
  new T3.MeshPhongMaterial({
    map: hT(),
    color: 0xdad0b8,
    emissive: 0x2a2418,
    shininess: 0,
  }),
  H.length,
);
H.forEach((p, i) => {
  dm.position.copy(p);
  dm.lookAt(0, p.y, 0);
  dm.rotation.z = (rnd() - 0.5) * 0.3;
  dm.updateMatrix();
  hi.setMatrixAt(i, dm.matrix);
});
sc.add(hi);
