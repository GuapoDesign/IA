/**
 * Mouse and keyboard input (touch lives in touch.js).
 */
/** Press hand n (0 = left, 1 = right). With the gun equipped the right hand fires instead. */
function grabDown(n) {
  if (st != "play") return;
  if (n == 1 && eq() == "gun") {
    fire();
    return;
  }
  hs[n].dn = 1;
}
/** Release hand n (short regrab cooldown if it was holding something). */
function grabUp(n) {
  const h = hs[n];
  h.dn = 0;
  if (h.i >= 0) h.cd = 0.5;
  h.i = -1;
}
addEventListener("mousemove", (e) => {
  if (st == "play" && document.pointerLockElement) {
    yaw -= e.movementX * 0.0022;
    pitch = Math.max(-1.5, Math.min(1.5, pitch - e.movementY * 0.0022));
  }
});
addEventListener("contextmenu", (e) => e.preventDefault());
addEventListener("mousedown", (e) => {
  if (
    st != "play" ||
    !document.pointerLockElement ||
    e.button > 2 ||
    e.button == 1
  )
    return;
  grabDown(e.button ? 1 : 0);
});
addEventListener("mouseup", (e) => {
  if (e.button > 2 || e.button == 1) return;
  grabUp(e.button ? 1 : 0);
});
addEventListener("keydown", (e) => {
  K[e.code] = 1;
  if (e.code == "Space" && st == "play" && !e.repeat) jump();
  if (e.code == "KeyR" && st == "play") reset();
  if (e.code == "KeyF" && st == "play") torch();
  if (e.code == "KeyE" && st == "play") take();
  if (e.code == "KeyQ" && st == "play") drop();
  if (e.code == "KeyX" && st == "play") hook();
  if (/^Digit[1-5]$/.test(e.code) && st == "play") slot(+e.code[5] - 1);
});
addEventListener("keyup", (e) => (K[e.code] = 0));
