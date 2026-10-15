/**
 * Inventory slots, flashlight, equip / use / discard.
 */
const SL = [null, null, null, null, null],
  IN = { gun: "GUN", chalk: "CHALK", light: "LIGHT" };
let sel = -1;
const eq = () => (sel >= 0 && SL[sel] ? SL[sel].t : null),
  tl = new T3.SpotLight(0xfff0d0, 3.2, 37.5, 0.4, 0.55, 1);
cam.add(tl);
cam.add(tl.target);
tl.target.position.set(0, 0, -6);
/** Hold / holster the flashlight (left hand). Held = lit and that hand can't grab. */
const torch = () => {
  lampEq = !lampEq;
  if (lampEq) {
    hs[0].i = -1;
    hs[0].dn = 0;
  }
  snd("click");
};
function addI(t) {
  const s = SL.find((x) => x && x.t == t && t == "chalk");
  if (s) {
    s.n++;
    return 1;
  }
  const i = SL.indexOf(null);
  if (i < 0) return 0;
  SL[i] = { t, n: 1 };
  return 1;
}
function slot(i) {
  const s = SL[i];
  if (!s) return;
  if (s.t == "light") {
    torch();
    return;
  }
  if (s.t == "chalk") {
    hs.forEach((h) => {
      h.s = 100;
      h.lk = 0;
    });
    if (--s.n < 1) SL[i] = null;
    showIt(0xeeeeee);
    snd("pick");
    return;
  }
  sel = sel == i ? -1 : i;
  if (eq() == "gun") {
    hs[1].i = -1;
    hs[1].dn = 0;
  }
  snd("click");
}
function drop() {
  if (sel < 0) return;
  SL[sel] = null;
  sel = -1;
  snd("click");
}
