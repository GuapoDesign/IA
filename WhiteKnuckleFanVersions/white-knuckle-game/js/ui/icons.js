/**
 * Pixel-art menu icons and card textures. Greyscale shapes are drawn procedurally, then converted
 * to dithered, palette-limited sprites (same pipeline as the hands) with a thin outline.
 */
const ICN = {},
  EDGE_LIGHT = [232, 220, 190];
/** Build a sprite canvas: draw(g, R) paints greyscale shapes, then dither to `tones` with `edge`. */
function mkSprite(w, h, draw, tones, edge) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d"),
    R = (v, x, y, ww, hh) => {
      g.fillStyle = grey(v);
      g.fillRect(x, y, ww, hh);
    };
  draw(g, R);
  pixelize(g, w, h, tones, edge);
  return c;
}
/** Cached icon / texture canvas by name. */
function iconCanvas(kind) {
  if (ICN[kind]) return ICN[kind];
  const circ = (g, v, x, y, r) => {
    g.fillStyle = grey(v);
    g.beginPath();
    g.arc(x, y, r, 0, 6.283);
    g.fill();
  };
  let c;
  switch (kind) {
    case "play": // a fist gripping
      c = mkSprite(
        HW,
        HH,
        (g) => drawHand(g, { curl: 1, spread: 0.08, thumb: 1 }),
        HSKIN,
        [30, 14, 22],
      );
      break;
    case "menuhand": // open reaching hand used as title decoration
      c = mkSprite(
        HW,
        HH,
        (g) => drawHand(g, { curl: 0.1, spread: 1.1, thumb: 0.3 }),
        ramp(0x9a5a8a),
        [20, 8, 24],
      );
      break;
    case "journal":
      c = mkSprite(
        24,
        28,
        (g, R) => {
          R(120, 3, 3, 18, 22); // cover
          R(70, 3, 3, 3, 22); // spine
          R(215, 6, 5, 13, 17); // pages
          for (let i = 0; i < 4; i++) R(120, 8, 9 + i * 3, 9, 1);
        },
        ramp(0x9a7a50),
        EDGE_LIGHT,
      );
      c.getContext("2d").fillStyle = "#d41f1f"; // ribbon
      c.getContext("2d").fillRect(16, 2, 3, 10);
      break;
    case "cosmetics": // cap
      c = mkSprite(
        28,
        24,
        (g, R) => {
          g.fillStyle = grey(175);
          g.beginPath();
          g.ellipse(14, 15, 10, 9, 0, Math.PI, 0);
          g.fill();
          R(120, 3, 15, 19, 4); // brim
          R(235, 7, 7, 6, 1); // highlight
          R(90, 14, 6, 1, 9); // seam
          circ(g, 235, 14, 5.5, 1.6); // button
        },
        ramp(0xc8506a),
        EDGE_LIGHT,
      );
      break;
    case "settings": // gear
      c = mkSprite(
        28,
        28,
        (g) => {
          g.translate(14, 14);
          for (let i = 0; i < 8; i++) {
            g.save();
            g.rotate((i * Math.PI) / 4);
            g.fillStyle = grey(190);
            g.fillRect(-2.5, -13, 5, 6);
            g.restore();
          }
          circ(g, 160, 0, 0, 9);
          circ(g, 215, -2, -2, 4);
          g.globalCompositeOperation = "destination-out";
          circ(g, 255, 0, 0, 3.4); // axle hole
        },
        ramp(0xaab0b8),
        EDGE_LIGHT,
      );
      break;
    case "lock":
      c = mkSprite(
        24,
        30,
        (g, R) => {
          g.strokeStyle = grey(200);
          g.lineWidth = 3;
          g.beginPath();
          g.arc(12, 12, 6, Math.PI, 0);
          g.moveTo(6, 12);
          g.lineTo(6, 14);
          g.moveTo(18, 12);
          g.lineTo(18, 14);
          g.stroke();
          R(150, 3, 14, 18, 14);
          R(215, 3, 14, 18, 2);
          circ(g, 20, 12, 21, 2.4);
          R(20, 11, 22, 2, 5);
        },
        ramp(0x8a8a8a),
        EDGE_LIGHT,
      );
      break;
    case "campaign": // red shaft seen from below, rising tide
      c = mkSprite(
        96,
        64,
        (g) => {
          g.fillStyle = grey(20);
          g.fillRect(0, 0, 96, 64);
          for (let i = 0; i < 12; i++) {
            const z = i / 12;
            g.strokeStyle = grey(40 + z * 200);
            g.lineWidth = 1 + z * 3;
            g.beginPath();
            g.arc(48, 22, 3 + Math.pow(z, 2) * 70, 0, 6.283);
            g.stroke();
          }
          g.strokeStyle = grey(70);
          g.lineWidth = 1;
          for (let i = 0; i < 14; i++) {
            const a = (i / 14) * 6.283;
            g.beginPath();
            g.moveTo(48 + Math.cos(a) * 4, 22 + Math.sin(a) * 4);
            g.lineTo(48 + Math.cos(a) * 80, 22 + Math.sin(a) * 80);
            g.stroke();
          }
          const t = g.createLinearGradient(0, 40, 0, 64);
          t.addColorStop(0, "rgba(255,255,255,0)");
          t.addColorStop(1, "rgba(255,255,255,.85)");
          g.fillStyle = t;
          g.fillRect(0, 40, 96, 24);
        },
        ramp(0xd22a2a),
        null,
      );
      break;
    case "noise": // grain used on the menu background
      c = mkSprite(
        64,
        64,
        (g) => {
          for (let i = 0; i < 420; i++) {
            g.fillStyle = grey(60 + Math.random() * 190);
            g.fillRect(
              (Math.random() * 64) | 0,
              (Math.random() * 64) | 0,
              1,
              1,
            );
          }
        },
        ramp(0x8a6ac8).map((t) => t.map((v) => v * 0.55)),
        null,
      );
      break;
    default: // biome card textures: brick | plate | rings | pipes | windows
      c = mkSprite(
        64,
        40,
        (g, R) => {
          R(30, 0, 0, 64, 40);
          if (kind == "brick")
            for (let r = 0; r < 5; r++)
              for (let x = -(r % 2) * 8; x < 64; x += 16)
                R(70 + ((x * 7 + r * 13) % 6) * 14, x + 1, r * 8 + 1, 14, 6);
          else if (kind == "plate")
            for (let y = 0; y < 40; y += 20)
              for (let x = 0; x < 64; x += 32) {
                R(110, x + 1, y + 1, 30, 18);
                R(230, x + 3, y + 3, 2, 2);
                R(230, x + 27, y + 3, 2, 2);
                R(230, x + 3, y + 15, 2, 2);
                R(230, x + 27, y + 15, 2, 2);
              }
          else if (kind == "rings")
            for (let i = 0; i < 6; i++) {
              g.strokeStyle = grey(70 + i * 30);
              g.lineWidth = 2;
              g.beginPath();
              g.arc(32, 50, 8 + i * 9, 0, 6.283);
              g.stroke();
            }
          else if (kind == "pipes")
            for (let y = 3; y < 40; y += 10) {
              const gr = g.createLinearGradient(0, y, 0, y + 7);
              gr.addColorStop(0, grey(220));
              gr.addColorStop(1, grey(60));
              g.fillStyle = gr;
              g.fillRect(0, y, 64, 7);
            }
          else
            for (let y = 3; y < 40; y += 10)
              for (let x = 3; x < 64; x += 10)
                R((x * 3 + y * 5) % 7 < 3 ? 245 : 55, x, y, 6, 6);
        },
        ramp(
          {
            brick: 0x8a8a3a,
            plate: 0x6a7280,
            rings: 0x7a55d8,
            pipes: 0xa85a2a,
            windows: 0xd8a040,
          }[kind] || 0x888888,
        ),
        null,
      );
  }
  return (ICN[kind] = c);
}
/** <img> element showing an icon (pixelated by CSS). */
function iconImg(kind, cls) {
  const i = new Image();
  i.src = iconCanvas(kind).toDataURL();
  i.className = cls || "mi";
  return i;
}
