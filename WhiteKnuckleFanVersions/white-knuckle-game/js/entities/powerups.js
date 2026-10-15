/**
 * Power-up orbs, virtual wall holds, grappling hook and per-frame power-up logic.
 */
const PW = { dj: 0, wg: 0, hk: 0, st: 0 },
  PN = [
    ["dj", "DOUBLE JUMP"],
    ["wg", "WALL GRIP"],
    ["hk", "GRAPPLE HOOK"],
    ["st", "ADRENALINE"],
  ],
  HK = { on: 0, a: new T3.Vector3(), l: 0 },
  PU = [],
  PUC = { dj: 0x58d8ff, wg: 0xffd24a, hk: 0xa5ff6a, st: 0xff5a8a };
let dj = 1;
ORB.forEach(([x, y, z, t]) => {
  const o = new T3.Group();
  o.add(
    new T3.Mesh(
      new T3.IcosahedronGeometry(0.45, 0),
      new T3.MeshBasicMaterial({ color: PUC[t] }),
    ),
    new T3.Mesh(
      new T3.IcosahedronGeometry(0.8, 0),
      new T3.MeshBasicMaterial({ color: PUC[t], wireframe: true }),
    ),
  );
  o.position.set(x, y, z);
  sc.add(o);
  PU.push({ o, t, on: 1 });
});
const VI = [H.length, H.length + 1];
H.push(new T3.Vector3(0, -999, 0), new T3.Vector3(0, -999, 0));
const hkL = new T3.Line(
  new T3.BufferGeometry().setFromPoints([new T3.Vector3(), new T3.Vector3()]),
  new T3.LineBasicMaterial({ color: 0xd8c9a0 }),
);
hkL.frustumCulled = false;
hkL.visible = false;
sc.add(hkL);
function hook() {
  if (HK.on) {
    HK.on = 0;
    snd("click");
    return;
  }
  if (PW.hk <= 0) return;
  cam.getWorldDirection(F);
  const a = F.x * F.x + F.z * F.z,
    b = 2 * (P.x * F.x + P.z * F.z),
    c = P.x * P.x + P.z * P.z - 182.25,
    D = b * b - 4 * a * c;
  if (a < 1e-4 || D < 0) return;
  const t = (-b + Math.sqrt(D)) / (2 * a);
  if (t < 1 || t > 34) return;
  HK.a.set(P.x + F.x * t, P.y + F.y * t, P.z + F.z * t);
  if (HK.a.y < 1) return;
  HK.l = t;
  HK.on = 1;
  PW.hk--;
  snd("hook");
}
function hkSim(dt) {
  if (G || hs.some((h) => h.i >= 0)) dj = 1;
  PU.forEach((u) => {
    if (u.on && u.o.position.distanceTo(P) < 2.7) {
      u.on = 0;
      u.o.visible = false;
      PW[u.t] = 3; // every power-up gives 3 uses
      snd("pw");
      const e = $("tst");
      e.textContent = PN.find((n) => n[0] == u.t)[1] + " ACQUIRED";
      setTimeout(() => (e.textContent = ""), 2200);
    }
  });
  if (!HK.on) return;
  const d = P.clone().sub(HK.a),
    L = d.length() || 1;
  fell = 0;
  if (K.KeyW) HK.l = Math.max(2.5, HK.l - 7 * dt);
  if (K.KeyS) HK.l = Math.min(34, HK.l + 7 * dt);
  if (L > HK.l) {
    d.divideScalar(L);
    P.copy(HK.a).addScaledVector(d, HK.l);
    const vr = V.dot(d);
    if (vr > 0) V.addScaledVector(d, -vr);
  }
  const mx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0);
  if (mx) {
    V.x += Math.cos(yaw) * mx * 9 * dt;
    V.z += -Math.sin(yaw) * mx * 9 * dt;
  }
}
