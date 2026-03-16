(() => {
  "use strict";

  // ═══════════════════════════════════════════
  //  EQUIPMENT DEFINITIONS
  // ═══════════════════════════════════════════
  const EQUIPMENT = {
    basic_server:      { name: "Basic Server",      cat: "servers",  cost: 500,   cpu: 10,  ram: 8,    storage: 100,   bw: 0,    power: 50,  heat: 30,  cooling: 0, powerCap: 0,   bwCap: 0,    cpuBoost: 0,  abbr: "S1", color: "#2563eb", desc: "Entry-level. 10 CPU, 8 GB RAM" },
    pro_server:        { name: "Pro Server",        cat: "servers",  cost: 1500,  cpu: 30,  ram: 32,   storage: 500,   bw: 0,    power: 120, heat: 70,  cooling: 0, powerCap: 0,   bwCap: 0,    cpuBoost: 0,  abbr: "S2", color: "#1d4ed8", desc: "Mid-tier. 30 CPU, 32 GB RAM" },
    enterprise_server: { name: "Enterprise Server", cat: "servers",  cost: 4000,  cpu: 80,  ram: 128,  storage: 2000,  bw: 0,    power: 250, heat: 150, cooling: 0, powerCap: 0,   bwCap: 0,    cpuBoost: 0,  abbr: "S3", color: "#1e40af", desc: "High-end. 80 CPU, 128 GB RAM" },
    quantum_core:      { name: "Quantum Core",      cat: "servers",  cost: 12000, cpu: 250, ram: 512,  storage: 10000, bw: 0,    power: 500, heat: 300, cooling: 0, powerCap: 0,   bwCap: 0,    cpuBoost: 0,  abbr: "QC", color: "#7c3aed", desc: "Ultimate. 250 CPU, 512 GB RAM" },
    switch:            { name: "Network Switch",    cat: "network",  cost: 300,   cpu: 0,   ram: 0,    storage: 0,     bw: 0,    power: 20,  heat: 5,   cooling: 0, powerCap: 0,   bwCap: 1000, cpuBoost: 0,  abbr: "SW", color: "#059669", desc: "+1000 Mbps bandwidth" },
    firewall:          { name: "Firewall",          cat: "network",  cost: 800,   cpu: 0,   ram: 0,    storage: 0,     bw: 0,    power: 30,  heat: 10,  cooling: 0, powerCap: 0,   bwCap: 0,    cpuBoost: 0,  abbr: "FW", color: "#dc2626", desc: "Blocks DDoS attacks" },
    load_balancer:     { name: "Load Balancer",     cat: "network",  cost: 2000,  cpu: 0,   ram: 0,    storage: 0,     bw: 0,    power: 40,  heat: 15,  cooling: 0, powerCap: 0,   bwCap: 500,  cpuBoost: 0.20, abbr: "LB", color: "#ea580c", desc: "+20% effective CPU, +500 Mbps" },
    cooling_unit:      { name: "Cooling Unit",      cat: "infra",    cost: 400,   cpu: 0,   ram: 0,    storage: 0,     bw: 0,    power: 30,  heat: 0,   cooling: 200, powerCap: 0, bwCap: 0,    cpuBoost: 0,  abbr: "AC", color: "#0891b2", desc: "+200 cooling capacity" },
    power_supply:      { name: "Power Supply",      cat: "infra",    cost: 500,   cpu: 0,   ram: 0,    storage: 0,     bw: 0,    power: 0,   heat: 10,  cooling: 0, powerCap: 500, bwCap: 0,    cpuBoost: 0,  abbr: "PS", color: "#ca8a04", desc: "+500W power capacity" },
    ups_battery:       { name: "UPS Battery",       cat: "infra",    cost: 1200,  cpu: 0,   ram: 0,    storage: 0,     bw: 0,    power: 10,  heat: 5,   cooling: 0, powerCap: 100, bwCap: 0,    cpuBoost: 0,  abbr: "UP", color: "#0d9488", desc: "Backup power, prevents outages" },
  };

  const CATEGORIES = [
    { key: "servers", label: "SERVERS" },
    { key: "network", label: "NETWORKING" },
    { key: "infra",   label: "INFRASTRUCTURE" },
  ];

  // ═══════════════════════════════════════════
  //  CLIENT DEFINITIONS
  // ═══════════════════════════════════════════
  const CLIENT_TEMPLATES = [
    { name: "ByteBlog",     desc: "A tech blogger going viral",              tier: 1, cpu: 5,   ram: 4,   storage: 20,   bw: 50,   pay: 12,   sla: 85 },
    { name: "PetPals",      desc: "Pet adoption startup",                    tier: 1, cpu: 8,   ram: 4,   storage: 30,   bw: 80,   pay: 18,   sla: 85 },
    { name: "PortfolioPro", desc: "Designer portfolio platform",             tier: 1, cpu: 5,   ram: 8,   storage: 50,   bw: 40,   pay: 15,   sla: 80 },
    { name: "DevDocs",      desc: "Open-source documentation hub",           tier: 1, cpu: 6,   ram: 4,   storage: 60,   bw: 100,  pay: 20,   sla: 80 },
    { name: "FreshCart",     desc: "Growing online grocery store",            tier: 2, cpu: 20,  ram: 16,  storage: 100,  bw: 200,  pay: 45,   sla: 90 },
    { name: "TaskFlow",     desc: "SaaS project management tool",            tier: 2, cpu: 25,  ram: 32,  storage: 150,  bw: 250,  pay: 65,   sla: 90 },
    { name: "EduLearn",     desc: "Online learning platform",                tier: 2, cpu: 18,  ram: 16,  storage: 300,  bw: 300,  pay: 55,   sla: 88 },
    { name: "ChatVibe",     desc: "Real-time messaging app",                 tier: 2, cpu: 30,  ram: 24,  storage: 80,   bw: 400,  pay: 70,   sla: 92 },
    { name: "PixelForge",   desc: "Indie game studio servers",               tier: 3, cpu: 60,  ram: 32,  storage: 200,  bw: 800,  pay: 150,  sla: 95 },
    { name: "ShopWave",     desc: "Major e-commerce platform",               tier: 3, cpu: 50,  ram: 64,  storage: 500,  bw: 600,  pay: 180,  sla: 93 },
    { name: "StreamFlow",   desc: "Video streaming service",                 tier: 3, cpu: 45,  ram: 32,  storage: 2000, bw: 1500, pay: 220,  sla: 94 },
    { name: "FragZone",     desc: "Competitive gaming community",            tier: 3, cpu: 70,  ram: 64,  storage: 300,  bw: 1200, pay: 200,  sla: 96 },
    { name: "NexaCorp",     desc: "Enterprise cloud solutions",              tier: 4, cpu: 150, ram: 256, storage: 5000, bw: 2000, pay: 500,  sla: 98 },
    { name: "SecureBank",   desc: "Digital banking — firewall required",     tier: 4, cpu: 100, ram: 128, storage: 1000, bw: 1000, pay: 450,  sla: 99 },
    { name: "MegaSocial",   desc: "Social media giant",                      tier: 4, cpu: 200, ram: 512, storage: 8000, bw: 5000, pay: 900,  sla: 97 },
    { name: "GovCloud",     desc: "Government infrastructure — max uptime",  tier: 4, cpu: 180, ram: 256, storage: 3000, bw: 2000, pay: 700,  sla: 99.5 },
  ];

  const EXPANSION = [
    { w: 10, h: 7,  cost: 0 },
    { w: 12, h: 8,  cost: 3000 },
    { w: 14, h: 9,  cost: 8000 },
    { w: 16, h: 10, cost: 20000 },
    { w: 18, h: 12, cost: 50000 },
    { w: 20, h: 14, cost: 120000 },
  ];

  const TICK_MS = [0, 1000, 500, 200];
  const SPEED_LABELS = ["⏸ Paused", "▶ 1x", "▶▶ 2x", "▶▶▶ 5x"];
  const POWER_COST_PER_WATT = 0.02;

  // ═══════════════════════════════════════════
  //  GAME STATE
  // ═══════════════════════════════════════════
  const G = {
    money: 5000,
    day: 1,
    speed: 0,
    reputation: 0,
    expLevel: 0,
    gridW: 10,
    gridH: 7,
    grid: [],
    placed: [],
    activeClients: [],
    availableOffers: [],
    alerts: [],
    stats: { totalPower: 0, usedPower: 0, totalCooling: 0, usedHeat: 0, totalCPU: 0, usedCPU: 0, totalRAM: 0, usedRAM: 0, totalStorage: 0, usedStorage: 0, totalBW: 0, usedBW: 0, dailyRevenue: 0, dailyCost: 0, cpuBoost: 0, hasFirewall: false, hasUPS: false },
    selectedEquip: null,
    sellMode: false,
    hoverCell: null,
    particles: [],
    tickAcc: 0,
    tutStep: -1,
    tutDone: false,
    offerTimer: 0,
    eventTimer: 0,
  };

  // ═══════════════════════════════════════════
  //  DOM REFERENCES
  // ═══════════════════════════════════════════
  const $ = (id) => document.getElementById(id);
  const canvas = $("canvas");
  const ctx = canvas.getContext("2d");

  const dom = {
    moneyVal: $("money-val"), dayVal: $("day-val"), incomeVal: $("income-val"), repVal: $("rep-val"),
    speedBtn: $("speed-btn"), helpBtn: $("help-btn"),
    shopList: $("shop-list"), sellBtn: $("sell-mode-btn"), expandBtn: $("expand-btn"),
    clientOffers: $("client-offers"), clientActive: $("client-active"), activeCount: $("active-count"),
    alertsList: $("alerts-list"),
    powerFill: $("power-fill"), coolFill: $("cool-fill"), cpuFill: $("cpu-fill"), ramFill: $("ram-fill"), diskFill: $("disk-fill"), bwFill: $("bw-fill"),
    powerText: $("power-text"), coolText: $("cool-text"), cpuText: $("cpu-text"), ramText: $("ram-text"), diskText: $("disk-text"), bwText: $("bw-text"),
    welcomeOverlay: $("welcome-overlay"), newGameBtn: $("new-game-btn"), continueBtn: $("continue-btn"),
    tutOverlay: $("tutorial-overlay"), tutTitle: $("tut-title"), tutText: $("tut-text"), tutSkip: $("tut-skip"), tutNext: $("tut-next"),
    notifContainer: $("notif-container"),
    gridWrap: $("grid-wrap"),
  };

  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  // ═══════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════
  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  }

  function notify(msg, type = "info") {
    const el = document.createElement("div");
    el.className = "notif " + type;
    el.textContent = msg;
    dom.notifContainer.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function addAlert(msg, type = "info") {
    G.alerts.unshift({ msg, type, day: G.day });
    if (G.alerts.length > 50) G.alerts.pop();
    renderAlerts();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ═══════════════════════════════════════════
  //  GRID SYSTEM
  // ═══════════════════════════════════════════
  function initGrid() {
    G.grid = [];
    for (let y = 0; y < G.gridH; y++) {
      G.grid[y] = [];
      for (let x = 0; x < G.gridW; x++) {
        G.grid[y][x] = null;
      }
    }
    for (const p of G.placed) {
      if (p.x < G.gridW && p.y < G.gridH) {
        G.grid[p.y][p.x] = p;
      }
    }
  }

  function expandGrid() {
    const next = G.expLevel + 1;
    if (next >= EXPANSION.length) return;
    const exp = EXPANSION[next];
    if (G.money < exp.cost) return;
    G.money -= exp.cost;
    G.expLevel = next;
    G.gridW = exp.w;
    G.gridH = exp.h;
    initGrid();
    resizeCanvas();
    updateExpandBtn();
    notify("Data center expanded to " + exp.w + "×" + exp.h + "!", "success");
    addAlert("Expanded to " + exp.w + "×" + exp.h, "success");
  }

  function placeEquipment(type, x, y) {
    if (y >= G.gridH || x >= G.gridW) return false;
    if (G.grid[y][x]) return false;
    const def = EQUIPMENT[type];
    if (G.money < def.cost) return false;
    G.money -= def.cost;
    const item = { type, x, y, hp: 100, active: true };
    G.placed.push(item);
    G.grid[y][x] = item;
    recalcStats();
    return true;
  }

  function sellEquipment(x, y) {
    const item = G.grid[y] && G.grid[y][x];
    if (!item) return false;
    const def = EQUIPMENT[item.type];
    const refund = Math.floor(def.cost * 0.5);
    G.money += refund;
    G.placed = G.placed.filter(p => p !== item);
    G.grid[y][x] = null;
    recalcStats();
    notify("Sold " + def.name + " for $" + fmt(refund), "info");
    return true;
  }

  // ═══════════════════════════════════════════
  //  RESOURCE CALCULATION
  // ═══════════════════════════════════════════
  function recalcStats() {
    const s = G.stats;
    s.totalPower = 0; s.usedPower = 0;
    s.totalCooling = 0; s.usedHeat = 0;
    s.totalCPU = 0; s.totalRAM = 0; s.totalStorage = 0; s.totalBW = 0;
    s.cpuBoost = 0; s.hasFirewall = false; s.hasUPS = false;

    for (const p of G.placed) {
      if (!p.active) continue;
      const d = EQUIPMENT[p.type];
      s.totalPower += d.powerCap;
      s.usedPower += d.power;
      s.totalCooling += d.cooling;
      s.usedHeat += d.heat;
      s.totalCPU += d.cpu;
      s.totalRAM += d.ram;
      s.totalStorage += d.storage;
      s.totalBW += d.bwCap;
      s.cpuBoost += d.cpuBoost;
      if (p.type === "firewall") s.hasFirewall = true;
      if (p.type === "ups_battery") s.hasUPS = true;
    }

    s.totalCPU = Math.floor(s.totalCPU * (1 + s.cpuBoost));

    s.usedCPU = 0; s.usedRAM = 0; s.usedStorage = 0; s.usedBW = 0;
    s.dailyRevenue = 0;
    for (const c of G.activeClients) {
      s.usedCPU += c.cpu;
      s.usedRAM += c.ram;
      s.usedStorage += c.storage;
      s.usedBW += c.bw;
      s.dailyRevenue += c.pay;
    }

    s.dailyCost = Math.round(s.usedPower * POWER_COST_PER_WATT * 100) / 100;
  }

  // ═══════════════════════════════════════════
  //  CLIENT SYSTEM
  // ═══════════════════════════════════════════
  function generateOffers() {
    const maxTier = G.reputation < 5 ? 1 : G.reputation < 15 ? 2 : G.reputation < 30 ? 3 : 4;
    const pool = CLIENT_TEMPLATES.filter(t => t.tier <= maxTier);
    const used = new Set(G.activeClients.map(c => c.name));
    const available = pool.filter(t => !used.has(t.name));
    G.availableOffers = [];
    const count = Math.min(3, available.length);
    const shuffled = available.sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const t = shuffled[i];
      G.availableOffers.push({ ...t, satisfaction: 100 });
    }
    renderClientOffers();
  }

  function acceptClient(idx) {
    if (idx < 0 || idx >= G.availableOffers.length) return;
    const c = G.availableOffers.splice(idx, 1)[0];
    c.satisfaction = 100;
    G.activeClients.push(c);
    recalcStats();
    renderClientOffers();
    renderActiveClients();
    notify("Signed " + c.name + "! +$" + c.pay + "/day", "success");
    addAlert("New client: " + c.name + " ($" + c.pay + "/d)", "success");
  }

  function dropClient(idx) {
    if (idx < 0 || idx >= G.activeClients.length) return;
    const c = G.activeClients.splice(idx, 1)[0];
    G.reputation = Math.max(0, G.reputation - 2);
    recalcStats();
    renderActiveClients();
    notify("Lost client: " + c.name, "danger");
    addAlert(c.name + " contract ended", "warn");
  }

  function canAcceptClient(c) {
    const s = G.stats;
    return (s.usedCPU + c.cpu <= s.totalCPU) &&
           (s.usedRAM + c.ram <= s.totalRAM) &&
           (s.usedStorage + c.storage <= s.totalStorage) &&
           (s.usedBW + c.bw <= s.totalBW);
  }

  // ═══════════════════════════════════════════
  //  SIMULATION TICK
  // ═══════════════════════════════════════════
  function simulateTick() {
    G.day++;

    // Power check
    if (G.stats.usedPower > G.stats.totalPower && !G.stats.hasUPS) {
      const overload = G.placed.filter(p => p.active && EQUIPMENT[p.type].cat === "servers");
      if (overload.length > 0) {
        const victim = pick(overload);
        victim.active = false;
        recalcStats();
        notify("⚡ " + EQUIPMENT[victim.type].name + " shut down — insufficient power!", "danger");
        addAlert("Power overload! Equipment offline", "danger");
      }
    }

    // Heat check — reactivate equipment if possible
    for (const p of G.placed) {
      if (!p.active && p.hp > 50) {
        p.active = true;
      }
    }
    recalcStats();

    if (G.stats.usedHeat > G.stats.totalCooling) {
      for (const p of G.placed) {
        if (p.active && EQUIPMENT[p.type].cat === "servers") {
          p.hp -= 2;
          if (p.hp <= 0) {
            p.active = false;
            p.hp = 0;
            recalcStats();
            notify("🔥 " + EQUIPMENT[p.type].name + " overheated and crashed!", "danger");
            addAlert("Server overheated at (" + p.x + "," + p.y + ")", "danger");
          }
        }
      }
    } else {
      for (const p of G.placed) {
        if (p.hp < 100) p.hp = Math.min(100, p.hp + 1);
        if (!p.active && p.hp >= 80) p.active = true;
      }
    }

    // Client SLA check
    const s = G.stats;
    const overloaded = s.usedCPU > s.totalCPU || s.usedRAM > s.totalRAM ||
                       s.usedStorage > s.totalStorage || s.usedBW > s.totalBW ||
                       s.usedPower > s.totalPower;

    for (let i = G.activeClients.length - 1; i >= 0; i--) {
      const c = G.activeClients[i];
      if (overloaded) {
        c.satisfaction = Math.max(0, c.satisfaction - 1.5);
      } else {
        c.satisfaction = Math.min(100, c.satisfaction + 0.5);
      }
      if (c.satisfaction < 50) {
        G.activeClients.splice(i, 1);
        G.reputation = Math.max(0, G.reputation - 3);
        recalcStats();
        notify("😡 " + c.name + " left due to poor service!", "danger");
        addAlert(c.name + " terminated contract (SLA breach)", "danger");
      } else if (c.satisfaction < 70 && Math.random() < 0.05) {
        notify("⚠ " + c.name + " is unhappy with service quality", "warn");
      }
    }

    // Revenue & costs
    const netIncome = s.dailyRevenue - s.dailyCost;
    G.money += netIncome;

    // Reputation gain
    if (G.activeClients.length > 0 && !overloaded) {
      G.reputation += 0.1;
    }

    // Offer refresh
    G.offerTimer++;
    if (G.offerTimer >= 30 || G.availableOffers.length === 0) {
      G.offerTimer = 0;
      generateOffers();
    }

    // Random events
    G.eventTimer++;
    if (G.eventTimer >= 15 && Math.random() < 0.08) {
      G.eventTimer = 0;
      triggerEvent();
    }

    // Spawn traffic particles
    if (G.activeClients.length > 0) {
      const intensity = Math.min(G.activeClients.length * 2, 15);
      for (let i = 0; i < intensity; i++) {
        if (G.particles.length < 120) spawnTrafficParticle();
      }
    }

    recalcStats();
    renderActiveClients();
  }

  // ═══════════════════════════════════════════
  //  EVENT SYSTEM
  // ═══════════════════════════════════════════
  function triggerEvent() {
    const events = ["ddos", "spike", "failure"];
    if (G.activeClients.length === 0) return;
    const ev = pick(events);

    if (ev === "ddos") {
      if (G.stats.hasFirewall) {
        notify("🛡 DDoS attack blocked by firewall!", "success");
        addAlert("DDoS attack blocked", "success");
        G.reputation += 1;
      } else {
        const c = pick(G.activeClients);
        c.satisfaction -= 20;
        notify("🚨 DDoS attack on " + c.name + "! Deploy a firewall!", "danger");
        addAlert("DDoS attack hit " + c.name, "danger");
        for (let i = 0; i < 30; i++) spawnDDoSParticle();
      }
    } else if (ev === "spike") {
      const c = pick(G.activeClients);
      notify("📈 Traffic spike on " + c.name + "!", "warn");
      addAlert(c.name + " experiencing traffic spike", "warn");
      c.satisfaction -= 5;
    } else if (ev === "failure") {
      const servers = G.placed.filter(p => p.active && EQUIPMENT[p.type].cat === "servers");
      if (servers.length > 0) {
        const s = pick(servers);
        s.hp -= 40;
        if (s.hp <= 0) { s.hp = 0; s.active = false; }
        recalcStats();
        notify("💥 Hardware failure on " + EQUIPMENT[s.type].name + "!", "danger");
        addAlert("Hardware failure at (" + s.x + "," + s.y + ")", "danger");
      }
    }
  }

  // ═══════════════════════════════════════════
  //  TRAFFIC PARTICLES
  // ═══════════════════════════════════════════
  function spawnTrafficParticle() {
    const side = randInt(0, 3);
    let x, y;
    if (side === 0) { x = 0; y = rand(0, G.gridH); }
    else if (side === 1) { x = G.gridW; y = rand(0, G.gridH); }
    else if (side === 2) { x = rand(0, G.gridW); y = 0; }
    else { x = rand(0, G.gridW); y = G.gridH; }

    const targets = G.placed.filter(p => p.active && EQUIPMENT[p.type].cat === "servers");
    if (targets.length === 0) return;
    const t = pick(targets);

    G.particles.push({
      x, y,
      tx: t.x + 0.5, ty: t.y + 0.5,
      speed: rand(0.03, 0.08),
      color: pick(["#06b6d4", "#10b981", "#3b82f6", "#8b5cf6"]),
      life: 1,
      type: "traffic",
    });
  }

  function spawnDDoSParticle() {
    const side = randInt(0, 3);
    let x, y;
    if (side === 0) { x = 0; y = rand(0, G.gridH); }
    else if (side === 1) { x = G.gridW; y = rand(0, G.gridH); }
    else if (side === 2) { x = rand(0, G.gridW); y = 0; }
    else { x = rand(0, G.gridW); y = G.gridH; }

    G.particles.push({
      x, y,
      tx: rand(0, G.gridW), ty: rand(0, G.gridH),
      speed: rand(0.05, 0.15),
      color: "#ef4444",
      life: 1,
      type: "ddos",
    });
  }

  function updateParticles() {
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const p = G.particles[i];
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.2) {
        G.particles.splice(i, 1);
        continue;
      }
      p.x += (dx / dist) * p.speed * cellSize * 0.05;
      p.y += (dy / dist) * p.speed * cellSize * 0.05;
      p.life -= 0.003;
      if (p.life <= 0) G.particles.splice(i, 1);
    }
  }

  // ═══════════════════════════════════════════
  //  CANVAS RENDERING
  // ═══════════════════════════════════════════
  let cellSize = 56;

  function resizeCanvas() {
    const wrap = dom.gridWrap;
    const maxW = wrap.clientWidth - 16;
    const maxH = wrap.clientHeight - 16;
    const cW = Math.floor(maxW / G.gridW);
    const cH = Math.floor(maxH / G.gridH);
    cellSize = Math.min(cW, cH, 64);
    cellSize = Math.max(cellSize, 32);
    canvas.width = G.gridW * cellSize;
    canvas.height = G.gridH * cellSize;
  }

  function render() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "#1b2332";
    ctx.lineWidth = 1;
    for (let x = 0; x <= G.gridW; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + 0.5, 0);
      ctx.lineTo(x * cellSize + 0.5, H);
      ctx.stroke();
    }
    for (let y = 0; y <= G.gridH; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize + 0.5);
      ctx.lineTo(W, y * cellSize + 0.5);
      ctx.stroke();
    }

    // Placed equipment
    for (const p of G.placed) {
      drawEquipment(p);
    }

    // Traffic particles
    for (const p of G.particles) {
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x * cellSize, p.y * cellSize, p.type === "ddos" ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Hover preview
    if (G.hoverCell && G.selectedEquip && !G.sellMode) {
      const { x, y } = G.hoverCell;
      const canPlace = x < G.gridW && y < G.gridH && !G.grid[y][x] && G.money >= EQUIPMENT[G.selectedEquip].cost;
      ctx.fillStyle = canPlace ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
      ctx.strokeStyle = canPlace ? "#10b981" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
      ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);

      if (canPlace) {
        const def = EQUIPMENT[G.selectedEquip];
        ctx.globalAlpha = 0.5;
        drawEquipBlock(x, y, def, 100);
        ctx.globalAlpha = 1;
      }
    }

    // Sell mode hover
    if (G.hoverCell && G.sellMode) {
      const { x, y } = G.hoverCell;
      if (G.grid[y] && G.grid[y][x]) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
        ctx.fillStyle = "rgba(239,68,68,0.1)";
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    }
  }

  function drawEquipment(item) {
    const def = EQUIPMENT[item.type];
    drawEquipBlock(item.x, item.y, def, item.hp, !item.active);
  }

  function drawEquipBlock(gx, gy, def, hp, disabled) {
    const x = gx * cellSize;
    const y = gy * cellSize;
    const pad = 3;
    const s = cellSize - pad * 2;

    // Background
    ctx.fillStyle = disabled ? "#2a2a2a" : def.color;
    ctx.globalAlpha = disabled ? 0.4 : 0.85;
    roundRect(x + pad, y + pad, s, s, 4, true, false);
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = disabled ? "#444" : def.color;
    ctx.globalAlpha = disabled ? 0.3 : 0.5;
    ctx.lineWidth = 1;
    roundRect(x + pad, y + pad, s, s, 4, false, true);
    ctx.globalAlpha = 1;

    // Icon based on category
    ctx.fillStyle = "rgba(255,255,255," + (disabled ? "0.2" : "0.9") + ")";
    ctx.font = "bold " + Math.max(9, cellSize * 0.22) + "px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(def.abbr, x + cellSize / 2, y + cellSize / 2 - 2);

    // Small details based on type
    drawEquipDetails(x + pad, y + pad, s, def.cat, disabled);

    // HP bar for servers
    if (def.cat === "servers" && hp < 100) {
      const barW = s - 4;
      const barH = 3;
      const barX = x + pad + 2;
      const barY = y + pad + s - 6;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(barX, barY, barW, barH);
      const hpColor = hp > 60 ? "#10b981" : hp > 30 ? "#f59e0b" : "#ef4444";
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barW * (hp / 100), barH);
    }

    // Blinking LED for active servers
    if (def.cat === "servers" && !disabled) {
      const ledOn = Math.sin(Date.now() * 0.005 + gx * 3 + gy * 7) > 0;
      ctx.fillStyle = ledOn ? "#10b981" : "#065f46";
      ctx.beginPath();
      ctx.arc(x + pad + 6, y + pad + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawEquipDetails(x, y, s, cat, disabled) {
    const alpha = disabled ? 0.15 : 0.3;
    ctx.strokeStyle = "rgba(255,255,255," + alpha + ")";
    ctx.lineWidth = 1;

    if (cat === "servers") {
      for (let i = 1; i <= 3; i++) {
        const ly = y + s * 0.3 + i * (s * 0.15);
        ctx.beginPath();
        ctx.moveTo(x + 4, ly);
        ctx.lineTo(x + s - 4, ly);
        ctx.stroke();
      }
    } else if (cat === "network") {
      const cy = y + s - 8;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + s * 0.2 + i * (s * 0.2), cy, 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (cat === "infra") {
      ctx.strokeStyle = "rgba(255,255,255," + alpha + ")";
      ctx.beginPath();
      ctx.moveTo(x + s * 0.3, y + s * 0.7);
      ctx.lineTo(x + s * 0.5, y + s * 0.3);
      ctx.lineTo(x + s * 0.7, y + s * 0.7);
      ctx.stroke();
    }
  }

  function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // ═══════════════════════════════════════════
  //  UI UPDATES
  // ═══════════════════════════════════════════
  function updateUI() {
    const s = G.stats;
    dom.moneyVal.textContent = "$" + fmt(Math.floor(G.money));
    dom.moneyVal.style.color = G.money < 0 ? "#ef4444" : "";
    dom.dayVal.textContent = G.day;
    const net = s.dailyRevenue - s.dailyCost;
    dom.incomeVal.textContent = (net >= 0 ? "+$" : "-$") + fmt(Math.abs(Math.round(net))) + "/d";
    dom.incomeVal.style.color = net >= 0 ? "#10b981" : "#ef4444";
    dom.repVal.textContent = Math.floor(G.reputation);

    updateResBar(dom.powerFill, dom.powerText, s.usedPower, s.totalPower, "W");
    updateResBar(dom.coolFill, dom.coolText, s.usedHeat, s.totalCooling, "");
    updateResBar(dom.cpuFill, dom.cpuText, s.usedCPU, s.totalCPU, "");
    updateResBar(dom.ramFill, dom.ramText, s.usedRAM, s.totalRAM, " GB");
    updateResBar(dom.diskFill, dom.diskText, s.usedStorage, s.totalStorage, " GB");
    updateResBar(dom.bwFill, dom.bwText, s.usedBW, s.totalBW, " Mb");

    dom.speedBtn.textContent = SPEED_LABELS[G.speed];
    updateShopAvailability();
  }

  function updateResBar(fillEl, textEl, used, total, unit) {
    const pct = total > 0 ? Math.min(used / total, 1) * 100 : 0;
    fillEl.style.width = pct + "%";
    fillEl.style.backgroundColor = pct < 60 ? "#10b981" : pct < 85 ? "#f59e0b" : "#ef4444";
    textEl.textContent = fmt(Math.round(used)) + "/" + fmt(Math.round(total)) + unit;
  }

  function updateShopAvailability() {
    const items = dom.shopList.querySelectorAll(".shop-item");
    items.forEach(el => {
      const type = el.dataset.type;
      if (type && EQUIPMENT[type]) {
        el.classList.toggle("disabled", G.money < EQUIPMENT[type].cost);
      }
    });
  }

  function updateExpandBtn() {
    const next = G.expLevel + 1;
    if (next >= EXPANSION.length) {
      dom.expandBtn.textContent = "⊞ MAX SIZE";
      dom.expandBtn.disabled = true;
    } else {
      const exp = EXPANSION[next];
      dom.expandBtn.textContent = "⊞ EXPAND — $" + fmt(exp.cost);
      dom.expandBtn.disabled = G.money < exp.cost;
    }
  }

  // ═══════════════════════════════════════════
  //  SHOP RENDERING
  // ═══════════════════════════════════════════
  function renderShop() {
    dom.shopList.innerHTML = "";
    for (const cat of CATEGORIES) {
      const div = document.createElement("div");
      div.className = "shop-cat";

      const title = document.createElement("div");
      title.className = "shop-cat-title";
      title.textContent = cat.label;
      div.appendChild(title);

      for (const [key, eq] of Object.entries(EQUIPMENT)) {
        if (eq.cat !== cat.key) continue;
        const item = document.createElement("div");
        item.className = "shop-item";
        item.dataset.type = key;

        item.innerHTML = `
          <div class="shop-item-icon" style="background:${eq.color}">${eq.abbr}</div>
          <div class="shop-item-info">
            <div class="shop-item-name">${eq.name}</div>
            <div class="shop-item-cost">$${fmt(eq.cost)}</div>
            <div class="shop-item-desc">${eq.desc}</div>
          </div>`;

        item.addEventListener("click", () => selectEquipment(key));
        div.appendChild(item);
      }
      dom.shopList.appendChild(div);
    }
  }

  function selectEquipment(type) {
    G.sellMode = false;
    dom.sellBtn.classList.remove("active");
    if (G.selectedEquip === type) {
      G.selectedEquip = null;
    } else {
      G.selectedEquip = type;
    }
    document.querySelectorAll(".shop-item").forEach(el => {
      el.classList.toggle("selected", el.dataset.type === G.selectedEquip);
    });
    canvas.style.cursor = G.selectedEquip ? "crosshair" : "default";
  }

  // ═══════════════════════════════════════════
  //  CLIENT RENDERING
  // ═══════════════════════════════════════════
  function renderClientOffers() {
    dom.clientOffers.innerHTML = "";
    for (let i = 0; i < G.availableOffers.length; i++) {
      const c = G.availableOffers[i];
      const can = canAcceptClient(c);
      const card = document.createElement("div");
      card.className = "client-card";
      card.innerHTML = `
        <div class="client-name">${c.name}</div>
        <div class="client-desc">${c.desc}</div>
        <div class="client-stats">
          <span class="client-stat">CPU <span>${c.cpu}</span></span>
          <span class="client-stat">RAM <span>${c.ram}GB</span></span>
          <span class="client-stat">Disk <span>${c.storage}GB</span></span>
          <span class="client-stat">Net <span>${c.bw}Mb</span></span>
        </div>
        <div class="client-pay">+$${c.pay}/day</div>
        <button class="client-btn" ${can ? "" : "disabled"}>
          ${can ? "ACCEPT CONTRACT" : "INSUFFICIENT RESOURCES"}
        </button>`;
      card.querySelector(".client-btn").addEventListener("click", () => acceptClient(i));
      dom.clientOffers.appendChild(card);
    }
  }

  function renderActiveClients() {
    dom.clientActive.innerHTML = "";
    dom.activeCount.textContent = "(" + G.activeClients.length + ")";
    for (let i = 0; i < G.activeClients.length; i++) {
      const c = G.activeClients[i];
      const card = document.createElement("div");
      card.className = "client-card";
      const slaColor = c.satisfaction > 80 ? "#10b981" : c.satisfaction > 60 ? "#f59e0b" : "#ef4444";
      card.innerHTML = `
        <div class="client-name">${c.name} <span style="font-size:9px;color:${slaColor}">${Math.round(c.satisfaction)}% SLA</span></div>
        <div class="client-sla-bar"><div class="client-sla-fill" style="width:${c.satisfaction}%;background:${slaColor}"></div></div>
        <div class="client-stats">
          <span class="client-stat">CPU <span>${c.cpu}</span></span>
          <span class="client-stat">RAM <span>${c.ram}GB</span></span>
          <span class="client-stat">$${c.pay}/d</span>
        </div>
        <button class="client-btn remove">DROP CLIENT</button>`;
      card.querySelector(".client-btn").addEventListener("click", () => dropClient(i));
      dom.clientActive.appendChild(card);
    }
    renderClientOffers();
  }

  function renderAlerts() {
    dom.alertsList.innerHTML = "";
    for (const a of G.alerts.slice(0, 30)) {
      const div = document.createElement("div");
      div.className = "alert-item " + a.type;
      div.innerHTML = `<div>${a.msg}</div><div class="alert-time">Day ${a.day}</div>`;
      dom.alertsList.appendChild(div);
    }
  }

  // ═══════════════════════════════════════════
  //  TUTORIAL
  // ═══════════════════════════════════════════
  const TUTORIAL = [
    { title: "Welcome!", text: "Welcome to DataCenter Tycoon! You've been given an empty server room and $5,000 to start your hosting empire. Let's set up your first server!" },
    { title: "Step 1: Power", text: "Every piece of equipment needs electricity. Click the Power Supply in the shop panel on the left, then click an empty cell on the grid to place it." },
    { title: "Step 2: Cooling", text: "Servers generate heat. Without cooling, they'll overheat and crash! Place a Cooling Unit from the shop." },
    { title: "Step 3: Network", text: "You need a Network Switch to provide bandwidth for your clients. Place one on the grid." },
    { title: "Step 4: Server", text: "Now place a Basic Server. This is where your clients' data will live and their applications will run." },
    { title: "Step 5: Clients", text: "Time to make money! Check the Clients panel on the right. Accept a contract to start earning daily revenue." },
    { title: "Step 6: Go!", text: "Hit the speed button (top right) to unpause the game. Watch your resources at the bottom — keep power, cooling, and capacity balanced. Expand your data center, accept bigger clients, and build an empire! Good luck!" },
  ];

  function startTutorial() {
    G.tutStep = 0;
    showTutStep();
  }

  function showTutStep() {
    if (G.tutStep < 0 || G.tutStep >= TUTORIAL.length) {
      dom.tutOverlay.classList.remove("active");
      G.tutDone = true;
      return;
    }
    const step = TUTORIAL[G.tutStep];
    dom.tutTitle.textContent = step.title;
    dom.tutText.textContent = step.text;
    dom.tutOverlay.classList.add("active");
    dom.tutNext.textContent = G.tutStep === TUTORIAL.length - 1 ? "Let's Go!" : "Next →";
  }

  function nextTutStep() {
    G.tutStep++;
    if (G.tutStep >= TUTORIAL.length) {
      dom.tutOverlay.classList.remove("active");
      G.tutDone = true;
    } else {
      showTutStep();
    }
  }

  // ═══════════════════════════════════════════
  //  INPUT HANDLING
  // ═══════════════════════════════════════════
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const gx = Math.floor(mx / cellSize);
    const gy = Math.floor(my / cellSize);
    if (gx >= 0 && gx < G.gridW && gy >= 0 && gy < G.gridH) {
      G.hoverCell = { x: gx, y: gy };
    } else {
      G.hoverCell = null;
    }
  });

  canvas.addEventListener("mouseleave", () => { G.hoverCell = null; });

  canvas.addEventListener("click", (e) => {
    if (!G.hoverCell) return;
    const { x, y } = G.hoverCell;

    if (G.sellMode) {
      sellEquipment(x, y);
      return;
    }

    if (G.selectedEquip) {
      if (placeEquipment(G.selectedEquip, x, y)) {
        notify("Placed " + EQUIPMENT[G.selectedEquip].name, "success");
      }
      return;
    }
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (G.selectedEquip) {
      G.selectedEquip = null;
      document.querySelectorAll(".shop-item").forEach(el => el.classList.remove("selected"));
      canvas.style.cursor = "default";
    } else if (G.hoverCell) {
      sellEquipment(G.hoverCell.x, G.hoverCell.y);
    }
  });

  dom.speedBtn.addEventListener("click", () => {
    G.speed = (G.speed + 1) % 4;
    dom.speedBtn.textContent = SPEED_LABELS[G.speed];
  });

  dom.sellBtn.addEventListener("click", () => {
    G.sellMode = !G.sellMode;
    G.selectedEquip = null;
    document.querySelectorAll(".shop-item").forEach(el => el.classList.remove("selected"));
    dom.sellBtn.classList.toggle("active", G.sellMode);
    canvas.style.cursor = G.sellMode ? "not-allowed" : "default";
  });

  dom.expandBtn.addEventListener("click", expandGrid);

  dom.helpBtn.addEventListener("click", () => {
    G.tutStep = 0;
    showTutStep();
  });

  dom.tutNext.addEventListener("click", nextTutStep);
  dom.tutSkip.addEventListener("click", () => {
    dom.tutOverlay.classList.remove("active");
    G.tutDone = true;
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.getElementById(target + "-tab").classList.add("active");
    });
  });

  window.addEventListener("resize", () => { resizeCanvas(); });

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      G.selectedEquip = null;
      G.sellMode = false;
      document.querySelectorAll(".shop-item").forEach(el => el.classList.remove("selected"));
      dom.sellBtn.classList.remove("active");
      canvas.style.cursor = "default";
    }
    if (e.key === " ") {
      e.preventDefault();
      G.speed = G.speed === 0 ? 1 : 0;
    }
    if (e.key === "1") G.speed = 1;
    if (e.key === "2") G.speed = 2;
    if (e.key === "3") G.speed = 3;
  });

  // ═══════════════════════════════════════════
  //  SAVE / LOAD
  // ═══════════════════════════════════════════
  function saveGame() {
    const data = {
      money: G.money,
      day: G.day,
      speed: G.speed,
      reputation: G.reputation,
      expLevel: G.expLevel,
      gridW: G.gridW,
      gridH: G.gridH,
      placed: G.placed.map(p => ({ type: p.type, x: p.x, y: p.y, hp: p.hp, active: p.active })),
      activeClients: G.activeClients,
      tutDone: G.tutDone,
      offerTimer: G.offerTimer,
    };
    localStorage.setItem("dc_tycoon_save", JSON.stringify(data));
  }

  function loadGame() {
    const raw = localStorage.getItem("dc_tycoon_save");
    if (!raw) return false;
    try {
      const d = JSON.parse(raw);
      G.money = d.money;
      G.day = d.day;
      G.speed = d.speed || 0;
      G.reputation = d.reputation || 0;
      G.expLevel = d.expLevel || 0;
      G.gridW = d.gridW;
      G.gridH = d.gridH;
      G.placed = d.placed || [];
      G.activeClients = d.activeClients || [];
      G.tutDone = d.tutDone || false;
      G.offerTimer = d.offerTimer || 0;
      initGrid();
      recalcStats();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Auto-save every 30 seconds
  setInterval(saveGame, 30000);
  window.addEventListener("beforeunload", saveGame);

  // ═══════════════════════════════════════════
  //  GAME LOOP
  // ═══════════════════════════════════════════
  let lastFrame = 0;

  function gameLoop(timestamp) {
    const dt = Math.min(timestamp - lastFrame, 100);
    lastFrame = timestamp;

    // Simulation ticks
    if (G.speed > 0) {
      G.tickAcc += dt;
      const tickRate = TICK_MS[G.speed];
      while (G.tickAcc >= tickRate) {
        G.tickAcc -= tickRate;
        simulateTick();
      }
    }

    updateParticles();
    render();
    updateUI();
    updateExpandBtn();

    requestAnimationFrame(gameLoop);
  }

  // ═══════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════
  function newGame() {
    G.money = 5000;
    G.day = 1;
    G.speed = 0;
    G.reputation = 0;
    G.expLevel = 0;
    G.gridW = EXPANSION[0].w;
    G.gridH = EXPANSION[0].h;
    G.placed = [];
    G.activeClients = [];
    G.availableOffers = [];
    G.alerts = [];
    G.particles = [];
    G.selectedEquip = null;
    G.sellMode = false;
    G.hoverCell = null;
    G.tickAcc = 0;
    G.offerTimer = 0;
    G.eventTimer = 0;
    G.tutStep = -1;
    G.tutDone = false;

    initGrid();
    recalcStats();
    resizeCanvas();
    renderShop();
    generateOffers();
    renderActiveClients();
    renderAlerts();

    dom.welcomeOverlay.classList.remove("active");
    startTutorial();
  }

  function continueGame() {
    if (loadGame()) {
      resizeCanvas();
      renderShop();
      generateOffers();
      renderActiveClients();
      renderAlerts();
      dom.welcomeOverlay.classList.remove("active");
    }
  }

  // Check for saved game
  const hasSave = !!localStorage.getItem("dc_tycoon_save");
  dom.continueBtn.style.display = hasSave ? "inline-block" : "none";

  dom.newGameBtn.addEventListener("click", newGame);
  dom.continueBtn.addEventListener("click", continueGame);

  // Start render loop (behind welcome screen)
  initGrid();
  resizeCanvas();
  renderShop();
  requestAnimationFrame(gameLoop);

})();
