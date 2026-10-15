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
      CR.push([pk - 4, an - dd * 1.9]);
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
  const n = rnd() < 0.2 ? 2 : 1; // mostly one hold per step
  for (let k = 0; k < n; k++) {
    const a =
      an +
      (n == 1 ? (rnd() - 0.5) * 0.05 : (k ? 1 : -1) * (0.07 + rnd() * 0.07));
    H.push(
      new T3.Vector3(
        Math.cos(a) * 13.55,
        y + rnd() * 0.25,
        Math.sin(a) * 13.55,
      ),
    );
  }
  an +=
    md == 0
      ? (rnd() - 0.5) * 0.06
      : md == 1
        ? dr * 0.09
        : md == 2
          ? dr * 0.06
          : md == 3
            ? dr * 0.12
            : (rnd() < 0.5 ? -1 : 1) * 0.12;
  y +=
    [1.0, 0.75, 0.9, 0.3, 0.65][md] + rnd() * [0.5, 0.35, 0.45, 0.25, 0.3][md]; // vertical step per mode
}
const hi = new T3.InstancedMesh(
  new T3.BoxGeometry(0.33, 0.165, 0.27),
  new T3.MeshPhongMaterial({ map: hT(), emissive: 0x1c1606, shininess: 2 }),
  H.length,
);
H.forEach((p, i) => {
  dm.position.copy(p);
  dm.lookAt(0, p.y, 0);
  dm.rotation.z = (rnd() - 0.5) * 0.3;
  const s = 0.85 + rnd() * 0.3; // slight size variation
  dm.scale.set(s, s, s);
  dm.updateMatrix();
  hi.setMatrixAt(i, dm.matrix);
});
sc.add(hi);
