/**
 * Picking up world items.
 */
function take() {
  if (!nIt) return;
  const i = nIt;
  if (i.t == "ammo") {
    ammo += 6;
    showIt(0xc8742a);
  } else {
    if (!addI(i.t)) {
      snd("click");
      return;
    }
    if (i.t == "gun") {
      ammo += 8;
      sel = SL.findIndex((x) => x && x.t == "gun");
      hs[1].i = -1;
      hs[1].dn = 0;
      const g = $("gn");
      g.style.transition = "transform .45s";
      g.style.transform = "translateY(180px)";
      setTimeout(() => {
        g.style.transform = "";
        setTimeout(() => (g.style.transition = ""), 500);
      }, 30);
    } else showIt(0xeeeeee);
  }
  i.on = 0;
  i.o.visible = false;
  snd("pick");
  nIt = null;
}
