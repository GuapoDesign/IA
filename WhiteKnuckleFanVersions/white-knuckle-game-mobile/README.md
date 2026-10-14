# White Knuckle: The Climb — browser fan game

Unofficial fan project (not affiliated with the original developers). First-person vertical climbing in the browser, built with plain HTML/CSS/JS and [three.js r128](https://threejs.org) (loaded from a CDN).

## Run

Open `index.html` in a desktop browser (Chrome / Edge / Firefox). No build step and no server required.
To produce a single-file version: `python3 tools/bundle.py`.

## Structure

```
index.html            markup only (menu, HUD, overlays) + script order
css/
  base.css            reset, tokens, canvas, post-process overlays
  hud.css             in-game HUD (stamina, hands, gun, inventory, power-ups)
  menu.css            main menu and Play panel
  overlays.css        end-of-run and pause screens
  touch.css           phone layout (active when <body class="touch">)
js/                   classic scripts that share one global scope (loaded in this order)
  core/               renderer.js (scene/camera/viewport) · state.js (global game state)
  world/              textures · environment (silo shell) · zones · holds (routes) ·
                      platforms (rest ledges) · districts (rooftops, cranes) · pickups
  entities/           powerups (orbs, wall grip, grappling hook) · monster (the hunter)
  audio/              engine.js (WebAudio helpers) · sounds.js (all effects)
  ui/                 sprites (pixel hands/gun) · hud · menu
  player/             inventory · items · weapon · grabbing · movement
  input/              controls.js (mouse + keyboard) · touch.js (phone controls)
  game/               flow.js (reset/die) · sim.js (per-frame logic) · render.js (per-frame draw)
  main.js             main loop
```

Load order matters (see the `<script>` list in `index.html`): `core` → `world` → `entities` → `audio` → `ui` → `player` → `game` → `main`.

## Controls

L/R click grab · Space jump / double jump · Shift sprint · W A S D move/steer · F flashlight · E take · 1-5 / wheel use or equip · Q discard · X grappling hook (W/S reel, A/D swing) · Right click fires when the gun is equipped · R restart.

## Mobile

On phones/tablets (coarse pointer) the touch UI turns on automatically; add `?touch=1` to the URL to force it on a desktop.
Left thumb: joystick (push fully to sprint). Right thumb: **GRAB L / GRAB R** (hold), **JUMP**; tap the right button to fire when the gun is equipped. Drag anywhere on the scene to look. Top-right: LIGHT · HOOK · DROP. Tap hotbar slots to use/equip; tap the item prompt to take. Play in landscape (a rotate hint is shown in portrait).
