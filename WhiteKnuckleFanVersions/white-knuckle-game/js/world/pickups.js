/**
 * Starting-area pickups (dart gun and darts).
 */
[
  ["gun", 11.4, 1.6],
  ["ammo", 11.2, -1.6],
].forEach(([t, x, z]) => {
  const o = itemObj(t);
  o.position.set(x, 0.6, z);
  sc.add(o);
  IT.push({ o, t, on: 1 });
});
