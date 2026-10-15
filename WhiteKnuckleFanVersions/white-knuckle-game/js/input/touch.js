/**
 * Touch controls for phones/tablets: virtual joystick, drag-to-look, grab / jump / utility
 * buttons, tappable hotbar and item prompt. Also provides inputActive() for the main loop.
 */
/** True while the game should simulate: pointer locked (desktop) or landscape (touch). */
function inputActive() {
  return !!document.pointerLockElement || (TOUCH && innerWidth >= innerHeight);
}
/** Best-effort fullscreen + landscape lock when a run starts on a phone. */
function enterTouchMode() {
  const de = document.documentElement,
    rf = de.requestFullscreen || de.webkitRequestFullscreen;
  try {
    if (rf && !document.fullscreenElement) {
      const p = rf.call(de);
      if (p && p.then)
        p.then(
          () =>
            screen.orientation &&
            screen.orientation.lock &&
            screen.orientation.lock("landscape"),
        ).catch(() => {});
    }
  } catch (e) {}
}
if (TOUCH) {
  const capture = (el, e) => {
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {}
  };
  /** Hold-style button: down() on press, up() on release/cancel. */
  const bindBtn = (id, down, up) => {
    const el = $(id),
      end = (e) => {
        e.preventDefault();
        el.classList.remove("on");
        if (up) up();
      };
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      capture(el, e);
      el.classList.add("on");
      down();
    });
    ["pointerup", "pointercancel"].forEach((t) => el.addEventListener(t, end));
  };
  const play = (fn) => () => {
    if (st == "play") fn();
  };
  bindBtn(
    "tg0",
    () => grabDown(0),
    () => grabUp(0),
  );
  bindBtn(
    "tg1",
    () => grabDown(1),
    () => grabUp(1),
  );
  bindBtn("tjp", play(jump));
  bindBtn("tlt", play(torch));
  bindBtn("thk", play(hook));
  bindBtn("tdr", play(drop));
  $("pr").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (st == "play") take();
  });
  $("inv").addEventListener("pointerdown", (e) => {
    const d = e.target.closest && e.target.closest(".sl");
    if (d && st == "play") {
      e.preventDefault();
      slot([...$("inv").children].indexOf(d));
    }
  });

  // Virtual joystick -> WASD flags (full push = sprint)
  const joy = $("joy"),
    knob = $("knob"),
    JR = 50;
  let joyId = null,
    joyC = { x: 0, y: 0 };
  const joyMove = (e) => {
    const dx = e.clientX - joyC.x,
      dy = e.clientY - joyC.y,
      d = Math.hypot(dx, dy) || 1,
      k = Math.min(1, d / JR),
      nx = (dx / d) * k,
      ny = (dy / d) * k;
    knob.style.transform = `translate(${nx * JR}px,${ny * JR}px)`;
    K.KeyA = nx < -0.35 ? 1 : 0;
    K.KeyD = nx > 0.35 ? 1 : 0;
    K.KeyW = ny < -0.35 ? 1 : 0;
    K.KeyS = ny > 0.35 ? 1 : 0;
    K.ShiftLeft = k > 0.95 ? 1 : 0;
  };
  const joyEnd = () => {
    joyId = null;
    knob.style.transform = "";
    K.KeyA = K.KeyD = K.KeyW = K.KeyS = K.ShiftLeft = 0;
  };
  joy.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    joyId = e.pointerId;
    const r = joy.getBoundingClientRect();
    joyC = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    capture(joy, e);
    joyMove(e);
  });
  joy.addEventListener("pointermove", (e) => {
    if (e.pointerId === joyId) joyMove(e);
  });
  ["pointerup", "pointercancel"].forEach((t) =>
    joy.addEventListener(t, (e) => {
      if (e.pointerId === joyId) joyEnd();
    }),
  );

  // Drag anywhere on the scene to look around
  let look = null;
  cv.addEventListener("pointerdown", (e) => {
    if (st == "play" && !look && e.pointerType !== "mouse")
      look = { id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  addEventListener("pointermove", (e) => {
    if (!look || e.pointerId !== look.id) return;
    yaw -= (e.clientX - look.x) * 0.0055;
    pitch = Math.max(
      -1.5,
      Math.min(1.5, pitch - (e.clientY - look.y) * 0.0055),
    );
    look.x = e.clientX;
    look.y = e.clientY;
  });
  ["pointerup", "pointercancel"].forEach((t) =>
    addEventListener(t, (e) => {
      if (look && e.pointerId === look.id) look = null;
    }),
  );

  // Keep the page still while playing; tweak texts for touch
  document.addEventListener(
    "touchmove",
    (e) => st == "play" && e.preventDefault(),
    { passive: false },
  );
  $("end").lastElementChild.textContent = "TAP TO CLIMB AGAIN";
}
