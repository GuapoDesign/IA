/**
 * Procedural pixel textures: detailed wall / metal surfaces (colour + bump) and mustard handholds.
 */
const rr = (a, b) => a + Math.random() * (b - a);
function canvasTex(c, rx, ry) {
  const t = new T3.CanvasTexture(c);
  t.wrapS = t.wrapT = T3.RepeatWrapping;
  t.magFilter = t.minFilter = T3.NearestFilter;
  t.repeat.set(rx, ry);
  return t;
}
/** Dense brick / steel-plate / rust / moss / crack texture; the bump map is attached as `.bump`. */
function mkTex(rx, ry) {
  const S = 128,
    c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  g.fillStyle = "#17171a";
  g.fillRect(0, 0, S, S);
  for (let r = 0; r < 16; r++) {
    let x = -((r * 11) % 24);
    while (x < S) {
      const w = [16, 16, 24, 32][(Math.random() * 4) | 0],
        v = rr(62, 120) | 0;
      g.fillStyle = `rgb(${v},${v - 2},${v - 7})`;
      g.fillRect(x + 1, r * 8 + 1, w - 2, 6);
      g.fillStyle = "rgba(255,255,255,.16)";
      g.fillRect(x + 1, r * 8 + 1, w - 2, 1);
      g.fillRect(x + 1, r * 8 + 1, 1, 6);
      g.fillStyle = "rgba(0,0,0,.45)";
      g.fillRect(x + 1, r * 8 + 6, w - 2, 1);
      g.fillRect(x + w - 2, r * 8 + 1, 1, 6);
      if (Math.random() < 0.14) {
        g.fillStyle = "#17171a"; // chipped corner
        g.fillRect(x + w - 5, r * 8 + 1, 3, 2);
      }
      x += w;
    }
  }
  for (let i = 0; i < 3; i++) {
    // riveted steel plates
    const pw = 30 + (rr(0, 18) | 0),
      ph = 22 + (rr(0, 10) | 0),
      px = rr(0, S - pw) | 0,
      py = rr(0, S - ph) | 0;
    g.fillStyle = "#34363b";
    g.fillRect(px, py, pw, ph);
    g.fillStyle = "rgba(255,255,255,.12)";
    g.fillRect(px, py, pw, 1);
    g.fillStyle = "rgba(0,0,0,.55)";
    g.fillRect(px, py + ph - 1, pw, 1);
    g.fillRect(px + pw - 1, py, 1, ph);
    g.fillStyle = "#8c8f96";
    [
      [2, 2],
      [pw - 4, 2],
      [2, ph - 4],
      [pw - 4, ph - 4],
    ].forEach(([a, b]) => g.fillRect(px + a, py + b, 2, 2));
  }
  for (let i = 0; i < 10; i++) {
    const gr = g.createLinearGradient(0, 0, 0, S);
    gr.addColorStop(0, "rgba(0,0,0,.4)");
    gr.addColorStop(1, "rgba(50,18,8,0)");
    g.fillStyle = gr;
    g.fillRect(rr(0, S) | 0, 0, 2 + (i % 3), S); // grime streaks
  }
  for (let i = 0; i < 9; i++) {
    g.fillStyle = "rgba(125,42,14,.5)";
    g.fillRect(rr(0, S) | 0, rr(0, S) | 0, 1 + (i % 2), rr(8, 34)); // rust drips
  }
  for (let i = 0; i < 36; i++) {
    g.fillStyle = "rgba(70,92,40,.4)";
    g.fillRect(rr(0, S), rr(0, S), 2, 1); // moss
  }
  for (let i = 0; i < 1100; i++) {
    g.fillStyle =
      Math.random() < 0.5
        ? `rgba(0,0,0,${Math.random() * 0.5})`
        : `rgba(255,255,255,${Math.random() * 0.12})`;
    g.fillRect(rr(0, S), rr(0, S), 1, 1);
  }
  g.strokeStyle = "rgba(0,0,0,.75)";
  g.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    let x = rr(0, S),
      y = rr(0, S);
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 7; j++) g.lineTo((x += rr(-4, 4)), (y += rr(2, 6)));
    g.stroke(); // cracks
  }
  const t = canvasTex(c, rx, ry),
    b = document.createElement("canvas");
  b.width = b.height = S;
  const bg = b.getContext("2d");
  bg.drawImage(c, 0, 0);
  const im = bg.getImageData(0, 0, S, S),
    d = im.data;
  for (let i = 0; i < d.length; i += 4)
    d[i] = d[i + 1] = d[i + 2] = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
  bg.putImageData(im, 0, 0);
  t.bump = canvasTex(b, rx, ry); // luminance -> relief under the headlamp / flashlight
  return t;
}
/** Lit surface material using mkTex (colour + bump). */
function surf(rx, ry, o = {}) {
  const t = mkTex(rx, ry);
  return new T3.MeshPhongMaterial(
    Object.assign(
      {
        map: t,
        bumpMap: t.bump,
        bumpScale: 1.6,
        shininess: 4,
        specular: 0x222226,
      },
      o,
    ),
  );
}
/** Dirty mustard-yellow handhold texture: worn paint edge, grime, scratches, chipped rust. */
function hT() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  g.fillStyle = "#a07f26";
  g.fillRect(0, 0, 32, 32);
  for (let i = 0; i < 220; i++) {
    const v = rr(0.55, 1.15);
    g.fillStyle = `rgb(${(160 * v) | 0},${(127 * v) | 0},${(38 * v) | 0})`;
    g.fillRect(rr(0, 32), rr(0, 32), 2, 2);
  }
  g.fillStyle = "#cdb04c";
  g.fillRect(0, 0, 32, 3);
  g.fillStyle = "rgba(20,12,4,.55)";
  g.fillRect(0, 28, 32, 4);
  for (let i = 0; i < 5; i++) g.fillRect(rr(0, 32), rr(5, 24), 1, rr(3, 7));
  g.fillStyle = "#6b3a1c";
  g.fillRect(rr(2, 20) | 0, rr(8, 20) | 0, 6, 2);
  g.fillStyle = "rgba(0,0,0,.25)";
  g.fillRect(0, 0, 1, 32);
  g.fillRect(31, 0, 1, 32);
  const t = new T3.CanvasTexture(c);
  t.magFilter = t.minFilter = T3.NearestFilter;
  return t;
}
