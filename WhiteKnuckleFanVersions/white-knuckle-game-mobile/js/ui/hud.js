/**
 * HUD helpers: item-in-hand popup, hotbar slots, mouse-wheel selection.
 */
function showIt(c) {
  const e = $("it"),
    g = e.getContext("2d");
  g.clearRect(0, 0, 8, 8);
  g.fillStyle = "#1a1410";
  g.fillRect(1, 1, 6, 6);
  g.fillStyle = "#" + c.toString(16).padStart(6, "0");
  g.fillRect(2, 2, 4, 4);
  e.className = "on";
  setTimeout(() => (e.className = ""), 1300);
}
addEventListener("wheel", (e) => {
  if (st != "play") return;
  const n = SL.map((s, i) => (s ? i : -1)).filter((i) => i >= 0);
  if (n.length) {
    sel = n[(n.indexOf(sel) + (e.deltaY > 0 ? 1 : -1) + n.length) % n.length];
    if (eq() == "gun") {
      hs[1].i = -1;
      hs[1].dn = 0;
    }
  }
});
for (let i = 0; i < 5; i++) {
  const d = document.createElement("div");
  d.className = "sl";
  $("inv").appendChild(d);
}
