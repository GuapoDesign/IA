/**
 * Entry point: main loop.
 */
let last = performance.now();
(function loop(n) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (n - last) / 1000);
  last = n;
  if (st == "play" && inputActive()) sim(dt);
  draw(n / 1000);
  rn.render(sc, cam);
})(last);
