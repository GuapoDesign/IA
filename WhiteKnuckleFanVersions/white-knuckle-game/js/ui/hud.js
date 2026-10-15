/**
 * HUD helpers: item-in-hand popup, hotbar slots, mouse-wheel selection.
 */
function showIt(c) {
  const e = $("it"),
    s = itemCanvas(c == 0xc8742a ? "ammo" : "chalk");
  e.width = s.width;
  e.height = s.height;
  e.style.width = s.width * 4.5 + "px";
  e.style.height = s.height * 4.5 + "px";
  e.getContext("2d").drawImage(s, 0, 0);
  itemT = 1.3;
  e.className = "on";
  setTimeout(() => (e.className = ""), 1300);
}
addEventListener("wheel", (e) => {
  if (st != "play") return;
  const n = SL.map((s, i) => (s && s.t != "light" ? i : -1)).filter(
    (i) => i >= 0,
  );
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
