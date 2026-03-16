(() => {
  "use strict";

  // ═══════════════════════════════════════════
  //  EQUIPMENT DEFINITIONS
  // ═══════════════════════════════════════════
  const EQUIPMENT = {
    basic_server:      { name:"Basic Server",      cat:"servers",  cost:500,   cpu:10,  ram:8,    storage:100,   bw:0,    power:50,  heat:30,  cooling:0,  powerCap:0,   bwCap:0,    cpuBoost:0,    maxConn:0,  abbr:"S1", color:"#2563eb", desc:"10 CPU · 8GB RAM" },
    pro_server:        { name:"Pro Server",        cat:"servers",  cost:1500,  cpu:30,  ram:32,   storage:500,   bw:0,    power:120, heat:70,  cooling:0,  powerCap:0,   bwCap:0,    cpuBoost:0,    maxConn:0,  abbr:"S2", color:"#1d4ed8", desc:"30 CPU · 32GB RAM" },
    enterprise_server: { name:"Enterprise Server", cat:"servers",  cost:4000,  cpu:80,  ram:128,  storage:2000,  bw:0,    power:250, heat:150, cooling:0,  powerCap:0,   bwCap:0,    cpuBoost:0,    maxConn:0,  abbr:"S3", color:"#1e40af", desc:"80 CPU · 128GB RAM" },
    quantum_core:      { name:"Quantum Core",      cat:"servers",  cost:12000, cpu:250, ram:512,  storage:10000, bw:0,    power:500, heat:300, cooling:0,  powerCap:0,   bwCap:0,    cpuBoost:0,    maxConn:0,  abbr:"QC", color:"#7c3aed", desc:"250 CPU · 512GB RAM" },
    switch:            { name:"Network Switch",    cat:"network",  cost:300,   cpu:0,   ram:0,    storage:0,     bw:0,    power:20,  heat:5,   cooling:0,  powerCap:0,   bwCap:1000, cpuBoost:0,    maxConn:4,  abbr:"SW", color:"#059669", desc:"+1000 Mbps · 4 ports" },
    firewall:          { name:"Firewall",          cat:"network",  cost:800,   cpu:0,   ram:0,    storage:0,     bw:0,    power:30,  heat:10,  cooling:0,  powerCap:0,   bwCap:0,    cpuBoost:0,    maxConn:0,  abbr:"FW", color:"#dc2626", desc:"Blocks DDoS attacks" },
    load_balancer:     { name:"Load Balancer",     cat:"network",  cost:2000,  cpu:0,   ram:0,    storage:0,     bw:0,    power:40,  heat:15,  cooling:0,  powerCap:0,   bwCap:500,  cpuBoost:0.20, maxConn:0,  abbr:"LB", color:"#ea580c", desc:"+20% CPU · +500 Mbps" },
    cooling_unit:      { name:"Cooling Unit",      cat:"infra",    cost:400,   cpu:0,   ram:0,    storage:0,     bw:0,    power:30,  heat:0,   cooling:200,powerCap:0,   bwCap:0,    cpuBoost:0,    maxConn:2,  abbr:"AC", color:"#0891b2", desc:"+200 cooling · 2 pipes" },
    power_supply:      { name:"Power Supply",      cat:"infra",    cost:500,   cpu:0,   ram:0,    storage:0,     bw:0,    power:0,   heat:10,  cooling:0,  powerCap:500, bwCap:0,    cpuBoost:0,    maxConn:4,  abbr:"PS", color:"#ca8a04", desc:"+500W · 4 outlets" },
    ups_battery:       { name:"UPS Battery",       cat:"infra",    cost:1200,  cpu:0,   ram:0,    storage:0,     bw:0,    power:10,  heat:5,   cooling:0,  powerCap:100, bwCap:0,    cpuBoost:0,    maxConn:2,  abbr:"UP", color:"#0d9488", desc:"Backup power · 2 outlets" },
  };

  const CATEGORIES = [
    { key:"servers", label:"SERVERS" },
    { key:"network", label:"NETWORKING" },
    { key:"infra",   label:"INFRASTRUCTURE" },
  ];

  const CABLE_TYPES = {
    power:   { name:"Power Cable",   cost:50,  color:"#f59e0b", sources:["power_supply","ups_battery"], targets:"any" },
    network: { name:"Network Cable", cost:30,  color:"#10b981", sources:["switch"],                     targets:["basic_server","pro_server","enterprise_server","quantum_core","firewall","load_balancer"] },
    cooling: { name:"Cooling Pipe",  cost:40,  color:"#06b6d4", sources:["cooling_unit"],               targets:["basic_server","pro_server","enterprise_server","quantum_core"] },
  };

  // ═══════════════════════════════════════════
  //  CLIENT DEFINITIONS
  // ═══════════════════════════════════════════
  const CLIENT_TEMPLATES = [
    { name:"ByteBlog",     desc:"Tech blogger going viral",                 tier:1, cpu:5,   ram:4,   storage:20,   bw:50,   pay:12,  sla:88 },
    { name:"PetPals",      desc:"Pet adoption startup",                     tier:1, cpu:8,   ram:4,   storage:30,   bw:80,   pay:16,  sla:85 },
    { name:"PortfolioPro", desc:"Designer portfolio platform",              tier:1, cpu:5,   ram:8,   storage:50,   bw:40,   pay:14,  sla:82 },
    { name:"DevDocs",      desc:"Open-source documentation hub",            tier:1, cpu:6,   ram:4,   storage:60,   bw:100,  pay:18,  sla:80 },
    { name:"FreshCart",     desc:"Growing online grocery store",             tier:2, cpu:20,  ram:16,  storage:100,  bw:200,  pay:40,  sla:92 },
    { name:"TaskFlow",     desc:"SaaS project management tool",             tier:2, cpu:25,  ram:32,  storage:150,  bw:250,  pay:60,  sla:92 },
    { name:"EduLearn",     desc:"Online learning platform",                 tier:2, cpu:18,  ram:16,  storage:300,  bw:300,  pay:50,  sla:90 },
    { name:"ChatVibe",     desc:"Real-time messaging app",                  tier:2, cpu:30,  ram:24,  storage:80,   bw:400,  pay:65,  sla:93 },
    { name:"PixelForge",   desc:"Indie game studio servers",                tier:3, cpu:60,  ram:32,  storage:200,  bw:800,  pay:140, sla:96, needsFirewall:true },
    { name:"ShopWave",     desc:"Major e-commerce platform",                tier:3, cpu:50,  ram:64,  storage:500,  bw:600,  pay:170, sla:95 },
    { name:"StreamFlow",   desc:"Video streaming service",                  tier:3, cpu:45,  ram:32,  storage:2000, bw:1500, pay:200, sla:95 },
    { name:"FragZone",     desc:"Competitive gaming community",             tier:3, cpu:70,  ram:64,  storage:300,  bw:1200, pay:190, sla:97, needsFirewall:true },
    { name:"NexaCorp",     desc:"Enterprise cloud solutions",               tier:4, cpu:150, ram:256, storage:5000, bw:2000, pay:480, sla:98, needsFirewall:true, needsLB:true },
    { name:"SecureBank",   desc:"Digital banking — max security",           tier:4, cpu:100, ram:128, storage:1000, bw:1000, pay:420, sla:99, needsFirewall:true, needsLB:true },
    { name:"MegaSocial",   desc:"Social media giant",                       tier:4, cpu:200, ram:512, storage:8000, bw:5000, pay:850, sla:98, needsFirewall:true, needsLB:true },
    { name:"GovCloud",     desc:"Government infra — max uptime",            tier:4, cpu:180, ram:256, storage:3000, bw:2000, pay:650, sla:99.5,needsFirewall:true, needsLB:true },
  ];

  const EXPANSION = [
    { w:10, h:7,  cost:0 },
    { w:12, h:8,  cost:3000 },
    { w:14, h:9,  cost:8000 },
    { w:16, h:10, cost:20000 },
    { w:18, h:12, cost:50000 },
    { w:20, h:14, cost:120000 },
  ];

  const TICK_MS = [0, 1000, 500, 200];
  const SPEED_LABELS = ["⏸ Paused","▶ 1x","▶▶ 2x","▶▶▶ 5x"];
  const POWER_COST = 0.03;
  const STAT_MULT = [1, 1.5, 2.0];
  const PWR_MULT  = [1, 1.25, 1.5];
  const CONN_BONUS = [0, 2, 4];

  // ═══════════════════════════════════════════
  //  GAME STATE
  // ═══════════════════════════════════════════
  const G = {
    money:5000, day:1, speed:0, reputation:0, expLevel:0,
    gridW:10, gridH:7,
    grid:[], placed:[], cables:[],
    activeClients:[], availableOffers:[], alerts:[],
    stats: { totalPower:0, usedPower:0, totalCooling:0, usedHeat:0, totalCPU:0, usedCPU:0, totalRAM:0, usedRAM:0, totalStorage:0, usedStorage:0, totalBW:0, usedBW:0, dailyRevenue:0, dailyCost:0, cpuBoost:0, hasFirewall:false, hasUPS:false, hasLB:false },
    // Interaction
    selectedEquip:null, cableMode:null, cableSource:null,
    sellMode:false, hoverCell:null, inspectedItem:null,
    particles:[], tickAcc:0,
    tutStep:-1, tutDone:false, offerTimer:0, eventTimer:0,
  };

  // ═══════════════════════════════════════════
  //  DOM REFS
  // ═══════════════════════════════════════════
  const $=id=>document.getElementById(id);
  const canvas=$("canvas"), ctx=canvas.getContext("2d");
  const dom = {
    moneyVal:$("money-val"), dayVal:$("day-val"), incomeVal:$("income-val"), repVal:$("rep-val"),
    speedBtn:$("speed-btn"), helpBtn:$("help-btn"),
    shopList:$("shop-list"), cableList:$("cable-list"),
    sellBtn:$("sell-mode-btn"), expandBtn:$("expand-btn"),
    clientOffers:$("client-offers"), clientActive:$("client-active"), activeCount:$("active-count"),
    alertsList:$("alerts-list"),
    equipPlaceholder:$("equip-placeholder"), equipInfo:$("equip-info"),
    modeBar:$("mode-bar"),
    powerFill:$("power-fill"), coolFill:$("cool-fill"), cpuFill:$("cpu-fill"), ramFill:$("ram-fill"), diskFill:$("disk-fill"), bwFill:$("bw-fill"),
    powerText:$("power-text"), coolText:$("cool-text"), cpuText:$("cpu-text"), ramText:$("ram-text"), diskText:$("disk-text"), bwText:$("bw-text"),
    welcomeOverlay:$("welcome-overlay"), newGameBtn:$("new-game-btn"), continueBtn:$("continue-btn"),
    tutOverlay:$("tutorial-overlay"), tutTitle:$("tut-title"), tutText:$("tut-text"), tutSkip:$("tut-skip"), tutNext:$("tut-next"),
    notifContainer:$("notif-container"), gridWrap:$("grid-wrap"),
  };
  const tabs=document.querySelectorAll(".tab"), tabContents=document.querySelectorAll(".tab-content");

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════
  function fmt(n){ if(n>=1e6)return(n/1e6).toFixed(1)+"M"; if(n>=1e4)return(n/1e3).toFixed(1)+"K"; return n.toLocaleString(); }
  function notify(m,t="info"){ const e=document.createElement("div"); e.className="notif "+t; e.textContent=m; dom.notifContainer.appendChild(e); setTimeout(()=>e.remove(),4000); }
  function addAlert(m,t="info"){ G.alerts.unshift({msg:m,type:t,day:G.day}); if(G.alerts.length>50)G.alerts.pop(); renderAlerts(); }
  function rand(a,b){return Math.random()*(b-a)+a;}
  function randInt(a,b){return Math.floor(rand(a,b+1));}
  function pick(a){return a[Math.floor(Math.random()*a.length)];}

  function getItemAt(x,y){ return (G.grid[y]&&G.grid[y][x])||null; }

  function effStat(item, key){
    const d=EQUIPMENT[item.type], lv=item.level||1;
    const m=STAT_MULT[lv-1], pm=PWR_MULT[lv-1];
    if(key==="power")return Math.floor(d.power*pm);
    if(key==="heat")return Math.floor(d.heat*pm);
    if(key==="maxConn")return d.maxConn+CONN_BONUS[lv-1];
    if(key==="powerCap")return Math.floor(d.powerCap*m);
    if(key==="cooling")return Math.floor(d.cooling*m);
    if(key==="bwCap")return Math.floor(d.bwCap*m);
    if(key==="cpuBoost")return d.cpuBoost*(lv===1?1:lv===2?1.3:1.6);
    return Math.floor((d[key]||0)*m);
  }

  function upgradeCost(item){
    const lv=item.level||1;
    if(lv>=3)return Infinity;
    return Math.floor(EQUIPMENT[item.type].cost*([0.6,0.8][lv-1]));
  }

  // ═══════════════════════════════════════════
  //  GRID SYSTEM
  // ═══════════════════════════════════════════
  function initGrid(){
    G.grid=[];
    for(let y=0;y<G.gridH;y++){G.grid[y]=[];for(let x=0;x<G.gridW;x++)G.grid[y][x]=null;}
    for(const p of G.placed) if(p.x<G.gridW&&p.y<G.gridH) G.grid[p.y][p.x]=p;
  }

  function expandGrid(){
    const nx=G.expLevel+1; if(nx>=EXPANSION.length)return;
    const e=EXPANSION[nx]; if(G.money<e.cost)return;
    G.money-=e.cost; G.expLevel=nx; G.gridW=e.w; G.gridH=e.h;
    initGrid(); resizeCanvas(); updateExpandBtn();
    notify("Expanded to "+e.w+"×"+e.h+"!","success"); addAlert("Room expanded to "+e.w+"×"+e.h,"success");
  }

  function placeEquipment(type,x,y){
    if(y>=G.gridH||x>=G.gridW||G.grid[y][x])return false;
    const d=EQUIPMENT[type]; if(G.money<d.cost)return false;
    G.money-=d.cost;
    const item={type,x,y,hp:100,level:1,powered:type==="power_supply",networked:false,cooled:false,active:type==="power_supply"};
    G.placed.push(item); G.grid[y][x]=item;
    recalcConnections(); recalcStats(); return true;
  }

  function sellItem(x,y){
    const item=getItemAt(x,y); if(!item)return false;
    const d=EQUIPMENT[item.type], refund=Math.floor(d.cost*0.5);
    G.money+=refund;
    G.cables=G.cables.filter(c=>!(c.fx===x&&c.fy===y)&&!(c.tx===x&&c.ty===y));
    G.placed=G.placed.filter(p=>p!==item); G.grid[y][x]=null;
    if(G.inspectedItem===item) clearInspect();
    recalcConnections(); recalcStats();
    notify("Sold "+d.name+" for $"+fmt(refund),"info"); return true;
  }

  // ═══════════════════════════════════════════
  //  CABLE SYSTEM
  // ═══════════════════════════════════════════
  function canConnect(cableType, srcItem, dstItem){
    const ct=CABLE_TYPES[cableType];
    if(!ct.sources.includes(srcItem.type))return "Invalid source for this cable type";
    if(ct.targets!=="any"&&!ct.targets.includes(dstItem.type))return "Can't connect this cable to "+EQUIPMENT[dstItem.type].name;
    if(srcItem===dstItem)return "Can't connect to self";
    const maxOut=effStat(srcItem,"maxConn");
    const curOut=G.cables.filter(c=>c.fx===srcItem.x&&c.fy===srcItem.y&&c.type===cableType).length;
    if(curOut>=maxOut)return "No free "+ct.name.toLowerCase()+" slots ("+curOut+"/"+maxOut+")";
    const dup=G.cables.some(c=>c.type===cableType&&c.fx===srcItem.x&&c.fy===srcItem.y&&c.tx===dstItem.x&&c.ty===dstItem.y);
    if(dup)return "Already connected";
    const alreadyHas=G.cables.some(c=>c.type===cableType&&c.tx===dstItem.x&&c.ty===dstItem.y);
    if(cableType==="power"&&alreadyHas)return "Already has a power connection";
    if(cableType==="network"&&alreadyHas)return "Already has a network connection";
    if(cableType==="cooling"&&alreadyHas)return "Already has a cooling connection";
    return null;
  }

  function addCable(type, srcItem, dstItem){
    const err=canConnect(type,srcItem,dstItem);
    if(err){notify(err,"warn");return false;}
    const ct=CABLE_TYPES[type];
    if(G.money<ct.cost){notify("Not enough funds for "+ct.name,"warn");return false;}
    G.money-=ct.cost;
    G.cables.push({type, fx:srcItem.x, fy:srcItem.y, tx:dstItem.x, ty:dstItem.y});
    recalcConnections(); recalcStats();
    notify("Connected "+ct.name,"success"); return true;
  }

  function recalcConnections(){
    for(const item of G.placed){
      item.powered=(item.type==="power_supply");
      item.networked=false;
      item.cooled=false;
    }
    for(const c of G.cables){
      if(c.type==="power"){
        const src=getItemAt(c.fx,c.fy), dst=getItemAt(c.tx,c.ty);
        if(src&&dst&&(src.type==="power_supply"||src.type==="ups_battery"))dst.powered=true;
      }
    }
    for(const c of G.cables){
      if(c.type==="network"){
        const src=getItemAt(c.fx,c.fy), dst=getItemAt(c.tx,c.ty);
        if(src&&dst&&src.powered) dst.networked=true;
      }
    }
    for(const c of G.cables){
      if(c.type==="cooling"){
        const src=getItemAt(c.fx,c.fy), dst=getItemAt(c.tx,c.ty);
        if(src&&dst&&src.powered) dst.cooled=true;
      }
    }
    for(const item of G.placed){
      const d=EQUIPMENT[item.type];
      if(d.cat==="servers") item.active=item.powered&&item.networked&&item.cooled&&item.hp>0;
      else if(item.type==="power_supply") item.active=item.hp>0;
      else item.active=item.powered&&item.hp>0;
    }
  }

  // ═══════════════════════════════════════════
  //  UPGRADE SYSTEM
  // ═══════════════════════════════════════════
  function upgradeItem(item){
    const lv=item.level||1; if(lv>=3)return;
    const cost=upgradeCost(item); if(G.money<cost)return;
    G.money-=cost; item.level=lv+1;
    recalcConnections(); recalcStats();
    notify("Upgraded "+EQUIPMENT[item.type].name+" to Lv."+item.level,"success");
    addAlert(EQUIPMENT[item.type].name+" upgraded to Lv."+item.level,"success");
    renderInspect(item);
  }

  // ═══════════════════════════════════════════
  //  RESOURCE CALCULATION
  // ═══════════════════════════════════════════
  function recalcStats(){
    const s=G.stats;
    s.totalPower=0;s.usedPower=0;s.totalCooling=0;s.usedHeat=0;
    s.totalCPU=0;s.totalRAM=0;s.totalStorage=0;s.totalBW=0;
    s.cpuBoost=0;s.hasFirewall=false;s.hasUPS=false;s.hasLB=false;

    for(const p of G.placed){
      if(!p.active&&p.type!=="power_supply")continue;
      s.totalPower+=effStat(p,"powerCap");
      s.usedPower+=effStat(p,"power");
      s.usedHeat+=effStat(p,"heat");
      s.totalCooling+=effStat(p,"cooling");
      if(p.active){
        s.totalCPU+=effStat(p,"cpu");
        s.totalRAM+=effStat(p,"ram");
        s.totalStorage+=effStat(p,"storage");
        s.totalBW+=effStat(p,"bwCap");
        s.cpuBoost+=effStat(p,"cpuBoost");
        if(p.type==="firewall")s.hasFirewall=true;
        if(p.type==="ups_battery")s.hasUPS=true;
        if(p.type==="load_balancer")s.hasLB=true;
      }
    }
    s.totalCPU=Math.floor(s.totalCPU*(1+s.cpuBoost));

    s.usedCPU=0;s.usedRAM=0;s.usedStorage=0;s.usedBW=0;s.dailyRevenue=0;
    for(const c of G.activeClients){
      s.usedCPU+=c.cpu; s.usedRAM+=c.ram; s.usedStorage+=c.storage; s.usedBW+=c.bw;
      s.dailyRevenue+=c.pay;
    }
    s.dailyCost=Math.round(s.usedPower*POWER_COST*100)/100;
  }

  // ═══════════════════════════════════════════
  //  CLIENT SYSTEM
  // ═══════════════════════════════════════════
  function generateOffers(){
    const maxTier=G.reputation<5?1:G.reputation<15?2:G.reputation<30?3:4;
    const pool=CLIENT_TEMPLATES.filter(t=>t.tier<=maxTier);
    const used=new Set(G.activeClients.map(c=>c.name));
    const avail=pool.filter(t=>!used.has(t.name)).sort(()=>Math.random()-0.5);
    G.availableOffers=[];
    for(let i=0;i<Math.min(3,avail.length);i++) G.availableOffers.push({...avail[i],satisfaction:100});
    renderClientOffers();
  }

  function canAcceptClient(c){
    const s=G.stats;
    if(s.usedCPU+c.cpu>s.totalCPU)return false;
    if(s.usedRAM+c.ram>s.totalRAM)return false;
    if(s.usedStorage+c.storage>s.totalStorage)return false;
    if(s.usedBW+c.bw>s.totalBW)return false;
    if(c.needsFirewall&&!s.hasFirewall)return false;
    if(c.needsLB&&!s.hasLB)return false;
    return true;
  }

  function acceptClient(i){
    if(i<0||i>=G.availableOffers.length)return;
    const c=G.availableOffers.splice(i,1)[0]; c.satisfaction=100;
    G.activeClients.push(c); recalcStats();
    renderClientOffers(); renderActiveClients();
    notify("Signed "+c.name+"! +$"+c.pay+"/day","success"); addAlert("New client: "+c.name,"success");
  }

  function dropClient(i){
    if(i<0||i>=G.activeClients.length)return;
    const c=G.activeClients.splice(i,1)[0];
    G.reputation=Math.max(0,G.reputation-2); recalcStats();
    renderActiveClients(); notify("Dropped "+c.name,"warn"); addAlert(c.name+" contract ended","warn");
  }

  // ═══════════════════════════════════════════
  //  SIMULATION
  // ═══════════════════════════════════════════
  function simulateTick(){
    G.day++;

    // Power overload
    if(G.stats.usedPower>G.stats.totalPower&&!G.stats.hasUPS){
      const servers=G.placed.filter(p=>p.active&&EQUIPMENT[p.type].cat==="servers");
      if(servers.length){
        const v=pick(servers); v.active=false; v.hp=Math.max(0,v.hp-15);
        recalcConnections();recalcStats();
        notify("⚡ "+EQUIPMENT[v.type].name+" shut down — no power!","danger");
        addAlert("Power overload! Server offline","danger");
      }
    }

    // Heat check
    if(G.stats.usedHeat>G.stats.totalCooling){
      for(const p of G.placed){
        if(p.active&&EQUIPMENT[p.type].cat==="servers"){
          p.hp-=3;
          if(p.hp<=0){p.active=false;p.hp=0;recalcConnections();recalcStats();
            notify("🔥 "+EQUIPMENT[p.type].name+" overheated!","danger");
            addAlert("Server overheated at ("+p.x+","+p.y+")","danger");
          }
        }
      }
    } else {
      for(const p of G.placed){
        if(p.hp<100)p.hp=Math.min(100,p.hp+0.5);
        if(!p.active&&p.hp>=80){recalcConnections();}
      }
    }

    // SLA
    const s=G.stats;
    const overloaded=s.usedCPU>s.totalCPU||s.usedRAM>s.totalRAM||s.usedStorage>s.totalStorage||s.usedBW>s.totalBW||s.usedPower>s.totalPower;
    for(let i=G.activeClients.length-1;i>=0;i--){
      const c=G.activeClients[i];
      if(overloaded) c.satisfaction=Math.max(0,c.satisfaction-2);
      else c.satisfaction=Math.min(100,c.satisfaction+0.3);
      if(c.satisfaction<55){
        G.activeClients.splice(i,1); G.reputation=Math.max(0,G.reputation-3); recalcStats();
        notify("😡 "+c.name+" left — SLA breach!","danger"); addAlert(c.name+" terminated (SLA breach)","danger");
      } else if(c.satisfaction<70&&Math.random()<0.06){
        notify("⚠ "+c.name+" is unhappy!","warn");
      }
    }

    // Revenue
    G.money+=s.dailyRevenue-s.dailyCost;
    if(G.activeClients.length>0&&!overloaded) G.reputation+=0.1;

    // Offer refresh
    G.offerTimer++;
    if(G.offerTimer>=25||G.availableOffers.length===0){G.offerTimer=0;generateOffers();}

    // Events
    G.eventTimer++;
    if(G.eventTimer>=12&&Math.random()<0.10){G.eventTimer=0;triggerEvent();}

    // Particles
    if(G.activeClients.length>0){
      const n=Math.min(G.activeClients.length*2,12);
      for(let i=0;i<n;i++) if(G.particles.length<100) spawnTrafficParticle();
    }

    recalcStats(); renderActiveClients();
  }

  // ═══════════════════════════════════════════
  //  EVENTS
  // ═══════════════════════════════════════════
  function triggerEvent(){
    if(!G.activeClients.length)return;
    const ev=pick(["ddos","ddos","spike","failure","failure"]);
    if(ev==="ddos"){
      if(G.stats.hasFirewall){
        notify("🛡 DDoS blocked by firewall!","success"); addAlert("DDoS blocked","success"); G.reputation+=1;
      } else {
        const c=pick(G.activeClients); c.satisfaction-=25;
        notify("🚨 DDoS on "+c.name+"! Need a firewall!","danger"); addAlert("DDoS hit "+c.name,"danger");
        for(let i=0;i<25;i++)spawnDDoSParticle();
      }
    } else if(ev==="spike"){
      const c=pick(G.activeClients); c.satisfaction-=8;
      notify("📈 Traffic spike on "+c.name+"!","warn"); addAlert(c.name+" traffic spike","warn");
    } else {
      const srv=G.placed.filter(p=>p.active&&EQUIPMENT[p.type].cat==="servers");
      if(srv.length){
        const v=pick(srv); v.hp-=45; if(v.hp<=0){v.hp=0;v.active=false;}
        recalcConnections();recalcStats();
        notify("💥 Hardware failure on "+EQUIPMENT[v.type].name+"!","danger");
        addAlert("Hardware failure at ("+v.x+","+v.y+")","danger");
      }
    }
  }

  // ═══════════════════════════════════════════
  //  PARTICLES
  // ═══════════════════════════════════════════
  function spawnTrafficParticle(){
    const side=randInt(0,3);
    let x,y;
    if(side===0){x=0;y=rand(0,G.gridH);}else if(side===1){x=G.gridW;y=rand(0,G.gridH);}
    else if(side===2){x=rand(0,G.gridW);y=0;}else{x=rand(0,G.gridW);y=G.gridH;}
    const tgts=G.placed.filter(p=>p.active&&EQUIPMENT[p.type].cat==="servers");
    if(!tgts.length)return;
    const t=pick(tgts);
    G.particles.push({x,y,tx:t.x+0.5,ty:t.y+0.5,speed:rand(0.03,0.08),color:pick(["#06b6d4","#10b981","#3b82f6","#8b5cf6"]),life:1,ddos:false});
  }
  function spawnDDoSParticle(){
    const side=randInt(0,3);let x,y;
    if(side===0){x=0;y=rand(0,G.gridH);}else if(side===1){x=G.gridW;y=rand(0,G.gridH);}
    else if(side===2){x=rand(0,G.gridW);y=0;}else{x=rand(0,G.gridW);y=G.gridH;}
    G.particles.push({x,y,tx:rand(0,G.gridW),ty:rand(0,G.gridH),speed:rand(0.06,0.15),color:"#ef4444",life:1,ddos:true});
  }
  function updateParticles(){
    for(let i=G.particles.length-1;i>=0;i--){
      const p=G.particles[i],dx=p.tx-p.x,dy=p.ty-p.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<0.2){G.particles.splice(i,1);continue;}
      p.x+=(dx/d)*p.speed*cellSize*0.05; p.y+=(dy/d)*p.speed*cellSize*0.05;
      p.life-=0.004; if(p.life<=0)G.particles.splice(i,1);
    }
  }

  // ═══════════════════════════════════════════
  //  CANVAS
  // ═══════════════════════════════════════════
  let cellSize=56;

  function resizeCanvas(){
    const w=dom.gridWrap.clientWidth-16, h=dom.gridWrap.clientHeight-32;
    cellSize=Math.min(Math.floor(w/G.gridW),Math.floor(h/G.gridH),64);
    cellSize=Math.max(cellSize,32);
    canvas.width=G.gridW*cellSize; canvas.height=G.gridH*cellSize;
  }

  function render(){
    const W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#0d1117";ctx.fillRect(0,0,W,H);

    // Grid lines
    ctx.strokeStyle="#1b2332";ctx.lineWidth=1;
    for(let x=0;x<=G.gridW;x++){ctx.beginPath();ctx.moveTo(x*cellSize+.5,0);ctx.lineTo(x*cellSize+.5,H);ctx.stroke();}
    for(let y=0;y<=G.gridH;y++){ctx.beginPath();ctx.moveTo(0,y*cellSize+.5);ctx.lineTo(W,y*cellSize+.5);ctx.stroke();}

    // Cables
    drawCables();

    // Equipment
    for(const p of G.placed) drawEquip(p);

    // Particles
    for(const p of G.particles){
      ctx.globalAlpha=p.life*0.7; ctx.fillStyle=p.color;
      ctx.shadowColor=p.color; ctx.shadowBlur=4;
      ctx.beginPath(); ctx.arc(p.x*cellSize,p.y*cellSize,p.ddos?3:2,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;

    // Hover
    drawHover();

    // Cable preview line
    if(G.cableMode&&G.cableSource&&G.hoverCell){
      const ct=CABLE_TYPES[G.cableMode];
      ctx.strokeStyle=ct.color; ctx.lineWidth=2; ctx.globalAlpha=0.5;
      ctx.setLineDash([6,4]);
      ctx.beginPath();
      ctx.moveTo((G.cableSource.x+.5)*cellSize,(G.cableSource.y+.5)*cellSize);
      ctx.lineTo((G.hoverCell.x+.5)*cellSize,(G.hoverCell.y+.5)*cellSize);
      ctx.stroke();
      ctx.setLineDash([]);ctx.globalAlpha=1;
    }
  }

  function drawCables(){
    const t=Date.now();
    for(const c of G.cables){
      const ct=CABLE_TYPES[c.type];
      const fx=(c.fx+.5)*cellSize, fy=(c.fy+.5)*cellSize;
      const tx=(c.tx+.5)*cellSize, ty=(c.ty+.5)*cellSize;
      const src=getItemAt(c.fx,c.fy);
      const active=src&&src.active;

      ctx.strokeStyle=ct.color;
      ctx.globalAlpha=active?0.5:0.15;
      ctx.lineWidth=c.type==="cooling"?3:2;
      if(!active)ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(tx,ty);ctx.stroke();
      ctx.setLineDash([]);ctx.globalAlpha=1;

      // Flow dots
      if(active){
        const len=Math.sqrt((tx-fx)**2+(ty-fy)**2);
        const dots=Math.max(1,Math.floor(len/40));
        for(let i=0;i<dots;i++){
          const phase=((t*0.001+i/dots)%1);
          const dx=fx+(tx-fx)*phase, dy=fy+(ty-fy)*phase;
          ctx.fillStyle=ct.color; ctx.globalAlpha=0.8;
          ctx.beginPath(); ctx.arc(dx,dy,2,0,Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha=1;
      }
    }
  }

  function drawEquip(item){
    const d=EQUIPMENT[item.type], lv=item.level||1;
    const x=item.x*cellSize, y=item.y*cellSize, pad=3, s=cellSize-pad*2;
    const dis=!item.active&&item.type!=="power_supply";

    // Background
    ctx.fillStyle=dis?"#2a2a2a":d.color;
    ctx.globalAlpha=dis?0.35:0.85;
    rRect(x+pad,y+pad,s,s,4,true,false);
    ctx.globalAlpha=1;

    // Border
    ctx.strokeStyle=dis?"#444":d.color; ctx.globalAlpha=dis?0.3:0.5; ctx.lineWidth=1;
    if(G.inspectedItem===item){ctx.strokeStyle="#fff";ctx.globalAlpha=0.9;ctx.lineWidth=2;}
    rRect(x+pad,y+pad,s,s,4,false,true);
    ctx.globalAlpha=1;

    // Abbr
    ctx.fillStyle="rgba(255,255,255,"+(dis?"0.2":"0.9")+")";
    ctx.font="bold "+Math.max(9,cellSize*0.22)+"px system-ui";
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(d.abbr,x+cellSize/2,y+cellSize/2-(lv>1?4:2));

    // Level badge
    if(lv>1){
      ctx.font="bold "+Math.max(7,cellSize*0.15)+"px system-ui";
      ctx.fillStyle=lv===2?"#f59e0b":"#8b5cf6";
      ctx.fillText("Lv"+lv,x+cellSize/2,y+cellSize/2+8);
    }

    // Equipment detail lines
    drawDetail(x+pad,y+pad,s,d.cat,dis);

    // HP bar
    if(d.cat==="servers"&&item.hp<100){
      const bw=s-4,bh=3,bx=x+pad+2,by=y+pad+s-6;
      ctx.fillStyle="rgba(0,0,0,0.4)";ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle=item.hp>60?"#10b981":item.hp>30?"#f59e0b":"#ef4444";
      ctx.fillRect(bx,by,bw*(item.hp/100),bh);
    }

    // Connection warning icons
    if(d.cat==="servers"&&item.type!=="power_supply"){
      const icons=[];
      if(!item.powered)icons.push({c:"#f59e0b",t:"⚡"});
      if(!item.networked)icons.push({c:"#10b981",t:"⇄"});
      if(!item.cooled)icons.push({c:"#06b6d4",t:"❄"});
      if(icons.length){
        ctx.font="bold "+Math.max(8,cellSize*0.18)+"px system-ui";
        for(let i=0;i<icons.length;i++){
          const blink=Math.sin(Date.now()*0.006)>0;
          ctx.fillStyle=blink?icons[i].c:"#555";
          ctx.fillText(icons[i].t,x+8+i*12,y+cellSize-5);
        }
      }
    } else if(d.cat!=="servers"&&item.type!=="power_supply"&&!item.powered){
      const blink=Math.sin(Date.now()*0.006)>0;
      ctx.font="bold "+Math.max(8,cellSize*0.18)+"px system-ui";
      ctx.fillStyle=blink?"#f59e0b":"#555";
      ctx.fillText("⚡",x+6,y+cellSize-5);
    }

    // Active LED
    if(d.cat==="servers"&&item.active){
      const on=Math.sin(Date.now()*0.005+item.x*3+item.y*7)>0;
      ctx.fillStyle=on?"#10b981":"#065f46";
      ctx.beginPath();ctx.arc(x+pad+6,y+pad+6,2,0,Math.PI*2);ctx.fill();
    }
  }

  function drawDetail(x,y,s,cat,dis){
    const a=dis?0.1:0.25;
    ctx.strokeStyle="rgba(255,255,255,"+a+")";ctx.lineWidth=1;
    if(cat==="servers"){
      for(let i=1;i<=3;i++){const ly=y+s*0.3+i*(s*0.14);ctx.beginPath();ctx.moveTo(x+4,ly);ctx.lineTo(x+s-4,ly);ctx.stroke();}
    } else if(cat==="network"){
      const cy=y+s-8;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x+s*0.2+i*(s*0.2),cy,2,0,Math.PI*2);ctx.stroke();}
    }
  }

  function drawHover(){
    if(!G.hoverCell)return;
    const{x,y}=G.hoverCell;

    if(G.selectedEquip&&!G.sellMode&&!G.cableMode){
      const ok=x<G.gridW&&y<G.gridH&&!G.grid[y][x]&&G.money>=EQUIPMENT[G.selectedEquip].cost;
      ctx.fillStyle=ok?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)";
      ctx.strokeStyle=ok?"#10b981":"#ef4444";ctx.lineWidth=2;
      ctx.fillRect(x*cellSize+1,y*cellSize+1,cellSize-2,cellSize-2);
      ctx.strokeRect(x*cellSize+1,y*cellSize+1,cellSize-2,cellSize-2);
      if(ok){ctx.globalAlpha=0.4;drawEquipBlock(x,y,EQUIPMENT[G.selectedEquip]);ctx.globalAlpha=1;}
    }

    if(G.sellMode){
      if(G.grid[y]&&G.grid[y][x]){
        ctx.strokeStyle="#ef4444";ctx.lineWidth=2;
        ctx.strokeRect(x*cellSize+1,y*cellSize+1,cellSize-2,cellSize-2);
        ctx.fillStyle="rgba(239,68,68,0.1)";
        ctx.fillRect(x*cellSize+1,y*cellSize+1,cellSize-2,cellSize-2);
      }
    }

    if(G.cableMode&&!G.cableSource){
      const item=getItemAt(x,y);
      if(item){
        const ct=CABLE_TYPES[G.cableMode];
        const valid=ct.sources.includes(item.type);
        ctx.strokeStyle=valid?ct.color:"#ef4444";ctx.lineWidth=2;
        ctx.strokeRect(x*cellSize+1,y*cellSize+1,cellSize-2,cellSize-2);
      }
    }

    if(G.cableMode&&G.cableSource){
      const item=getItemAt(x,y);
      if(item&&item!==getItemAt(G.cableSource.x,G.cableSource.y)){
        const src=getItemAt(G.cableSource.x,G.cableSource.y);
        const err=canConnect(G.cableMode,src,item);
        ctx.strokeStyle=err?"#ef4444":CABLE_TYPES[G.cableMode].color;ctx.lineWidth=2;
        ctx.strokeRect(x*cellSize+1,y*cellSize+1,cellSize-2,cellSize-2);
      }
    }
  }

  function drawEquipBlock(gx,gy,def){
    const x=gx*cellSize,y=gy*cellSize,pad=3,s=cellSize-pad*2;
    ctx.fillStyle=def.color;rRect(x+pad,y+pad,s,s,4,true,false);
    ctx.fillStyle="rgba(255,255,255,0.8)";
    ctx.font="bold "+Math.max(9,cellSize*0.22)+"px system-ui";
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(def.abbr,x+cellSize/2,y+cellSize/2);
  }

  function rRect(x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
    if(fill)ctx.fill();if(stroke)ctx.stroke();
  }

  // ═══════════════════════════════════════════
  //  UI UPDATES
  // ═══════════════════════════════════════════
  function updateUI(){
    const s=G.stats;
    dom.moneyVal.textContent="$"+fmt(Math.floor(G.money));
    dom.moneyVal.style.color=G.money<0?"#ef4444":"";
    dom.dayVal.textContent=G.day;
    const net=s.dailyRevenue-s.dailyCost;
    dom.incomeVal.textContent=(net>=0?"+$":"-$")+fmt(Math.abs(Math.round(net)))+"/d";
    dom.incomeVal.style.color=net>=0?"#10b981":"#ef4444";
    dom.repVal.textContent=Math.floor(G.reputation);

    updateBar(dom.powerFill,dom.powerText,s.usedPower,s.totalPower,"W");
    updateBar(dom.coolFill,dom.coolText,s.usedHeat,s.totalCooling,"");
    updateBar(dom.cpuFill,dom.cpuText,s.usedCPU,s.totalCPU,"");
    updateBar(dom.ramFill,dom.ramText,s.usedRAM,s.totalRAM," GB");
    updateBar(dom.diskFill,dom.diskText,s.usedStorage,s.totalStorage," GB");
    updateBar(dom.bwFill,dom.bwText,s.usedBW,s.totalBW," Mb");

    dom.speedBtn.textContent=SPEED_LABELS[G.speed];
    updateShopDisabled();
    updateExpandBtn();
    updateModeBar();
  }

  function updateBar(fill,text,used,total,unit){
    const pct=total>0?Math.min(used/total,1)*100:0;
    fill.style.width=pct+"%";
    fill.style.backgroundColor=pct<60?"#10b981":pct<85?"#f59e0b":"#ef4444";
    text.textContent=fmt(Math.round(used))+"/"+fmt(Math.round(total))+unit;
  }

  function updateShopDisabled(){
    dom.shopList.querySelectorAll(".shop-item").forEach(el=>{
      const t=el.dataset.type;
      if(t&&EQUIPMENT[t])el.classList.toggle("disabled",G.money<EQUIPMENT[t].cost);
    });
    dom.cableList.querySelectorAll(".cable-item").forEach(el=>{
      const t=el.dataset.cable;
      if(t&&CABLE_TYPES[t])el.classList.toggle("disabled",G.money<CABLE_TYPES[t].cost);
    });
  }

  function updateExpandBtn(){
    const nx=G.expLevel+1;
    if(nx>=EXPANSION.length){dom.expandBtn.textContent="⊞ MAX SIZE";dom.expandBtn.disabled=true;}
    else{dom.expandBtn.textContent="⊞ EXPAND — $"+fmt(EXPANSION[nx].cost);dom.expandBtn.disabled=G.money<EXPANSION[nx].cost;}
  }

  function updateModeBar(){
    if(G.sellMode) dom.modeBar.textContent="🗑 SELL MODE — Click equipment to sell (Esc to cancel)";
    else if(G.cableMode&&!G.cableSource) dom.modeBar.textContent="🔌 Click source "+CABLE_TYPES[G.cableMode].name.toUpperCase()+" equipment (Esc to cancel)";
    else if(G.cableMode&&G.cableSource) dom.modeBar.textContent="🔌 Click destination to connect "+CABLE_TYPES[G.cableMode].name+" (Esc to cancel)";
    else if(G.selectedEquip) dom.modeBar.textContent="Click grid to place "+EQUIPMENT[G.selectedEquip].name+" (Esc to cancel)";
    else dom.modeBar.textContent="Select equipment or cables from the shop";
  }

  // ═══════════════════════════════════════════
  //  SHOP
  // ═══════════════════════════════════════════
  function renderShop(){
    dom.shopList.innerHTML="";
    for(const cat of CATEGORIES){
      const div=document.createElement("div");div.className="shop-cat";
      const title=document.createElement("div");title.className="shop-cat-title";title.textContent=cat.label;div.appendChild(title);
      for(const[k,eq]of Object.entries(EQUIPMENT)){
        if(eq.cat!==cat.key)continue;
        const el=document.createElement("div");el.className="shop-item";el.dataset.type=k;
        el.innerHTML=`<div class="shop-item-icon" style="background:${eq.color}">${eq.abbr}</div><div class="shop-item-info"><div class="shop-item-name">${eq.name}</div><div class="shop-item-cost">$${fmt(eq.cost)}</div><div class="shop-item-desc">${eq.desc}</div></div>`;
        el.addEventListener("click",()=>selectEquip(k));
        div.appendChild(el);
      }
      dom.shopList.appendChild(div);
    }

    dom.cableList.innerHTML="";
    for(const[k,ct]of Object.entries(CABLE_TYPES)){
      const el=document.createElement("div");el.className="cable-item";el.dataset.cable=k;
      el.innerHTML=`<div class="cable-swatch" style="background:${ct.color}"></div><div class="cable-item-info"><div class="cable-item-name">${ct.name}</div><div class="cable-item-cost">$${ct.cost} each</div></div>`;
      el.addEventListener("click",()=>selectCable(k));
      dom.cableList.appendChild(el);
    }
  }

  function clearAllModes(){
    G.selectedEquip=null;G.cableMode=null;G.cableSource=null;G.sellMode=false;
    dom.sellBtn.classList.remove("active");
    document.querySelectorAll(".shop-item,.cable-item").forEach(e=>e.classList.remove("selected"));
    canvas.style.cursor="default";
  }

  function selectEquip(type){
    clearAllModes();
    if(G.selectedEquip===type){G.selectedEquip=null;return;}
    G.selectedEquip=type;
    dom.shopList.querySelectorAll(".shop-item").forEach(e=>e.classList.toggle("selected",e.dataset.type===type));
    canvas.style.cursor="crosshair";
  }

  function selectCable(type){
    clearAllModes();
    if(G.cableMode===type){G.cableMode=null;return;}
    G.cableMode=type;
    dom.cableList.querySelectorAll(".cable-item").forEach(e=>e.classList.toggle("selected",e.dataset.cable===type));
    canvas.style.cursor="pointer";
  }

  // ═══════════════════════════════════════════
  //  CLIENT RENDER
  // ═══════════════════════════════════════════
  function renderClientOffers(){
    dom.clientOffers.innerHTML="";
    for(let i=0;i<G.availableOffers.length;i++){
      const c=G.availableOffers[i],can=canAcceptClient(c);
      const card=document.createElement("div");card.className="client-card";
      let reqTags="";
      if(c.needsFirewall)reqTags+=`<span class="client-stat" style="color:${G.stats.hasFirewall?"#10b981":"#ef4444"}">🛡 Firewall</span>`;
      if(c.needsLB)reqTags+=`<span class="client-stat" style="color:${G.stats.hasLB?"#10b981":"#ef4444"}">⚖ Load Balancer</span>`;
      card.innerHTML=`<div class="client-name">${c.name}</div><div class="client-desc">${c.desc}</div>
        <div class="client-stats"><span class="client-stat">CPU <span>${c.cpu}</span></span><span class="client-stat">RAM <span>${c.ram}GB</span></span><span class="client-stat">Disk <span>${c.storage}GB</span></span><span class="client-stat">Net <span>${c.bw}Mb</span></span>${reqTags}</div>
        <div class="client-pay">+$${c.pay}/day</div>
        <button class="client-btn" ${can?"":"disabled"}>${can?"ACCEPT CONTRACT":"INSUFFICIENT RESOURCES"}</button>`;
      card.querySelector(".client-btn").addEventListener("click",()=>acceptClient(i));
      dom.clientOffers.appendChild(card);
    }
  }

  function renderActiveClients(){
    dom.clientActive.innerHTML="";
    dom.activeCount.textContent="("+G.activeClients.length+")";
    for(let i=0;i<G.activeClients.length;i++){
      const c=G.activeClients[i];
      const col=c.satisfaction>80?"#10b981":c.satisfaction>60?"#f59e0b":"#ef4444";
      const card=document.createElement("div");card.className="client-card";
      card.innerHTML=`<div class="client-name">${c.name} <span style="font-size:9px;color:${col}">${Math.round(c.satisfaction)}% SLA</span></div>
        <div class="client-sla-bar"><div class="client-sla-fill" style="width:${c.satisfaction}%;background:${col}"></div></div>
        <div class="client-stats"><span class="client-stat">CPU <span>${c.cpu}</span></span><span class="client-stat">RAM <span>${c.ram}GB</span></span><span class="client-stat">$${c.pay}/d</span></div>
        <button class="client-btn remove">DROP CLIENT</button>`;
      card.querySelector(".client-btn").addEventListener("click",()=>dropClient(i));
      dom.clientActive.appendChild(card);
    }
    renderClientOffers();
  }

  function renderAlerts(){
    dom.alertsList.innerHTML="";
    for(const a of G.alerts.slice(0,30)){
      const d=document.createElement("div");d.className="alert-item "+a.type;
      d.innerHTML=`<div>${a.msg}</div><div class="alert-time">Day ${a.day}</div>`;
      dom.alertsList.appendChild(d);
    }
  }

  // ═══════════════════════════════════════════
  //  EQUIPMENT INSPECT PANEL
  // ═══════════════════════════════════════════
  function inspectItem(item){
    G.inspectedItem=item;
    switchTab("equip");
    renderInspect(item);
  }

  function clearInspect(){
    G.inspectedItem=null;
    dom.equipInfo.classList.add("hidden");
    dom.equipPlaceholder.style.display="block";
  }

  function renderInspect(item){
    if(!item)return;
    const d=EQUIPMENT[item.type],lv=item.level||1;
    dom.equipPlaceholder.style.display="none";
    dom.equipInfo.classList.remove("hidden");

    const isServer=d.cat==="servers";
    const isPS=item.type==="power_supply";
    const uCost=upgradeCost(item);
    const canUp=lv<3&&G.money>=uCost;
    const sellVal=Math.floor(d.cost*0.5);

    const connOut=G.cables.filter(c=>c.fx===item.x&&c.fy===item.y).length;
    const maxOut=effStat(item,"maxConn");

    let statsHTML=`<div class="equip-stats-list">`;
    if(d.cpu)statsHTML+=`<div class="equip-stat-row"><span>CPU</span><span>${effStat(item,"cpu")}</span></div>`;
    if(d.ram)statsHTML+=`<div class="equip-stat-row"><span>RAM</span><span>${effStat(item,"ram")} GB</span></div>`;
    if(d.storage)statsHTML+=`<div class="equip-stat-row"><span>Storage</span><span>${effStat(item,"storage")} GB</span></div>`;
    if(d.powerCap)statsHTML+=`<div class="equip-stat-row"><span>Power Out</span><span>${effStat(item,"powerCap")}W</span></div>`;
    if(d.cooling)statsHTML+=`<div class="equip-stat-row"><span>Cooling</span><span>${effStat(item,"cooling")}</span></div>`;
    if(d.bwCap)statsHTML+=`<div class="equip-stat-row"><span>Bandwidth</span><span>${effStat(item,"bwCap")} Mbps</span></div>`;
    if(d.cpuBoost)statsHTML+=`<div class="equip-stat-row"><span>CPU Boost</span><span>+${Math.round(effStat(item,"cpuBoost")*100)}%</span></div>`;
    statsHTML+=`<div class="equip-stat-row"><span>Power Draw</span><span>${effStat(item,"power")}W</span></div>`;
    statsHTML+=`<div class="equip-stat-row"><span>Heat</span><span>${effStat(item,"heat")}</span></div>`;
    statsHTML+=`<div class="equip-stat-row"><span>HP</span><span>${Math.round(item.hp)}%</span></div>`;
    statsHTML+=`</div>`;

    let connHTML=`<div class="conn-list">`;
    if(isPS){
      connHTML+=`<div class="conn-status good">✓ Always powered</div>`;
    } else {
      connHTML+=`<div class="conn-status ${item.powered?"good":"bad"}">${item.powered?"✓":"✗"} Power</div>`;
    }
    if(isServer){
      connHTML+=`<div class="conn-status ${item.networked?"good":"bad"}">${item.networked?"✓":"✗"} Network</div>`;
      connHTML+=`<div class="conn-status ${item.cooled?"good":"bad"}">${item.cooled?"✓":"✗"} Cooling</div>`;
    }
    if(maxOut>0) connHTML+=`<div class="conn-count">Outgoing: ${connOut}/${maxOut} slots used</div>`;
    connHTML+=`</div>`;

    let actionsHTML=`<div class="equip-actions">`;
    if(lv<3) actionsHTML+=`<button class="equip-action-btn upgrade-btn" ${canUp?"":"disabled"} id="upgrade-btn">⬆ UPGRADE to Lv.${lv+1} — $${fmt(uCost)}</button>`;
    else actionsHTML+=`<button class="equip-action-btn upgrade-btn" disabled>MAX LEVEL</button>`;
    actionsHTML+=`<button class="equip-action-btn sell-btn" id="inspect-sell-btn">🗑 SELL — $${fmt(sellVal)}</button>`;
    actionsHTML+=`</div>`;

    dom.equipInfo.innerHTML=`<div class="equip-card">
      <div class="equip-header"><span class="equip-name">${d.name}</span><span class="equip-level ${lv===2?"lv2":lv===3?"lv3":""}">Lv.${lv}</span></div>
      ${statsHTML}${connHTML}${actionsHTML}</div>`;

    const upBtn=dom.equipInfo.querySelector("#upgrade-btn");
    if(upBtn) upBtn.addEventListener("click",()=>upgradeItem(item));
    dom.equipInfo.querySelector("#inspect-sell-btn").addEventListener("click",()=>{
      sellItem(item.x,item.y); clearInspect();
    });
  }

  function switchTab(name){
    tabs.forEach(t=>{t.classList.toggle("active",t.dataset.tab===name);});
    tabContents.forEach(tc=>{tc.classList.toggle("active",tc.id===name+"-tab");});
  }

  // ═══════════════════════════════════════════
  //  TUTORIAL
  // ═══════════════════════════════════════════
  const TUTORIAL=[
    {title:"Welcome!",text:"Welcome to DataCenter Tycoon! In this game, equipment must be physically connected with cables to function. You'll wire up power, network, and cooling to build a working data center."},
    {title:"Step 1: Power Supply",text:"Click the Power Supply ($500) in the Equipment shop, then click an empty grid cell to place it. Power Supplies are always active and provide electricity."},
    {title:"Step 2: Cooling & Network",text:"Place a Cooling Unit ($400) and a Network Switch ($300). They won't work yet — they need power cables!"},
    {title:"Step 3: Power Cables",text:"Click POWER CABLE in the Cables section. Click your Power Supply, then click the Cooling Unit to connect them. Do the same for the Switch. Equipment lights up when powered!"},
    {title:"Step 4: Place a Server",text:"Place a Basic Server ($500). Servers need ALL THREE connections to work: Power, Network, AND Cooling."},
    {title:"Step 5: Wire the Server",text:"Draw a Power Cable (Power Supply → Server), a Network Cable (Switch → Server), and a Cooling Pipe (Cooling Unit → Server). Watch for the connection indicators!"},
    {title:"Step 6: Accept a Client",text:"Your server is online! Go to the Clients tab and accept a contract. Bigger clients need more resources — and some require a Firewall or Load Balancer."},
    {title:"Step 7: Play!",text:"Press Space or click the speed button to unpause. Click equipment to inspect and upgrade it (Lv.1 → 2 → 3). Watch your resources, manage connections, and survive events. Good luck!"},
  ];

  function startTutorial(){G.tutStep=0;showTut();}
  function showTut(){
    if(G.tutStep<0||G.tutStep>=TUTORIAL.length){dom.tutOverlay.classList.remove("active");G.tutDone=true;return;}
    const s=TUTORIAL[G.tutStep];
    dom.tutTitle.textContent=s.title;dom.tutText.textContent=s.text;
    dom.tutOverlay.classList.add("active");
    dom.tutNext.textContent=G.tutStep===TUTORIAL.length-1?"Let's Go!":"Next →";
  }
  function nextTut(){G.tutStep++;if(G.tutStep>=TUTORIAL.length){dom.tutOverlay.classList.remove("active");G.tutDone=true;}else showTut();}

  // ═══════════════════════════════════════════
  //  INPUT
  // ═══════════════════════════════════════════
  canvas.addEventListener("mousemove",e=>{
    const r=canvas.getBoundingClientRect();
    const gx=Math.floor((e.clientX-r.left)/cellSize), gy=Math.floor((e.clientY-r.top)/cellSize);
    G.hoverCell=(gx>=0&&gx<G.gridW&&gy>=0&&gy<G.gridH)?{x:gx,y:gy}:null;
  });
  canvas.addEventListener("mouseleave",()=>{G.hoverCell=null;});

  canvas.addEventListener("click",e=>{
    if(!G.hoverCell)return;
    const{x,y}=G.hoverCell;

    // Sell mode
    if(G.sellMode){sellItem(x,y);return;}

    // Cable mode
    if(G.cableMode){
      const item=getItemAt(x,y);
      if(!G.cableSource){
        if(!item){notify("Click on a "+CABLE_TYPES[G.cableMode].sources.map(s=>EQUIPMENT[s].name).join(" or "),"warn");return;}
        if(!CABLE_TYPES[G.cableMode].sources.includes(item.type)){notify("Not a valid source for "+CABLE_TYPES[G.cableMode].name,"warn");return;}
        G.cableSource={x,y};
        canvas.style.cursor="crosshair";
        return;
      } else {
        if(!item){notify("Click on target equipment","warn");return;}
        const src=getItemAt(G.cableSource.x,G.cableSource.y);
        if(src) addCable(G.cableMode,src,item);
        G.cableSource=null;
        canvas.style.cursor="pointer";
        return;
      }
    }

    // Place mode
    if(G.selectedEquip){
      if(placeEquipment(G.selectedEquip,x,y)){
        notify("Placed "+EQUIPMENT[G.selectedEquip].name,"success");
      }
      return;
    }

    // Inspect mode
    const item=getItemAt(x,y);
    if(item){inspectItem(item);}
    else{clearInspect();}
  });

  canvas.addEventListener("contextmenu",e=>{
    e.preventDefault();
    if(G.cableMode||G.selectedEquip||G.sellMode){clearAllModes();clearInspect();return;}
    if(G.hoverCell){
      const item=getItemAt(G.hoverCell.x,G.hoverCell.y);
      if(item) sellItem(G.hoverCell.x,G.hoverCell.y);
    }
  });

  dom.speedBtn.addEventListener("click",()=>{G.speed=(G.speed+1)%4;});
  dom.sellBtn.addEventListener("click",()=>{
    const was=G.sellMode; clearAllModes();
    G.sellMode=!was; dom.sellBtn.classList.toggle("active",G.sellMode);
    canvas.style.cursor=G.sellMode?"not-allowed":"default";
  });
  dom.expandBtn.addEventListener("click",expandGrid);
  dom.helpBtn.addEventListener("click",()=>{G.tutStep=0;showTut();});
  dom.tutNext.addEventListener("click",nextTut);
  dom.tutSkip.addEventListener("click",()=>{dom.tutOverlay.classList.remove("active");G.tutDone=true;});

  tabs.forEach(tab=>tab.addEventListener("click",()=>switchTab(tab.dataset.tab)));

  window.addEventListener("resize",resizeCanvas);
  window.addEventListener("keydown",e=>{
    if(e.key==="Escape"){clearAllModes();clearInspect();}
    if(e.key===" "){e.preventDefault();G.speed=G.speed===0?1:0;}
    if(e.key==="1")G.speed=1;if(e.key==="2")G.speed=2;if(e.key==="3")G.speed=3;
  });

  // ═══════════════════════════════════════════
  //  SAVE / LOAD
  // ═══════════════════════════════════════════
  function saveGame(){
    localStorage.setItem("dc2_save",JSON.stringify({
      money:G.money,day:G.day,speed:G.speed,reputation:G.reputation,
      expLevel:G.expLevel,gridW:G.gridW,gridH:G.gridH,
      placed:G.placed.map(p=>({type:p.type,x:p.x,y:p.y,hp:p.hp,level:p.level})),
      cables:G.cables,activeClients:G.activeClients,tutDone:G.tutDone,offerTimer:G.offerTimer,
    }));
  }
  function loadGame(){
    const r=localStorage.getItem("dc2_save");if(!r)return false;
    try{
      const d=JSON.parse(r);
      G.money=d.money;G.day=d.day;G.speed=d.speed||0;G.reputation=d.reputation||0;
      G.expLevel=d.expLevel||0;G.gridW=d.gridW;G.gridH=d.gridH;
      G.placed=(d.placed||[]).map(p=>({...p,level:p.level||1,powered:false,networked:false,cooled:false,active:false}));
      G.cables=d.cables||[];G.activeClients=d.activeClients||[];
      G.tutDone=d.tutDone||false;G.offerTimer=d.offerTimer||0;
      initGrid();recalcConnections();recalcStats();return true;
    }catch(e){return false;}
  }
  setInterval(saveGame,30000);
  window.addEventListener("beforeunload",saveGame);

  // ═══════════════════════════════════════════
  //  GAME LOOP
  // ═══════════════════════════════════════════
  let lastFrame=0;
  function loop(ts){
    const dt=Math.min(ts-lastFrame,100);lastFrame=ts;
    if(G.speed>0){G.tickAcc+=dt;const r=TICK_MS[G.speed];while(G.tickAcc>=r){G.tickAcc-=r;simulateTick();}}
    updateParticles();render();updateUI();
    requestAnimationFrame(loop);
  }

  // ═══════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════
  function newGame(){
    G.money=5000;G.day=1;G.speed=0;G.reputation=0;G.expLevel=0;
    G.gridW=EXPANSION[0].w;G.gridH=EXPANSION[0].h;
    G.placed=[];G.cables=[];G.activeClients=[];G.availableOffers=[];G.alerts=[];G.particles=[];
    G.selectedEquip=null;G.cableMode=null;G.cableSource=null;G.sellMode=false;G.hoverCell=null;G.inspectedItem=null;
    G.tickAcc=0;G.offerTimer=0;G.eventTimer=0;G.tutStep=-1;G.tutDone=false;
    initGrid();recalcStats();resizeCanvas();renderShop();generateOffers();renderActiveClients();renderAlerts();
    dom.welcomeOverlay.classList.remove("active");
    startTutorial();
  }

  function continueGame(){
    if(loadGame()){resizeCanvas();renderShop();generateOffers();renderActiveClients();renderAlerts();dom.welcomeOverlay.classList.remove("active");}
  }

  const hasSave=!!localStorage.getItem("dc2_save");
  dom.continueBtn.style.display=hasSave?"inline-block":"none";
  dom.newGameBtn.addEventListener("click",newGame);
  dom.continueBtn.addEventListener("click",continueGame);

  initGrid();resizeCanvas();renderShop();
  requestAnimationFrame(loop);
})();
