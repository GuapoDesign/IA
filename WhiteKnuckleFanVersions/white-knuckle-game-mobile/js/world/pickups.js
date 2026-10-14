/**
 * Starting-area pickups (dart gun and darts).
 */
{
  const f = (t, x, z, c) => {
    const o = new T3.Group();
    if (t == "gun") {
      gb(0.9, 0.28, 0.3, mtb(0x6b645a), 0, 0, 0, o);
      gb(0.26, 0.5, 0.26, mtb(0x3a3631), -0.3, -0.3, 0, o);
    } else gb(0.55, 0.55, 0.55, mtb(c), 0, 0, 0, o);
    o.position.set(x, 0.6, z);
    sc.add(o);
    IT.push({ o, t, on: 1 });
  };
  f("gun", 11.4, 1.6);
  f("ammo", 11.2, -1.6, 0xc8742a);
}
