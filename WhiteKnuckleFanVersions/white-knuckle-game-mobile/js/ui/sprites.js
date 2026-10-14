/**
 * Pixel-art sprites: hands and the gun-holding hand.
 */
// pixel hands
const HP = [
  "..##.##.##..",
  ".#ww#ww#ww#.",
  ".#ww#ww#ww#.",
  ".#wwwwwwww#.",
  "#wwwwwwwwww#",
  "#wgwwwwwwgw#",
  "#wwwwwwwwww#",
  ".#wwwwwwww#.",
  ".#wwwwwwgw#.",
  "..#wwwwwww#.",
  "..#wwwwww#..",
  "..#wwwwww#..",
  "..#wwwwww#..",
  "..##########",
];
function hand(p, cls, id) {
  const c = document.createElement("canvas");
  c.width = 12;
  c.height = 14;
  c.className = cls;
  if (id) c.id = id;
  const g = c.getContext("2d");
  HP.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      if (ch == ".") return;
      g.fillStyle = p[ch];
      g.fillRect(x, y, 1, 1);
    }),
  );
  document.body.appendChild(c);
  return c;
}
const PK = { "#": "#2a1a24", w: "#ecc8dc", g: "#b58aa2" },
  RD = { "#": "#2a0808", w: "#b92a2a", g: "#7c1717" };
const HD = [hand(PK, "hd", "h0"), hand(PK, "hd", "h1")],
  WH = [hand(RD, "wh"), hand(RD, "wh")];
const GP = [
    "....g....g......",
    "...kkkkkkkkkk...",
    "..kddmmmmmmddk..",
    "..kdmlllllmmdk..",
    "..kdmlllllmmdk..",
    "..kdmmmmmmmmdk..",
    "..kddddlldddddk.",
    "..kdmmmmmmmmdk..",
    "..kddddddddddk..",
    "..kdmmmmmmmmdk..",
    "..kdddddddddk...",
    "...kkkkkkkkk....",
    "..kwwwwwwwwwk...",
    ".kwwswwswwswwk..",
    ".kwwwwwwwwwwwk..",
    ".kwswwwwwwwswk..",
    ".kwwwwwwwwwwwk..",
    "..kwwwwwwwwwk...",
  ],
  PC = {
    k: "#16100c",
    d: "#3d352f",
    m: "#5e544b",
    l: "#84776a",
    g: "#6f6",
    w: "#ecc8dc",
    s: "#b58aa2",
  };
{
  const c = $("gn");
  document.body.appendChild(c); // keep the gun above the hand sprites
  c.width = 16;
  c.height = GP.length;
  const g = c.getContext("2d");
  GP.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      if (PC[ch]) {
        g.fillStyle = PC[ch];
        g.fillRect(x, y, 1, 1);
      }
    }),
  );
}
