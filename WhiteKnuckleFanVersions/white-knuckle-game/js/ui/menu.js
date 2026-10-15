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
const KINDS = ["brick", "plate", "rings", "pipes", "windows"];
[
  ["Beat The Campaign", "Endless Substructure"],
  ["Reach Habitation", "Endless Underworks"],
  ["Reach Pipeworks", "Endless Silos"],
  ["Reach 2000 Meters", "Endless Pipeworks"],
  ["Beat the Campaign on Hard Mode", "Endless Habitation"],
].forEach(([s, t], i) => {
  const d = document.createElement("div");
  d.className = "cd";
  d.style.backgroundImage = `linear-gradient(#000a,#000d),url(${iconCanvas(KINDS[i]).toDataURL()})`;
  d.appendChild(iconImg("lock", "lk"));
  d.insertAdjacentHTML("beforeend", "<em>" + s + "</em><b>" + t + "</b>");
  $("cards").appendChild(d);
});
// menu art: pixel icons, reaching hands around the title, campaign card art, grain
document
  .querySelectorAll("#menu li")
  .forEach((li, i) =>
    li.prepend(iconImg(["play", "journal", "cosmetics", "settings"][i])),
  );
$("menu").append(iconImg("menuhand", "mh mh0"), iconImg("menuhand", "mh mh1"));
$("menu").style.backgroundImage =
  `url(${iconCanvas("noise").toDataURL()}),linear-gradient(90deg,#0009,transparent 60%)`;
$("camp").style.backgroundImage =
  `linear-gradient(#0000,#000b),url(${iconCanvas("campaign").toDataURL()})`;
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
