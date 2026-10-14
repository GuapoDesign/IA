/**
 * All sound effects (single table) and the snd() player.
 */
const SN = {
  grab: () => {
    tn(110, 0.09, "sine", 0.3, 55);
    nz(0.05, 0.12, 1500);
  },
  jump: () => {
    nz(0.22, 0.18, 600);
    tn(150, 0.15, "sine", 0.12, 260);
  },
  shot: () => {
    nz(0.12, 0.5, 2200);
    tn(220, 0.1, "triangle", 0.25, 70);
  },
  hit: () => {
    tn(95, 0.35, "sine", 0.45, 38);
    nz(0.2, 0.35, 350);
  },
  hit2: () => {
    tn(720, 0.16, "sine", 0.18, 420);
  },
  die: () => {
    tn(180, 0.9, "sine", 0.3, 50);
  },
  roar: () => {
    nz(0.9, 0.35, 200);
    tn(75, 0.9, "triangle", 0.25, 45);
  },
  click: () => nz(0.03, 0.15, 3500),
  land: () => {
    tn(85, 0.2, "sine", 0.4, 40);
    nz(0.1, 0.2, 220);
  },
  pick: () => {
    tn(520, 0.12, "sine", 0.18);
    setTimeout(() => AC && tn(780, 0.18, "sine", 0.18), 90);
  },
  hov: () => {
    tn(1500, 0.04, "sine", 0.05, 1200);
    nz(0.03, 0.04, 4500);
  },
  open: () => {
    nz(0.3, 0.22, 550);
    tn(160, 0.22, "sine", 0.18, 90);
    tn(330, 0.2, "sine", 0.07, 495);
  },
  back: () => {
    tn(300, 0.14, "sine", 0.12, 150);
    nz(0.1, 0.14, 700);
  },
  start: () => {
    tn(70, 1.1, "sine", 0.45, 32);
    nz(0.8, 0.28, 250);
    [0, 90, 170, 260].forEach((d) =>
      setTimeout(() => AC && nz(0.07, 0.22, 2800), d),
    );
  },
  deny: () => tn(150, 0.1, "square", 0.05, 110),
  step: () => {
    tn(95 + Math.random() * 25, 0.07, "sine", 0.12, 55);
    nz(0.05, 0.1, 700);
  },
  creak: () => tn(55 + Math.random() * 30, 1.3, "triangle", 0.05, 40),
  drip: () => {
    tn(2000 + Math.random() * 600, 0.07, "sine", 0.05, 900);
    setTimeout(() => AC && tn(1200, 0.05, "sine", 0.03, 700), 120);
  },
  pw: () => {
    [0, 70, 140].forEach((d, i) =>
      setTimeout(() => AC && tn(500 + i * 180, 0.18, "sine", 0.14), d),
    );
  },
  hook: () => {
    nz(0.15, 0.3, 3000);
    tn(900, 0.12, "triangle", 0.15, 350);
  },
};
const snd = (n) => {
  if (AC)
    try {
      SN[n]();
    } catch (e) {}
};
