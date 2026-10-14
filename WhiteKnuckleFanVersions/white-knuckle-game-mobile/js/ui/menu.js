/**
 * Main menu wiring, menu sounds and ambience.
 */
["pointerdown", "keydown"].forEach((v) => addEventListener(v, () => au()));
document.addEventListener("mouseover", (e) => {
  const t = e.target.closest && e.target.closest("#menu li,#cl,.cd");
  if (t && t !== lastH && st == "menu") snd("hov");
  lastH = t;
});
document.addEventListener(
  "click",
  (e) => {
    if (st != "menu") return;
    const t = e.target.closest && e.target.closest("#menu li,#cl,.cd");
    if (t)
      snd(
        t.id == "mp"
          ? "open"
          : t.id == "cl"
            ? "back"
            : t.id == "camp"
              ? "start"
              : "deny",
      );
  },
  true,
);
setInterval(() => {
  if (st == "menu" && AC && Math.random() < 0.65)
    snd(Math.random() < 0.5 ? "drip" : "creak");
}, 3000);
// UI wiring
[
  ["Beat The Campaign", "Endless Substructure"],
  ["Reach Habitation", "Endless Underworks"],
  ["Reach Pipeworks", "Endless Silos"],
  ["Reach 2000 Meters", "Endless Pipeworks"],
  ["Beat the Campaign on Hard Mode", "Endless Habitation"],
].forEach(([s, t]) => {
  const d = document.createElement("div");
  d.className = "cd";
  d.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0110 0v3h2v11H5V10zm2 0h6V7a3 3 0 00-6 0z" fill="#8a8a8a"/></svg><em>' +
    s +
    "</em><b>" +
    t +
    "</b>";
  $("cards").appendChild(d);
});
$("mp").onclick = () => {
  vis("play", 1);
};
$("cl").onclick = () => vis("play", 0);
$("camp").onclick = reset;
$("end").onclick = reset;
$("pz").onclick = () => cv.requestPointerLock();
document.addEventListener("pointerlockchange", () =>
  vis("pz", st == "play" && !document.pointerLockElement),
);
