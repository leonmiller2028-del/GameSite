(() => {
  "use strict";

  // ─── Canvas Setup ───
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // ─── DOM refs ───
  const startScreen = document.getElementById("start-screen");
  const gameoverScreen = document.getElementById("gameover-screen");
  const hud = document.getElementById("hud");
  const hudScore = document.getElementById("hud-score-val");
  const hudWave = document.getElementById("hud-wave-val");
  const hudLives = document.getElementById("hud-lives");
  const hudPowerup = document.getElementById("hud-powerup");
  const waveAnnounce = document.getElementById("wave-announce");
  const waveAnnounceNum = document.getElementById("wave-announce-num");
  const finalScore = document.getElementById("final-score");
  const finalWave = document.getElementById("final-wave");
  const startHighscore = document.getElementById("start-highscore");
  const gameoverHighscore = document.getElementById("gameover-highscore");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  // ─── Constants ───
  const TAU = Math.PI * 2;
  const PLAYER_RADIUS = 14;
  const PLAYER_SPEED = 4.5;
  const BULLET_SPEED = 10;
  const BULLET_RADIUS = 3;
  const STAR_COUNT = 200;
  const GRID_SPACING = 60;
  const INVULN_TIME = 2000;
  const POWERUP_DURATION = 8000;

  const ENEMY_TYPES = {
    drone:    { radius: 12, speed: 1.8, hp: 1, score: 100, color: "#f44" },
    tank:     { radius: 20, speed: 1.0, hp: 3, score: 250, color: "#f80" },
    speeder:  { radius: 10, speed: 3.5, hp: 1, score: 150, color: "#ff0" },
    shooter:  { radius: 15, speed: 1.2, hp: 2, score: 200, color: "#f0f" },
  };

  const POWERUP_TYPES = ["rapidfire", "spread", "shield"];
  const POWERUP_COLORS = { rapidfire: "#ff0", spread: "#0f0", shield: "#08f" };
  const POWERUP_LABELS = { rapidfire: "RAPID FIRE", spread: "SPREAD SHOT", shield: "SHIELD" };

  // ─── State ───
  let state = "menu";
  let score, wave, lives, player, bullets, enemies, particles, powerups, stars;
  let enemyBullets, screenShake, shakeTime;
  let fireTimer, fireRate, waveTimer, waveDelay, enemiesRemaining;
  let activePowerup, powerupTimer;
  let invulnTimer;
  let highscore = parseInt(localStorage.getItem("neonvoid_hs")) || 0;
  let mouseX = 0, mouseY = 0, mouseDown = false;
  let keys = {};
  let touchJoystick = null;
  let frameId;

  // ─── Stars (background) ───
  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function drawStars() {
    for (const s of stars) {
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = "#fff";
      ctx.fillRect(s.x, s.y, s.size, s.size);
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    }
    ctx.globalAlpha = 1;
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(0, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const offsetX = (player ? player.x * 0.05 : 0) % GRID_SPACING;
    const offsetY = (player ? player.y * 0.05 : 0) % GRID_SPACING;
    for (let x = -GRID_SPACING + offsetX; x < W + GRID_SPACING; x += GRID_SPACING) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = -GRID_SPACING + offsetY; y < H + GRID_SPACING; y += GRID_SPACING) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // ─── Particles ───
  function spawnParticles(x, y, color, count, speed = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * TAU;
      const v = Math.random() * speed + 1;
      particles.push({
        x, y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: 1,
        decay: Math.random() * 0.03 + 0.015,
        radius: Math.random() * 3 + 1,
        color,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ─── Player ───
  function initPlayer() {
    player = { x: W / 2, y: H / 2, angle: 0 };
    invulnTimer = INVULN_TIME;
  }

  function updatePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys["arrowleft"] || keys["a"]) dx -= 1;
    if (keys["arrowright"] || keys["d"]) dx += 1;
    if (keys["arrowup"] || keys["w"]) dy -= 1;
    if (keys["arrowdown"] || keys["s"]) dy += 1;

    if (touchJoystick) {
      dx = touchJoystick.dx;
      dy = touchJoystick.dy;
    }

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len; dy /= len;
      player.x += dx * PLAYER_SPEED;
      player.y += dy * PLAYER_SPEED;
    }

    player.x = Math.max(PLAYER_RADIUS, Math.min(W - PLAYER_RADIUS, player.x));
    player.y = Math.max(PLAYER_RADIUS, Math.min(H - PLAYER_RADIUS, player.y));

    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);

    if (invulnTimer > 0) invulnTimer -= dt;

    fireTimer -= dt;
    const rate = activePowerup === "rapidfire" ? fireRate * 0.35 : fireRate;
    const shouldFire = mouseDown || keys[" "];
    if (shouldFire && fireTimer <= 0) {
      fireTimer = rate;
      fireBullet();
    }
  }

  function fireBullet() {
    const a = player.angle;
    const spawn = (angle) => {
      bullets.push({
        x: player.x + Math.cos(angle) * 20,
        y: player.y + Math.sin(angle) * 20,
        vx: Math.cos(angle) * BULLET_SPEED,
        vy: Math.sin(angle) * BULLET_SPEED,
        life: 60,
      });
    };
    if (activePowerup === "spread") {
      spawn(a - 0.25);
      spawn(a);
      spawn(a + 0.25);
    } else {
      spawn(a);
    }
  }

  function drawPlayer() {
    const blinkOff = invulnTimer > 0 && Math.floor(invulnTimer / 80) % 2 === 0;
    if (blinkOff) return;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    if (activePowerup === "shield") {
      ctx.strokeStyle = "rgba(0, 150, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_RADIUS + 8, 0, TAU);
      ctx.stroke();
    }

    ctx.fillStyle = "#0ff";
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-12, -11);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 11);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Engine glow
    const flicker = 0.6 + Math.random() * 0.4;
    ctx.fillStyle = `rgba(0, 200, 255, ${flicker * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-12, -5);
    ctx.lineTo(-18 - Math.random() * 6, 0);
    ctx.lineTo(-12, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ─── Bullets ───
  function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > H + 50) {
        bullets.splice(i, 1);
      }
    }
  }

  function drawBullets() {
    ctx.fillStyle = "#0ff";
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 8;
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, BULLET_RADIUS, 0, TAU);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ─── Enemy Bullets ───
  function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const b = enemyBullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > H + 50) {
        enemyBullets.splice(i, 1);
        continue;
      }
      if (invulnTimer <= 0) {
        const dx = b.x - player.x;
        const dy = b.y - player.y;
        if (dx * dx + dy * dy < (PLAYER_RADIUS + 4) * (PLAYER_RADIUS + 4)) {
          enemyBullets.splice(i, 1);
          hitPlayer();
        }
      }
    }
  }

  function drawEnemyBullets() {
    ctx.fillStyle = "#f0f";
    ctx.shadowColor = "#f0f";
    ctx.shadowBlur = 6;
    for (const b of enemyBullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, TAU);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ─── Enemies ───
  function spawnEnemy(type) {
    const t = ENEMY_TYPES[type];
    let x, y;
    const side = Math.floor(Math.random() * 4);
    const margin = 40;
    if (side === 0) { x = -margin; y = Math.random() * H; }
    else if (side === 1) { x = W + margin; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = -margin; }
    else { x = Math.random() * W; y = H + margin; }

    enemies.push({
      x, y, type,
      radius: t.radius,
      speed: t.speed * (1 + wave * 0.05),
      hp: t.hp,
      maxHp: t.hp,
      color: t.color,
      score: t.score,
      shootTimer: type === "shooter" ? (1500 + Math.random() * 1000) : Infinity,
      angle: 0,
    });
  }

  function updateEnemies(dt) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      e.angle = Math.atan2(dy, dx);

      if (e.type === "speeder") {
        e.x += (dx / dist) * e.speed * 1.2;
        e.y += (dy / dist) * e.speed * 1.2;
      } else {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }

      if (e.type === "shooter") {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = 1200 + Math.random() * 800;
          const bulletSpeed = 4;
          enemyBullets.push({
            x: e.x, y: e.y,
            vx: (dx / dist) * bulletSpeed,
            vy: (dy / dist) * bulletSpeed,
            life: 120,
          });
        }
      }

      // Check collision with player
      if (invulnTimer <= 0) {
        const hitDist = PLAYER_RADIUS + e.radius;
        if (dist < hitDist) {
          spawnParticles(e.x, e.y, e.color, 15);
          enemies.splice(i, 1);
          enemiesRemaining--;
          hitPlayer();
          continue;
        }
      }

      // Check collision with bullets
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const bdx = b.x - e.x;
        const bdy = b.y - e.y;
        if (bdx * bdx + bdy * bdy < (BULLET_RADIUS + e.radius) * (BULLET_RADIUS + e.radius)) {
          bullets.splice(j, 1);
          e.hp--;
          spawnParticles(b.x, b.y, e.color, 5, 2);
          if (e.hp <= 0) {
            score += e.score;
            spawnParticles(e.x, e.y, e.color, 25, 5);
            triggerShake(4, 100);

            if (Math.random() < 0.08) spawnPowerup(e.x, e.y);

            enemies.splice(i, 1);
            enemiesRemaining--;
          }
          break;
        }
      }
    }
  }

  function drawEnemies() {
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;

      if (e.type === "drone") {
        ctx.beginPath();
        ctx.moveTo(e.radius, 0);
        ctx.lineTo(-e.radius * 0.7, -e.radius * 0.7);
        ctx.lineTo(-e.radius * 0.3, 0);
        ctx.lineTo(-e.radius * 0.7, e.radius * 0.7);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === "tank") {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (TAU / 6) * i;
          const r = e.radius;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        if (e.hp < e.maxHp) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fill();
          ctx.fillStyle = e.color;
          ctx.globalAlpha = 0.5;
          ctx.fillRect(-e.radius, e.radius + 5, (e.hp / e.maxHp) * e.radius * 2, 3);
          ctx.globalAlpha = 1;
        }
      } else if (e.type === "speeder") {
        ctx.beginPath();
        ctx.moveTo(e.radius, 0);
        ctx.lineTo(-e.radius, -e.radius * 0.5);
        ctx.lineTo(-e.radius, e.radius * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === "shooter") {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (TAU / 4) * i + Math.PI / 4;
          const r = e.radius;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ─── Powerups ───
  function spawnPowerup(x, y) {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    powerups.push({ x, y, type, life: 500, pulse: 0 });
  }

  function updatePowerups(dt) {
    if (activePowerup) {
      powerupTimer -= dt;
      if (powerupTimer <= 0) {
        activePowerup = null;
        hudPowerup.textContent = "";
      }
    }

    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.pulse += 0.05;
      p.life--;
      if (p.life <= 0) { powerups.splice(i, 1); continue; }

      const dx = p.x - player.x;
      const dy = p.y - player.y;
      if (dx * dx + dy * dy < (PLAYER_RADIUS + 16) * (PLAYER_RADIUS + 16)) {
        activePowerup = p.type;
        powerupTimer = POWERUP_DURATION;
        hudPowerup.textContent = POWERUP_LABELS[p.type];
        hudPowerup.style.color = POWERUP_COLORS[p.type];
        spawnParticles(p.x, p.y, POWERUP_COLORS[p.type], 20, 3);
        powerups.splice(i, 1);
      }
    }
  }

  function drawPowerups() {
    for (const p of powerups) {
      const r = 10 + Math.sin(p.pulse) * 3;
      ctx.fillStyle = POWERUP_COLORS[p.type];
      ctx.shadowColor = POWERUP_COLORS[p.type];
      ctx.shadowBlur = 15;
      ctx.globalAlpha = p.life < 100 ? p.life / 100 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.font = "bold 10px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = p.type === "rapidfire" ? "R" : p.type === "spread" ? "S" : "D";
      ctx.fillText(label, p.x, p.y);
      ctx.globalAlpha = 1;
    }
  }

  // ─── Wave System ───
  function startWave() {
    waveAnnounceNum.textContent = wave;
    waveAnnounce.classList.remove("hidden");
    setTimeout(() => waveAnnounce.classList.add("hidden"), 2000);

    const baseCount = 4 + wave * 2;
    enemiesRemaining = baseCount;
    let spawned = 0;
    const types = ["drone"];
    if (wave >= 2) types.push("speeder");
    if (wave >= 3) types.push("tank");
    if (wave >= 4) types.push("shooter");

    const spawnInterval = setInterval(() => {
      if (state !== "playing") { clearInterval(spawnInterval); return; }
      if (spawned >= baseCount) { clearInterval(spawnInterval); return; }
      const type = types[Math.floor(Math.random() * types.length)];
      spawnEnemy(type);
      spawned++;
    }, 600);
  }

  function checkWave(dt) {
    if (enemiesRemaining <= 0 && enemies.length === 0) {
      waveDelay -= dt;
      if (waveDelay <= 0) {
        wave++;
        hudWave.textContent = wave;
        waveDelay = 3000;
        startWave();
      }
    }
  }

  // ─── Damage ───
  function hitPlayer() {
    if (invulnTimer > 0) return;
    if (activePowerup === "shield") {
      activePowerup = null;
      powerupTimer = 0;
      hudPowerup.textContent = "";
      triggerShake(6, 200);
      spawnParticles(player.x, player.y, "#08f", 30, 4);
      invulnTimer = 500;
      return;
    }
    lives--;
    renderLives();
    triggerShake(10, 300);
    spawnParticles(player.x, player.y, "#0ff", 40, 5);
    if (lives <= 0) {
      gameOver();
    } else {
      invulnTimer = INVULN_TIME;
    }
  }

  // ─── Screen Shake ───
  function triggerShake(amount, duration) {
    screenShake = amount;
    shakeTime = duration;
  }

  function applyShake(dt) {
    if (shakeTime > 0) {
      shakeTime -= dt;
      const sx = (Math.random() - 0.5) * screenShake * 2;
      const sy = (Math.random() - 0.5) * screenShake * 2;
      ctx.translate(sx, sy);
      screenShake *= 0.95;
    }
  }

  // ─── HUD ───
  function renderLives() {
    hudLives.innerHTML = "";
    for (let i = 0; i < lives; i++) {
      const heart = document.createElement("span");
      heart.textContent = "♥";
      heart.style.color = "#0ff";
      heart.style.fontSize = "1.2rem";
      heart.style.textShadow = "0 0 8px rgba(0,255,255,0.6)";
      hudLives.appendChild(heart);
    }
  }

  function showHighscore() {
    const text = highscore > 0 ? `HIGH SCORE: ${highscore.toLocaleString()}` : "";
    startHighscore.textContent = text;
    gameoverHighscore.textContent = text;
  }

  // ─── Game Flow ───
  function startGame() {
    state = "playing";
    score = 0;
    wave = 1;
    lives = 3;
    bullets = [];
    enemies = [];
    particles = [];
    powerups = [];
    enemyBullets = [];
    screenShake = 0;
    shakeTime = 0;
    fireTimer = 0;
    fireRate = 150;
    waveDelay = 2000;
    enemiesRemaining = 0;
    activePowerup = null;
    powerupTimer = 0;

    initStars();
    initPlayer();
    renderLives();

    hudScore.textContent = "0";
    hudWave.textContent = "1";
    hudPowerup.textContent = "";

    startScreen.classList.remove("active");
    gameoverScreen.classList.remove("active");
    hud.classList.remove("hidden");
    waveAnnounce.classList.add("hidden");

    setTimeout(() => startWave(), 1500);
  }

  function gameOver() {
    state = "gameover";
    hud.classList.add("hidden");

    if (score > highscore) {
      highscore = score;
      localStorage.setItem("neonvoid_hs", highscore);
    }

    finalScore.textContent = score.toLocaleString();
    finalWave.textContent = wave;
    showHighscore();

    setTimeout(() => gameoverScreen.classList.add("active"), 600);
  }

  // ─── Main Loop ───
  let lastTime = 0;
  function gameLoop(timestamp) {
    const dt = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;

    ctx.clearRect(0, 0, W, H);

    ctx.save();
    if (state === "playing") applyShake(dt);

    drawStars();
    drawGrid();

    if (state === "playing") {
      updatePlayer(dt);
      updateBullets();
      updateEnemyBullets();
      updateEnemies(dt);
      updatePowerups(dt);
      updateParticles();
      checkWave(dt);

      hudScore.textContent = score.toLocaleString();

      drawPowerups();
      drawEnemyBullets();
      drawBullets();
      drawEnemies();
      drawPlayer();
      drawParticles();
    } else if (state === "gameover") {
      updateParticles();
      drawEnemyBullets();
      drawBullets();
      drawEnemies();
      drawParticles();
    } else {
      updateParticles();
      drawParticles();
    }

    ctx.restore();

    frameId = requestAnimationFrame(gameLoop);
  }

  // ─── Input ───
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === " ") e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener("mousedown", (e) => {
    if (e.button === 0) mouseDown = true;
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseDown = false;
  });

  // Touch support
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    if (t.clientX < W / 3) {
      touchJoystick = { id: t.identifier, sx: t.clientX, sy: t.clientY, dx: 0, dy: 0 };
    } else {
      mouseX = t.clientX;
      mouseY = t.clientY;
      mouseDown = true;
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (touchJoystick && t.identifier === touchJoystick.id) {
        const dx = t.clientX - touchJoystick.sx;
        const dy = t.clientY - touchJoystick.sy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const clamp = Math.min(len, 40) / 40;
        touchJoystick.dx = (dx / len) * clamp;
        touchJoystick.dy = (dy / len) * clamp;
      } else {
        mouseX = t.clientX;
        mouseY = t.clientY;
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    for (const t of e.changedTouches) {
      if (touchJoystick && t.identifier === touchJoystick.id) {
        touchJoystick = null;
      } else {
        mouseDown = false;
      }
    }
  });

  // ─── Buttons ───
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (state === "menu") startGame();
      else if (state === "gameover") startGame();
    }
  });

  // ─── Init ───
  initStars();
  particles = [];
  showHighscore();
  frameId = requestAnimationFrame(gameLoop);

  // Spawn some ambient particles on menu
  setInterval(() => {
    if (state === "menu") {
      spawnParticles(Math.random() * W, Math.random() * H, `hsl(${Math.random() * 60 + 170}, 100%, 60%)`, 3, 1);
    }
  }, 300);
})();
