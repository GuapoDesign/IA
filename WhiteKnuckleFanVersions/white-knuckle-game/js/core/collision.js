/**
 * Solid structures. Each structure is an object placed against the wall (local x = tangent, y = up,
 * z = inward) with a list of boxes [cx, cy, cz, hx, hy, hz] (centre + half extents). The player is a
 * vertical capsule-ish body (feet = eye - 1.7, head = eye + 0.2, radius PR); resolveSolids() pushes
 * it out along the axis of least penetration (with step-up and swept top/bottom checks so fast falls
 * can't tunnel through thin planks) and reports the surface to land on.
 */
const COL = [],
  PR = 0.38;
/** Register solid boxes for object o; q is the (optional) moving-platform record giving its velocity. */
function solid(o, boxes, q) {
  COL.push({ o, boxes, q, edges: addEdges(o, boxes) });
}
let EDGE_MAT = null;
/**
 * Small continuous ledge strips along the inner face of each wide box: base, centre (tall boxes) and
 * top. They are grabbable anywhere along their length (see pick() in player/grabbing.js).
 * Returns [x0, x1, y, z] lines in the structure's local frame.
 */
function addEdges(o, boxes) {
  const lines = [];
  boxes.forEach(([cx, cy, cz, hx, hy, hz]) => {
    if (hx * 2 < 0.6) return;
    const ys = [cy - hy + 0.12, cy + hy - 0.1];
    if (hy * 2 >= 1.5) ys.splice(1, 0, cy);
    ys.forEach((y) => lines.push([cx - hx, cx + hx, y, cz + hz + 0.07]));
  });
  if (!lines.length) return lines;
  EDGE_MAT =
    EDGE_MAT ||
    new T3.MeshPhongMaterial({ map: hT(), emissive: 0x1c1606, shininess: 2 });
  const im = new T3.InstancedMesh(
      new T3.BoxGeometry(1, 0.09, 0.14),
      EDGE_MAT,
      lines.length,
    ),
    d = new T3.Object3D();
  lines.forEach(([x0, x1, y, z], i) => {
    d.position.set((x0 + x1) / 2, y, z);
    d.scale.set(x1 - x0, 1, 1);
    d.updateMatrix();
    im.setMatrixAt(i, d.matrix);
  });
  im.frustumCulled = false;
  o.add(im); // moves with elevators
  return lines;
}
/** Resolve player-vs-structure collisions. py = eye height before this frame's movement. */
function resolveSolids(py) {
  let land = null;
  for (const c of COL) {
    const o = c.o;
    if (Math.abs(o.position.y - P.y) > 40) continue;
    const ox = o.position.x,
      oz = o.position.z,
      r = Math.hypot(ox, oz) || 1,
      ux = ox / r,
      uz = oz / r,
      tx = -uz,
      tz = ux;
    for (const [cx, cy, cz, hx, hy, hz] of c.boxes) {
      const by = o.position.y + cy,
        top = by + hy,
        bot = by - hy,
        dx = P.x - ox,
        dz = P.z - oz,
        lx = dx * tx + dz * tz,
        lz = -(dx * ux + dz * uz);
      if (
        lx <= cx - hx - PR ||
        lx >= cx + hx + PR ||
        lz <= cz - hz - PR ||
        lz >= cz + hz + PR
      )
        continue;
      const feet = P.y - 1.7,
        head = P.y + 0.2,
        crossedTop = py - 1.7 >= top - 0.05 && feet < top,
        crossedBot = py + 0.2 <= bot + 0.05 && head > bot;
      if (!crossedTop && !crossedBot && (head <= bot || feet >= top)) continue;
      const up = top - feet,
        dn = head - bot,
        l = lx - (cx - hx - PR),
        rg = cx + hx + PR - lx,
        bk = lz - (cz - hz - PR),
        fr = cz + hz + PR - lz,
        m = Math.min(dn, l, rg, bk, fr);
      if (crossedTop || up <= 0.45 || up < m) {
        P.y = top + 1.7;
        land = { top, vy: c.q ? c.q.v : 0 };
      } else if (crossedBot || m == dn) {
        P.y = bot - 0.2 - 0.001;
        if (V.y > 0) V.y = 0;
      } else {
        const sx = m == l ? -l : m == rg ? rg : 0,
          sz = m == bk ? -bk : m == fr ? fr : 0;
        P.x += sx * tx - sz * ux;
        P.z += sx * tz - sz * uz;
        const vl = V.x * tx + V.z * tz,
          vz = -(V.x * ux + V.z * uz);
        if ((sx < 0 && vl > 0) || (sx > 0 && vl < 0)) {
          V.x -= vl * tx;
          V.z -= vl * tz;
        }
        if ((sz < 0 && vz > 0) || (sz > 0 && vz < 0)) {
          V.x += vz * ux;
          V.z += vz * uz;
        }
      }
    }
  }
  return land;
}
