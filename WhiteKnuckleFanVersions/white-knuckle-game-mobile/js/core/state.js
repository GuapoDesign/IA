/**
 * Global game state: player, hands, timers, flags and gameplay counters.
 */
/** True on phones/tablets (coarse pointer). Add ?touch=1 to the URL to force touch controls. */
const TOUCH =
  /[?&]touch=1/.test(location.search) ||
  (window.matchMedia ? matchMedia("(pointer: coarse)").matches : false);
document.body.classList.toggle("touch", TOUCH);
let hp = 3,
  ammo = 0,
  gcd = 0,
  shk = 0,
  G = 0,
  nIt = null;
let stepT = 0,
  lastH = null;
// state
const P = new T3.Vector3(12, 1.7, 0),
  V = new T3.Vector3(),
  F = new T3.Vector3(),
  hs = [0, 1].map(() => ({ i: -1, s: 100, lk: 0, dn: 0, cd: 0 }));
let yaw = -1.57,
  pitch = 0.35,
  hz = -7,
  tt = 0,
  st = "menu",
  ht = 0,
  best = 0,
  fell = 0,
  K = {};
try {
  best = +localStorage.getItem("wk_best") || 0;
} catch (e) {}
