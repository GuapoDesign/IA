const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const healthText = document.getElementById('healthText');
const energyText = document.getElementById('energyText');
const objectiveText = document.getElementById('objectiveText');
const resetStageBtn = document.getElementById('resetStageBtn');

const keys = {};
const pressed = {};
const camera = { x: 0, y: 0 };

const world = {
  width: 3800,
  height: 900,
  gravity: 0.48,
};

const level = {
  platforms: [
    { x: 0, y: 660, w: 850, h: 160 },
    { x: 920, y: 660, w: 780, h: 160 },
    { x: 1800, y: 660, w: 900, h: 160 },
    { x: 2850, y: 660, w: 950, h: 160 },

    { x: 200, y: 650, w: 170, h: 18 },
    { x: 420, y: 560, w: 160, h: 18 },
    { x: 620, y: 470, w: 180, h: 18 },

    { x: 990, y: 660, w: 180, h: 18 },
    { x: 1210, y: 590, w: 200, h: 18 },
    { x: 1490, y: 510, w: 180, h: 18 },

    { x: 1820, y: 630, w: 220, h: 18 },
    { x: 2110, y: 560, w: 210, h: 18 },
    { x: 2335, y: 480, w: 180, h: 18 },

    { x: 2565, y: 640, w: 220, h: 18 },
    { x: 2860, y: 560, w: 180, h: 18 },
    { x: 3120, y: 480, w: 170, h: 18 },
    { x: 3340, y: 410, w: 170, h: 18 },

    { x: 2980, y: 650, w: 90, h: 18 },
    { x: 3450, y: 640, w: 140, h: 18 },
  ],
  spikes: [
    { x: 870, y: 640, w: 30, h: 20 },
    { x: 1705, y: 640, w: 40, h: 20 },
    { x: 2720, y: 640, w: 35, h: 20 },
  ],
};

const state = {
  gameOver: false,
  victory: false,
  messageTimer: 0,
  message: '',
};

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getBodyBox(entity) {
  const insetX = 4;
  const insetY = 2;
  return {
    x: entity.x + insetX,
    y: entity.y + insetY,
    w: Math.max(entity.w - insetX * 2, 12),
    h: Math.max(entity.h - insetY * 2, 18),
  };
}

const player = {
  x: 120,
  y: 560,
  w: 36,
  h: 52,
  vx: 0,
  vy: 0,
  speed: 4.2,
  jumpStrength: 12.5,
  facing: 1,
  onGround: false,
  wallSliding: false,
  canDoubleJump: false,
  dashReady: false,
  dashTime: 0,
  dashCooldown: 0,
  attackTimer: 0,
  attackCooldown: 0,
  attackBox: null,
  combo: 0,
  comboTimer: 0,
  attackHitIds: new Set(),
  weapon: 'espada',
  invuln: 0,
  maxHealth: 100,
  health: 100,
  jumpCount: 0,
  abilities: {
    doubleJump: false,
    dash: false,
    wallJump: false,
  },
};

const boss = {
  x: 3605,
  y: 620,
  w: 120,
  h: 120,
  vx: 0,
  vy: 0,
  health: 180,
  maxHealth: 180,
  dir: -1,
  attackCooldown: 0,
  alive: true,
  hitTimer: 0,
  stunTimer: 0,
};

const collectibles = [
  { x: 500, y: 510, w: 18, h: 18, type: 'doubleJump', collected: false },
  { x: 2100, y: 520, w: 18, h: 18, type: 'dash', collected: false },
  { x: 3400, y: 360, w: 18, h: 18, type: 'wallJump', collected: false },
];

const enemies = [
  { x: 1060, y: 708, w: 40, h: 52, minX: 1015, maxX: 1330, dir: 1, speed: 1.2, health: 30, hitTimer: 0, maxHealth: 30 },
  { x: 1580, y: 708, w: 40, h: 52, minX: 1510, maxX: 1700, dir: -1, speed: 1.2, health: 30, hitTimer: 0, maxHealth: 30 },
  { x: 1880, y: 708, w: 40, h: 52, minX: 1840, maxX: 2130, dir: 1, speed: 1.4, health: 35, hitTimer: 0, maxHealth: 35 },
  { x: 2400, y: 708, w: 40, h: 52, minX: 2360, maxX: 2670, dir: 1, speed: 1.5, health: 35, hitTimer: 0, maxHealth: 35 },
  { x: 3050, y: 708, w: 40, h: 52, minX: 2890, maxX: 3440, dir: -1, speed: 1.8, health: 40, hitTimer: 0, maxHealth: 40 },
];

function resetStage() {
  player.x = 120;
  player.y = 640;
  player.vx = 0;
  player.vy = 0;
  player.health = player.maxHealth;
  player.invuln = 0;
  player.attackBox = null;
  player.attackCooldown = 0;
  player.attackTimer = 0;
  player.combo = 0;
  player.comboTimer = 0;
  player.jumpCount = 0;
  player.onGround = false;
  player.wallSliding = false;
  player.facing = 1;

  collectibles.forEach((item) => {
    item.collected = false;
  });

  enemies.forEach((enemy) => {
    enemy.health = enemy.maxHealth;
    enemy.dead = false;
    enemy.hitTimer = 0;
  });

  boss.x = 3605;
  boss.y = 620;
  boss.health = boss.maxHealth;
  boss.alive = true;
  boss.hitTimer = 0;
  boss.stunTimer = 0;
  boss.attackCooldown = 0;

  player.abilities.doubleJump = false;
  player.abilities.dash = false;
  player.abilities.wallJump = false;
  state.gameOver = false;
  state.victory = false;
  state.message = 'Fase reiniciada';
  state.messageTimer = 1.4;
  setObjectiveText();
  healthText.textContent = `${player.health}/${player.maxHealth}`;
  objectiveText.textContent = 'Explore e destrua o guardião';
}

function unlockAbility(type) {
  player.abilities[type] = true;
  const labels = {
    doubleJump: 'Salto duplo desbloqueado!',
    dash: 'Dash desbloqueado!',
    wallJump: 'Pulo de parede desbloqueado!',
  };

  state.message = labels[type];
  state.messageTimer = 2.2;

  if (type === 'doubleJump') player.canDoubleJump = true;
  if (type === 'dash') player.dashReady = true;
}

function setObjectiveText() {
  if (boss.alive) {
    objectiveText.textContent = 'Explore e destrua o guardião';
  } else {
    objectiveText.textContent = 'Vitória alcançada';
  }
}

function hitPlayer(amount) {
  if (player.invuln > 0 || state.gameOver || state.victory) return;
  player.health = clamp(player.health - amount, 0, player.maxHealth);
  player.invuln = 1.0;
  if (player.health <= 0) {
    state.gameOver = true;
    state.message = 'Você foi derrotado';
    state.messageTimer = 3;
  }
}

function damageEnemy(enemy, amount, direction) {
  if (enemy.hitTimer > 0 || enemy.dead) return;

  enemy.health -= amount;
  enemy.hitTimer = 0.25;
  enemy.dir = direction;
  enemy.x += direction * 8;

  if (enemy.health <= 0) {
    enemy.dead = true;
  }
}

function doAttack() {
  if (player.attackCooldown > 0 || state.gameOver || state.victory) return;

  player.combo = (player.combo % 3) + 1;
  player.comboTimer = 1.0;
  player.attackCooldown = 0.28;
  player.attackTimer = 0.12;
  player.attackHitIds.clear();

  const attackW = player.combo === 3 ? 74 : 60;
  const attackH = player.combo === 3 ? 98 : 82;
  const x = player.facing > 0 ? player.x + player.w - 8 : player.x - attackW + 8;
  const y = player.y - 14;
  player.attackBox = { x, y, w: attackW, h: attackH };

  const baseDamage = player.combo === 1 ? 10 : player.combo === 2 ? 16 : 24;

  enemies.forEach((enemy) => {
    if (enemy.dead) return;
    if (rectsIntersect(player.attackBox, getBodyBox(enemy))) {
      const direction = player.x < enemy.x ? -1 : 1;
      damageEnemy(enemy, baseDamage, direction);
      player.attackHitIds.add(enemy);
    }
  });

  if (boss.alive && rectsIntersect(player.attackBox, getBodyBox(boss))) {
    boss.hitTimer = 0.25;
    boss.stunTimer = 0.15;
    boss.health -= baseDamage + 4;
    const direction = player.x < boss.x ? -1 : 1;
    boss.x += direction * 12;
    if (boss.health <= 0) {
      boss.alive = false;
      state.victory = true;
      state.message = 'O guardião foi derrotado';
      state.messageTimer = 3.5;
      setObjectiveText();
    }
  }
}

function handleInput() {
  const moveLeft = !!keys['KeyA'] || !!keys['ArrowLeft'];
  const moveRight = !!keys['KeyD'] || !!keys['ArrowRight'];
  const jumpHeld = !!keys['Space'] || !!keys['KeyW'] || !!keys['ArrowUp'];

  if (moveLeft && !moveRight) {
    player.vx = -player.speed;
    player.facing = -1;
  } else if (moveRight && !moveLeft) {
    player.vx = player.speed;
    player.facing = 1;
  } else {
    player.vx *= 0.72;
    if (Math.abs(player.vx) < 0.05) player.vx = 0;
  }

  if (pressed['Space'] || pressed['KeyW'] || pressed['ArrowUp']) {
    if (player.onGround) {
      player.vy = -player.jumpStrength;
      player.onGround = false;
      player.jumpCount = 1;
    } else if (player.abilities.doubleJump && player.jumpCount < 2) {
      player.vy = -player.jumpStrength * 0.92;
      player.jumpCount += 1;
    } else if (player.abilities.wallJump && player.wallSliding) {
      player.vy = -player.jumpStrength * 0.95;
      player.vx = player.facing === 1 ? -7.5 : 7.5;
      player.wallSliding = false;
      player.jumpCount = 1;
    }
  }

  if ((pressed['ShiftLeft'] || pressed['ShiftRight'] || pressed['KeyL']) && player.abilities.dash && player.dashCooldown <= 0) {
    player.dashCooldown = 1.2;
    player.dashTime = 0.18;
    player.vx = player.facing * 11;
    player.vy *= 0.5;
  }

  if (pressed['KeyJ'] || pressed['KeyK']) {
    doAttack();
  }

  if (jumpHeld && player.wallSliding && player.abilities.wallJump) {
    player.vy = -11.5;
    player.vx = player.facing === 1 ? -7 : 7;
    player.wallSliding = false;
  }

  if (player.dashTime > 0) {
    player.dashTime -= 1 / 60;
  }
}

function updatePlayer() {
  if (state.gameOver || state.victory) return;

  if (player.invuln > 0) player.invuln -= 1 / 60;
  if (player.attackCooldown > 0) player.attackCooldown -= 1 / 60;
  if (player.dashCooldown > 0) player.dashCooldown -= 1 / 60;
  if (player.attackTimer > 0) player.attackTimer -= 1 / 60;
  else player.attackBox = null;

  if (player.comboTimer > 0) {
    player.comboTimer -= 1 / 60;
    if (player.comboTimer <= 0) player.combo = 0;
  }

  player.vy += world.gravity;

  const prevX = player.x;
  const prevY = player.y;

  const prevPlayerBody = getBodyBox({ x: prevX, y: prevY, w: player.w, h: player.h });

  player.x += player.vx;
  const bodyX = getBodyBox(player);
  for (const solid of level.platforms) {
    if (rectsIntersect(bodyX, solid)) {
      if (player.vx > 0) {
        player.x = solid.x - player.w;
      } else if (player.vx < 0) {
        player.x = solid.x + solid.w;
      }
      player.vx = 0;
    }
  }

  player.y += player.vy;
  player.onGround = false;
  player.wallSliding = false;

  const bodyY = getBodyBox(player);
  const feetBox = {
    x: player.x + 4,
    y: player.y + player.h - 8,
    w: player.w - 8,
    h: 10,
  };

  for (const solid of level.platforms) {
    if (rectsIntersect(feetBox, solid) && player.vy >= 0 && prevPlayerBody.y + prevPlayerBody.h <= solid.y + 18) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.onGround = true;
      player.jumpCount = 0;
    }

    if (!rectsIntersect(bodyY, solid)) continue;

    if (prevPlayerBody.y >= solid.y + solid.h - 10 && player.vy < 0) {
      player.y = solid.y + solid.h;
      player.vy = 0;
    } else if (prevPlayerBody.x + prevPlayerBody.w <= solid.x + 12 && player.vx > 0) {
      player.x = solid.x - player.w;
      player.vx = 0;
    } else if (prevPlayerBody.x >= solid.x + solid.w - 12 && player.vx < 0) {
      player.x = solid.x + solid.w;
      player.vx = 0;
    }
  }

  if (!player.onGround) {
    const sideLeft = { x: player.x + 2, y: player.y + 8, w: 4, h: player.h - 18 };
    const sideRight = { x: player.x + player.w - 6, y: player.y + 8, w: 4, h: player.h - 18 };
    let touchingWall = false;
    for (const solid of level.platforms) {
      if (rectsIntersect(sideLeft, solid) || rectsIntersect(sideRight, solid)) {
        touchingWall = true;
      }
      if (touchingWall) {
        if (player.vy > 0 && player.abilities.wallJump) {
          player.wallSliding = true;
          player.vy = Math.min(player.vy, 2.5);
        }
      }
    }
  }

  if (player.y > world.height + 160) {
    player.health = 0;
    state.gameOver = true;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > world.width) player.x = world.width - player.w;

  for (const item of collectibles) {
    if (!item.collected && rectsIntersect(player, item)) {
      item.collected = true;
      unlockAbility(item.type);
      if (item.type === 'doubleJump') player.canDoubleJump = true;
    }
  }

  for (const spike of level.spikes) {
    if (rectsIntersect(player, spike)) {
      hitPlayer(18);
    }
  }

  for (const enemy of enemies) {
    if (enemy.dead) continue;

    if (enemy.hitTimer > 0) {
      enemy.hitTimer -= 1 / 60;
    }

    if (enemy.hitTimer <= 0) {
      enemy.x += enemy.speed * enemy.dir;
      if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) {
        enemy.dir *= -1;
      }
    }

    if (rectsIntersect(getBodyBox(player), getBodyBox(enemy))) {
      const hitFromAbove = player.vy > 0 && player.y + player.h - enemy.y < 18;
      if (hitFromAbove && player.vy > 0) {
        player.vy = -9;
        damageEnemy(enemy, 35, player.facing);
      } else if (enemy.hitTimer <= 0) {
        hitPlayer(10);
      }
    }
  }

  if (boss.alive && rectsIntersect(getBodyBox(player), getBodyBox(boss))) {
    if (boss.stunTimer <= 0) {
      hitPlayer(18);
    }
  }

  if (boss.alive) {
    if (boss.hitTimer > 0) boss.hitTimer -= 1 / 60;
    if (boss.stunTimer > 0) boss.stunTimer -= 1 / 60;

    if (boss.stunTimer <= 0) {
      const dist = player.x - boss.x;
      boss.dir = dist < 0 ? -1 : 1;
      boss.vx = boss.dir * 1.6;
      boss.x += boss.vx;

      boss.attackCooldown -= 1 / 60;
      if (Math.abs(player.x - boss.x) < 210 && boss.attackCooldown <= 0) {
        boss.attackCooldown = 1.4;
        hitPlayer(18);
        if (player.x < boss.x) {
          player.vx = -7;
        } else {
          player.vx = 7;
        }
      }
    }
  }

  // camera
  camera.x = clamp(player.x - canvas.width / 2 + player.w / 2, 0, world.width - canvas.width);
}

function update() {
  handleInput();
  updatePlayer();

  if (state.messageTimer > 0) {
    state.messageTimer -= 1 / 60;
  }

  healthText.textContent = `${Math.round(player.health)}/${player.maxHealth}`;
  energyText.textContent = `${collectibles.filter((c) => c.collected).length}`;

  if (boss.alive) setObjectiveText();

  requestAnimationFrame(update);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a1020');
  gradient.addColorStop(0.18, '#101b2e');
  gradient.addColorStop(0.55, '#142d43');
  gradient.addColorStop(1, '#0a1320');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const moonX = canvas.width - 180;
  const moonY = 90;
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 249, 202, 0.85)';
  ctx.arc(moonX, moonY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 249, 202, 0.18)';
  ctx.arc(moonX, moonY, 65, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 28; i++) {
    const px = ((i * 120) - camera.x * 0.18 + 40) % (canvas.width + 150);
    const py = 35 + ((i * 51) % 230);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(px, py, 2, 2);
  }

  for (let i = 0; i < 10; i++) {
    const x = (i * 220 - camera.x * 0.25) % (canvas.width + 260);
    const y = 420 + (i % 4) * 22;
    ctx.fillStyle = 'rgba(25, 39, 58, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x, 720);
    ctx.lineTo(x + 120, y);
    ctx.lineTo(x + 260, 720);
    ctx.fill();
  }

  for (let i = 0; i < 12; i++) {
    const x = (i * 180 - camera.x * 0.2) % (canvas.width + 230);
    const y = 160 + (i % 5) * 46;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, 80, 2);
  }

  ctx.fillStyle = 'rgba(18, 31, 45, 0.5)';
  ctx.fillRect(0, 700, canvas.width, 30);
}

function drawPlatform(platform) {
  const x = platform.x - camera.x;
  const y = platform.y;
  ctx.fillStyle = '#1d2f40';
  ctx.fillRect(x, y, platform.w, platform.h);
  ctx.fillStyle = '#35536d';
  ctx.fillRect(x, y, platform.w, 8);

  ctx.fillStyle = 'rgba(140, 195, 255, 0.08)';
  for (let i = 0; i < platform.w; i += 24) {
    ctx.fillRect(x + i, y + 10, 10, platform.h - 20);
  }
}

function drawSpikes(spike) {
  const x = spike.x - camera.x;
  const y = spike.y;
  ctx.fillStyle = '#d85f5f';
  for (let i = 0; i < spike.w; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + spike.h);
    ctx.lineTo(x + i + 5, y);
    ctx.lineTo(x + i + 10, y + spike.h);
    ctx.fill();
  }
}

function drawCollectible(item) {
  if (item.collected) return;
  const x = item.x - camera.x;
  const y = item.y;
  const glow = 1 + Math.sin(Date.now() / 200 + item.x) * 0.3;
  ctx.save();
  ctx.translate(x + item.w / 2, y + item.h / 2);
  ctx.scale(glow, glow);

  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = item.type === 'doubleJump' ? '#7ee081' : item.type === 'dash' ? '#82d9ff' : '#e4a3ff';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    if (enemy.dead) return;
    const x = enemy.x - camera.x;
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(x + 4, enemy.y + enemy.h + 6, enemy.w - 8, 6);
    ctx.fillStyle = 'rgba(90, 90, 90, 0.2)';
    ctx.fillRect(x - 6, enemy.y + enemy.h + 8, enemy.w + 12, 6);

    ctx.fillStyle = enemy.hitTimer > 0 ? '#ffd8b1' : '#ff9d6c';
    ctx.fillRect(x, enemy.y, enemy.w, enemy.h);

    ctx.fillStyle = '#3d1d1d';
    ctx.fillRect(x + 6, enemy.y + 10, enemy.w - 12, 8);
    ctx.fillStyle = '#f4e6ff';
    ctx.fillRect(x + 10, enemy.y + 12, 6, 6);
    ctx.fillRect(x + enemy.w - 16, enemy.y + 12, 6, 6);

    ctx.fillStyle = '#3d1d1d';
    ctx.fillRect(x, enemy.y - 10, enemy.w, 6);
    ctx.fillStyle = '#ff5a5a';
    ctx.fillRect(x, enemy.y - 10, (enemy.health / enemy.maxHealth) * enemy.w, 6);
  });

  if (boss.alive) {
    const x = boss.x - camera.x;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 14, boss.y + boss.h + 8, boss.w - 28, 8);

    ctx.fillStyle = boss.hitTimer > 0 ? '#d7b5ff' : '#9f7cff';
    ctx.fillRect(x, boss.y, boss.w, boss.h);

    ctx.fillStyle = '#2d183f';
    ctx.fillRect(x + 18, boss.y + 18, boss.w - 36, 30);
    ctx.fillStyle = '#f5d8ff';
    ctx.fillRect(x + 22, boss.y + 24, 12, 12);
    ctx.fillRect(x + boss.w - 34, boss.y + 24, 12, 12);

    ctx.fillStyle = '#2a173d';
    ctx.fillRect(x, boss.y - 14, boss.w, 8);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x, boss.y - 14, (boss.health / boss.maxHealth) * boss.w, 8);
  }
}

function drawPlayer() {
  const px = player.x - camera.x;
  const py = player.y;

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(px + 4, py + player.h + 5, player.w - 8, 6);

  ctx.fillStyle = player.invuln > 0 ? '#f9f7b3' : '#dff7ff';
  ctx.fillRect(px + 10, py + 8, player.w - 20, 18);
  ctx.fillStyle = '#89c5ff';
  ctx.fillRect(px + 12, py + 26, player.w - 24, player.h - 26);

  ctx.fillStyle = '#d9edff';
  ctx.fillRect(px + 6, py + 6, 8, 8);
  ctx.fillRect(px + player.w - 14, py + 6, 8, 8);

  ctx.fillStyle = '#f1f7ff';
  ctx.fillRect(px + 10, py + 2, player.w - 20, 10);

  if (player.attackBox && player.attackTimer > 0) {
    const x = player.attackBox.x - camera.x;
    const y = player.attackBox.y;
    const swordX = player.facing > 0 ? x + player.attackBox.w - 10 : x + 10;
    const swordY = y + 12;

    ctx.strokeStyle = player.combo === 3 ? 'rgba(255, 130, 210, 0.95)' : 'rgba(255, 220, 120, 0.9)';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, player.attackBox.w, player.attackBox.h);

    ctx.fillStyle = 'rgba(255, 220, 120, 0.18)';
    ctx.fillRect(x, y, player.attackBox.w, player.attackBox.h);

    ctx.fillStyle = '#d8e8ff';
    ctx.fillRect(swordX - 4, swordY, 8, 56);
    ctx.fillStyle = '#b9d7ff';
    ctx.fillRect(swordX - 12, swordY - 6, 24, 12);
    ctx.fillStyle = '#f5d08b';
    ctx.fillRect(swordX - 2, swordY - 14, 4, 20);
  }
}

function drawHudText() {
  ctx.fillStyle = 'rgba(9, 18, 28, 0.7)';
  ctx.fillRect(18, 18, 240, 62);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '18px Arial';
  ctx.fillText('HP', 30, 42);
  ctx.fillStyle = '#ff6060';
  ctx.fillRect(80, 28, 160, 16);
  ctx.fillStyle = '#6dfb87';
  ctx.fillRect(80, 28, (player.health / player.maxHealth) * 160, 16);

  if (state.messageTimer > 0) {
    ctx.fillStyle = 'rgba(6, 16, 28, 0.8)';
    ctx.fillRect(canvas.width / 2 - 220, 28, 440, 42);
    ctx.fillStyle = '#eaf7ff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(state.message, canvas.width / 2 - 190, 56);
  }

  ctx.font = '16px Arial';
  ctx.fillStyle = '#dfeeff';
  const abilityList = [
    player.abilities.doubleJump ? 'Salto duplo' : '???',
    player.abilities.dash ? 'Dash' : '???',
    player.abilities.wallJump ? 'Pulo de parede' : '???',
  ];
  ctx.fillText(`Habilidades: ${abilityList.join(' | ')}`, 24, 86);
}

function drawGateArea() {
  const x = 3568 - camera.x;
  const y = 620;
  ctx.fillStyle = 'rgba(123, 102, 255, 0.18)';
  ctx.fillRect(x, y, 140, 140);

  ctx.fillStyle = 'rgba(177, 146, 255, 0.7)';
  ctx.fillRect(x + 26, y + 18, 88, 104);
  ctx.fillStyle = 'rgba(86, 47, 160, 0.7)';
  ctx.fillRect(x + 34, y + 25, 72, 90);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x + 58, y + 45, 24, 50);
}

function render() {
  drawBackground();

  for (const platform of level.platforms) {
    drawPlatform(platform);
  }

  for (const spike of level.spikes) {
    drawSpikes(spike);
  }

  for (const item of collectibles) {
    drawCollectible(item);
  }

  drawGateArea();
  drawEnemies();
  drawPlayer();
  drawHudText();

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Derrota', canvas.width / 2 - 110, canvas.height / 2 - 12);
  }

  if (state.victory) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9effb0';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Vitória!', canvas.width / 2 - 110, canvas.height / 2 - 12);
  }
}

resetStageBtn.addEventListener('click', () => {
  resetStage();
});

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
  pressed[event.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

setInterval(() => {
  Object.keys(pressed).forEach((key) => {
    pressed[key] = false;
  });
}, 16);

requestAnimationFrame(update);
render();

setInterval(() => {
  if (!state.gameOver && !state.victory) {
    render();
  }
}, 1000 / 60);
