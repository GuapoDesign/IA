/**
 * Procedural pixel textures for walls and handholds.
 */
// textures
function mkTex(rx, ry) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "#303030";
  g.fillRect(0, 0, 64, 64);
  for (let r = 0; r < 8; r++)
    for (let k = 0; k < 4; k++) {
      const x = k * 16 + (r % 2) * 8,
        v = (95 + Math.random() * 70) | 0;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x + 1, r * 8 + 1, 14, 6);
    }
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.5})`;
    g.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
  }
  for (let i = 0; i < 14; i++) {
    g.fillStyle = "rgba(120,10,10,.35)";
    g.fillRect(
      Math.random() * 64,
      Math.random() * 64,
      1,
      3 + Math.random() * 8,
    );
  }
  for (let r = 0; r < 8; r++)
    for (let k = 0; k < 4; k++) {
      const x = k * 16 + (r % 2) * 8;
      g.fillStyle = "rgba(255,255,255,.12)";
      g.fillRect(x + 1, r * 8 + 1, 14, 1);
      g.fillStyle = "rgba(0,0,0,.35)";
      g.fillRect(x + 1, r * 8 + 6, 14, 1);
      if (Math.random() < 0.2) {
        g.fillStyle = "#9a9a9a";
        g.fillRect(x + 2, r * 8 + 3, 1, 1);
        g.fillRect(x + 12, r * 8 + 3, 1, 1);
      }
    }
  for (let i = 0; i < 6; i++) {
    const gr = g.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, "rgba(0,0,0,.35)");
    gr.addColorStop(1, "rgba(60,20,10,0)");
    g.fillStyle = gr;
    g.fillRect((Math.random() * 64) | 0, 0, 2, 64);
  }
  const t = new T3.CanvasTexture(c);
  t.wrapS = t.wrapT = T3.RepeatWrapping;
  t.magFilter = t.minFilter = T3.NearestFilter;
  t.repeat.set(rx, ry);
  return t;
}
function hT() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  g.fillStyle = "#b9ad92";
  g.fillRect(0, 0, 32, 32);
  for (let i = 0; i < 160; i++) {
    const v = (120 + Math.random() * 110) | 0;
    g.fillStyle = `rgb(${v},${v - 8},${v - 24})`;
    g.fillRect(Math.random() * 32, Math.random() * 32, 2, 2);
  }
  g.fillStyle = "#e8e4d8";
  g.fillRect(0, 0, 32, 5);
  g.fillStyle = "#2a1c10";
  g.fillRect(0, 30, 32, 2);
  for (let i = 0; i < 4; i++)
    g.fillRect(Math.random() * 32, 6 + Math.random() * 20, 1, 6);
  g.fillStyle = "#8c3a22";
  g.fillRect(4, 12, 9, 2);
  const t = new T3.CanvasTexture(c);
  t.magFilter = t.minFilter = T3.NearestFilter;
  return t;
}
