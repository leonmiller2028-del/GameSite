import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════
const WX = 32, WY = 64, WZ = 32;
const CS = 16; // chunk size
const SURFACE = 56;
const GRAVITY = 22;
const JUMP_V = 8;
const REACH = 5;
const PW = 0.3, PH = 1.7; // player half-width, height

const B = { AIR:0, DIRT:1, STONE:2, COAL:3, IRON:4, GOLD:5, DIAMOND:6, EMERALD:7, RUBY:8, BEDROCK:9 };

const BDATA = {
  [B.DIRT]:    { name:"Dirt",    color:[0.55,0.35,0.15], hard:2,  val:0,   icon:"🟫" },
  [B.STONE]:   { name:"Stone",   color:[0.50,0.50,0.50], hard:4,  val:1,   icon:"⬜" },
  [B.COAL]:    { name:"Coal",    color:[0.20,0.20,0.20], hard:3,  val:5,   icon:"⬛" },
  [B.IRON]:    { name:"Iron",    color:[0.76,0.60,0.42], hard:6,  val:15,  icon:"🟧" },
  [B.GOLD]:    { name:"Gold",    color:[1.00,0.84,0.00], hard:10, val:50,  icon:"🟡" },
  [B.DIAMOND]: { name:"Diamond", color:[0.00,0.81,0.82], hard:15, val:200, icon:"💎" },
  [B.EMERALD]: { name:"Emerald", color:[0.31,0.78,0.47], hard:12, val:150, icon:"💚" },
  [B.RUBY]:    { name:"Ruby",    color:[0.88,0.07,0.37], hard:20, val:500, icon:"❤️" },
  [B.BEDROCK]: { name:"Bedrock", color:[0.10,0.10,0.10], hard:Infinity,val:0,icon:"🖤" },
};

const FACES = [
  { d:[1,0,0],  v:[[1,0,0],[1,1,0],[1,1,1],[1,0,0],[1,1,1],[1,0,1]] },
  { d:[-1,0,0], v:[[0,0,1],[0,1,1],[0,1,0],[0,0,1],[0,1,0],[0,0,0]] },
  { d:[0,1,0],  v:[[0,1,1],[1,1,1],[1,1,0],[0,1,1],[1,1,0],[0,1,0]] },
  { d:[0,-1,0], v:[[0,0,0],[1,0,0],[1,0,1],[0,0,0],[1,0,1],[0,0,1]] },
  { d:[0,0,1],  v:[[0,0,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1],[0,1,1]] },
  { d:[0,0,-1], v:[[1,0,0],[0,0,0],[0,1,0],[1,0,0],[0,1,0],[1,1,0]] },
];

const TOOLS = [
  { name:"Wood Pickaxe",    pow:1, spd:1.0, cost:0 },
  { name:"Stone Pickaxe",   pow:2, spd:1.3, cost:200 },
  { name:"Iron Pickaxe",    pow:3, spd:1.6, cost:800 },
  { name:"Gold Pickaxe",    pow:4, spd:2.0, cost:3000 },
  { name:"Diamond Pickaxe", pow:5, spd:2.5, cost:10000 },
  { name:"Quantum Drill",   pow:7, spd:3.5, cost:35000 },
];

const UPGRADES = [
  { id:"lamp2", name:"Headlamp Lv.2", desc:"+50% light", cost:500 },
  { id:"lamp3", name:"Headlamp Lv.3", desc:"+100% light", cost:2000 },
  { id:"boots", name:"Speed Boots",   desc:"+40% speed",  cost:600 },
];

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════
let world, chunks = {};
const player = {
  x: WX/2+0.5, y: SURFACE+1, z: WZ/2+0.5,
  vx:0, vy:0, vz:0,
  onGround: false,
  money: 0,
  tool: 0,
  upgrades: {},
  inventory: {},
};
let mining = { active:false, bx:0, by:0, bz:0, progress:0 };
let discovered = new Set(["Dirt","Stone"]);
let particles = [];
let shopOpen = false;
let locked = false;

// ═══════════════════════════════════════════
//  WORLD
// ═══════════════════════════════════════════
function idx(x,y,z){ return y*WX*WZ + z*WX + x; }
function getBlock(x,y,z){
  if(x<0||x>=WX||y<0||y>=WY||z<0||z>=WZ) return y<0?B.BEDROCK:B.AIR;
  return world[idx(x,y,z)];
}
function setBlock(x,y,z,t){
  if(x<0||x>=WX||y<0||y>=WY||z<0||z>=WZ) return;
  world[idx(x,y,z)]=t;
  markDirty(x,y,z);
}

function hash(x,y,z){
  let h = (x*374761393 + y*668265263 + z*1274126177)|0;
  h = ((h^(h>>13))*1103515245)|0;
  return ((h^(h>>16))>>>0)/4294967296;
}

function generateWorld(){
  world = new Uint8Array(WX*WY*WZ);
  for(let x=0;x<WX;x++) for(let z=0;z<WZ;z++) for(let y=0;y<WY;y++){
    if(y>=SURFACE){ world[idx(x,y,z)]=B.AIR; continue; }
    if(y===0){ world[idx(x,y,z)]=B.BEDROCK; continue; }
    const depth=SURFACE-y, r=hash(x,y,z);
    world[idx(x,y,z)] = pickOre(depth,r);
  }
  // Starting cave
  const cx=Math.floor(WX/2), cz=Math.floor(WZ/2);
  carve(cx-2,SURFACE-4,cz-2,5,4,5);
  // Entry ramp
  for(let d=0;d<6;d++) carve(cx-1,SURFACE-4-d,cz-1,3,3,3);
}

function pickOre(depth,r){
  if(depth<=3) return r<0.45?B.DIRT:B.STONE;
  if(depth<=10) return r<0.08?B.COAL:r<0.35?B.DIRT:B.STONE;
  if(depth<=20){
    if(r<0.07)return B.COAL; if(r<0.10)return B.IRON;
    return r<0.25?B.DIRT:B.STONE;
  }
  if(depth<=35){
    if(r<0.05)return B.COAL; if(r<0.08)return B.IRON; if(r<0.10)return B.GOLD;
    return B.STONE;
  }
  if(depth<=50){
    if(r<0.04)return B.COAL; if(r<0.07)return B.IRON; if(r<0.10)return B.GOLD;
    if(r<0.12)return B.DIAMOND; if(r<0.13)return B.EMERALD;
    return B.STONE;
  }
  // Deep
  if(r<0.03)return B.BEDROCK; if(r<0.07)return B.IRON; if(r<0.11)return B.GOLD;
  if(r<0.16)return B.DIAMOND; if(r<0.20)return B.EMERALD; if(r<0.23)return B.RUBY;
  return B.STONE;
}

function carve(x0,y0,z0,w,h,d){
  for(let x=x0;x<x0+w;x++) for(let y=y0;y<y0+h;y++) for(let z=z0;z<z0+d;z++){
    if(x>=0&&x<WX&&y>=0&&y<WY&&z>=0&&z<WZ) world[idx(x,y,z)]=B.AIR;
  }
}

// ═══════════════════════════════════════════
//  CHUNKS
// ═══════════════════════════════════════════
function chunkKey(cx,cy,cz){ return cx+","+cy+","+cz; }

function markDirty(wx,wy,wz){
  const cx=Math.floor(wx/CS), cy=Math.floor(wy/CS), cz=Math.floor(wz/CS);
  const k=chunkKey(cx,cy,cz); if(chunks[k])chunks[k].dirty=true;
  const lx=wx-cx*CS, ly=wy-cy*CS, lz=wz-cz*CS;
  if(lx===0)   { const k2=chunkKey(cx-1,cy,cz); if(chunks[k2])chunks[k2].dirty=true; }
  if(lx===CS-1){ const k2=chunkKey(cx+1,cy,cz); if(chunks[k2])chunks[k2].dirty=true; }
  if(ly===0)   { const k2=chunkKey(cx,cy-1,cz); if(chunks[k2])chunks[k2].dirty=true; }
  if(ly===CS-1){ const k2=chunkKey(cx,cy+1,cz); if(chunks[k2])chunks[k2].dirty=true; }
  if(lz===0)   { const k2=chunkKey(cx,cy,cz-1); if(chunks[k2])chunks[k2].dirty=true; }
  if(lz===CS-1){ const k2=chunkKey(cx,cy,cz+1); if(chunks[k2])chunks[k2].dirty=true; }
}

function buildChunk(cx,cy,cz){
  const pos=[],nrm=[],col=[];
  const x0=cx*CS, y0=cy*CS, z0=cz*CS;
  for(let lx=0;lx<CS;lx++) for(let ly=0;ly<CS;ly++) for(let lz=0;lz<CS;lz++){
    const wx=x0+lx, wy=y0+ly, wz=z0+lz;
    const b=getBlock(wx,wy,wz);
    if(b===B.AIR)continue;
    const c=BDATA[b]?.color||[0.5,0.5,0.5];
    for(const f of FACES){
      const nx=wx+f.d[0], ny=wy+f.d[1], nz=wz+f.d[2];
      if(getBlock(nx,ny,nz)!==B.AIR)continue;
      // Slight color variation
      const rv=hash(wx*7+f.d[0],wy*13+f.d[1],wz*19+f.d[2])*0.1-0.05;
      for(const v of f.v){
        pos.push(wx+v[0], wy+v[1], wz+v[2]);
        nrm.push(f.d[0], f.d[1], f.d[2]);
        col.push(
          Math.max(0,Math.min(1, c[0]+rv)),
          Math.max(0,Math.min(1, c[1]+rv)),
          Math.max(0,Math.min(1, c[2]+rv))
        );
      }
    }
  }
  const geo=new THREE.BufferGeometry();
  if(pos.length){
    geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute("normal",new THREE.Float32BufferAttribute(nrm,3));
    geo.setAttribute("color",new THREE.Float32BufferAttribute(col,3));
    geo.computeBoundingSphere();
  }
  return geo;
}

function initChunks(){
  const cxn=Math.ceil(WX/CS), cyn=Math.ceil(WY/CS), czn=Math.ceil(WZ/CS);
  for(let cx=0;cx<cxn;cx++) for(let cy=0;cy<cyn;cy++) for(let cz=0;cz<czn;cz++){
    const k=chunkKey(cx,cy,cz);
    const geo=buildChunk(cx,cy,cz);
    const mat=new THREE.MeshLambertMaterial({vertexColors:true});
    const mesh=new THREE.Mesh(geo,mat);
    scene.add(mesh);
    chunks[k]={mesh,dirty:false,cx,cy,cz};
  }
}

function rebuildDirty(){
  let rebuilt=0;
  for(const k in chunks){
    if(rebuilt>=3)break;
    const c=chunks[k];
    if(!c.dirty)continue;
    const geo=buildChunk(c.cx,c.cy,c.cz);
    c.mesh.geometry.dispose();
    c.mesh.geometry=geo;
    c.dirty=false;
    rebuilt++;
  }
}

// ═══════════════════════════════════════════
//  THREE.JS SCENE
// ═══════════════════════════════════════════
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setClearColor(0x0a0a1e);
document.getElementById("game").prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a1e, 0.035);

const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,100);

const hemiLight = new THREE.HemisphereLight(0x446688,0x111111,0.3);
scene.add(hemiLight);

const flashlight = new THREE.SpotLight(0xffffee,3,25,Math.PI/5,0.3,1);
flashlight.position.set(0,0,0);
flashlight.target.position.set(0,0,-1);
scene.add(flashlight);
scene.add(flashlight.target);

// Block highlight
const hlGeo = new THREE.BoxGeometry(1.005,1.005,1.005);
const hlEdges = new THREE.EdgesGeometry(hlGeo);
const hlMesh = new THREE.LineSegments(hlEdges, new THREE.LineBasicMaterial({color:0xffffff,opacity:0.5,transparent:true}));
hlMesh.visible=false;
scene.add(hlMesh);

// Controls
const controls = new PointerLockControls(camera, document.body);

window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

// ═══════════════════════════════════════════
//  RAYCASTING
// ═══════════════════════════════════════════
const raycaster = new THREE.Raycaster();
raycaster.far = REACH;
const center = new THREE.Vector2(0,0);

function getTargetBlock(){
  raycaster.setFromCamera(center,camera);
  const meshes = Object.values(chunks).map(c=>c.mesh).filter(m=>m.geometry.attributes.position);
  const hits = raycaster.intersectObjects(meshes);
  if(!hits.length)return null;
  const h=hits[0];
  const p=h.point.clone().sub(h.face.normal.clone().multiplyScalar(0.01));
  return {x:Math.floor(p.x),y:Math.floor(p.y),z:Math.floor(p.z)};
}

// ═══════════════════════════════════════════
//  PHYSICS
// ═══════════════════════════════════════════
const keys = {};
window.addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(e.code==="KeyE"&&(locked||shopOpen)){e.preventDefault();toggleShop();}
  if(e.code==="Escape"&&shopOpen){shopOpen=false;document.getElementById("shop-overlay").classList.add("hidden");}
});
window.addEventListener("keyup",e=>{ keys[e.code]=false; });

function collides(x,y,z){
  for(let bx=Math.floor(x-PW);bx<=Math.floor(x+PW);bx++)
    for(let by=Math.floor(y);by<=Math.floor(y+PH);by++)
      for(let bz=Math.floor(z-PW);bz<=Math.floor(z+PW);bz++)
        if(getBlock(bx,by,bz)!==B.AIR)return true;
  return false;
}

function movePlayer(dt){
  if(shopOpen)return;
  const speed = (keys["ShiftLeft"]?7:4.5) * (player.upgrades.boots?1.4:1);
  const fwd=new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
  const right=fwd.clone().cross(new THREE.Vector3(0,1,0));

  let mx=0,mz=0;
  if(keys["KeyW"]){mx+=fwd.x;mz+=fwd.z;}
  if(keys["KeyS"]){mx-=fwd.x;mz-=fwd.z;}
  if(keys["KeyA"]){mx-=right.x;mz-=right.z;}
  if(keys["KeyD"]){mx+=right.x;mz+=right.z;}
  const len=Math.sqrt(mx*mx+mz*mz);
  if(len>0){mx/=len;mz/=len;}
  mx*=speed*dt; mz*=speed*dt;

  // Move X
  if(!collides(player.x+mx,player.y,player.z)) player.x+=mx;
  // Move Z
  if(!collides(player.x,player.y,player.z+mz)) player.z+=mz;

  // Gravity
  player.vy -= GRAVITY*dt;
  const newY = player.y + player.vy*dt;
  if(!collides(player.x,newY,player.z)){
    player.y=newY; player.onGround=false;
  } else {
    if(player.vy<0) player.onGround=true;
    player.vy=0;
  }

  // Jump
  if(keys["Space"]&&player.onGround){ player.vy=JUMP_V; player.onGround=false; }

  // Clamp
  player.x=Math.max(PW+0.01,Math.min(WX-PW-0.01,player.x));
  player.z=Math.max(PW+0.01,Math.min(WZ-PW-0.01,player.z));
  if(player.y<1) player.y=1;

  camera.position.set(player.x, player.y+1.5, player.z);

  // Flashlight
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  flashlight.position.copy(camera.position);
  flashlight.target.position.copy(camera.position).add(dir);
}

// ═══════════════════════════════════════════
//  MINING
// ═══════════════════════════════════════════
let mouseDown = false;
document.addEventListener("mousedown",e=>{ if(e.button===0 && locked && !shopOpen) mouseDown=true; });
document.addEventListener("mouseup",e=>{ if(e.button===0){mouseDown=false;mining.active=false;} });

function updateHighlight(){
  if(!locked||shopOpen){hlMesh.visible=false;return null;}
  const t=getTargetBlock();
  if(!t){hlMesh.visible=false;return null;}
  hlMesh.position.set(t.x+0.5,t.y+0.5,t.z+0.5);
  hlMesh.visible=true;
  return t;
}

function updateMining(dt,target){
  const bar=document.getElementById("mining-bar");
  const fill=document.getElementById("mining-fill");
  if(!target||!mouseDown){
    mining.active=false; bar.classList.add("hidden"); return;
  }

  const bt=getBlock(target.x,target.y,target.z);
  if(bt===B.AIR||bt===B.BEDROCK){mining.active=false;bar.classList.add("hidden");return;}

  if(!mining.active||mining.bx!==target.x||mining.by!==target.y||mining.bz!==target.z){
    mining={active:true,bx:target.x,by:target.y,bz:target.z,progress:0};
  }

  const tool=TOOLS[player.tool];
  const hard=BDATA[bt].hard;
  const rate=tool.pow*tool.spd;
  mining.progress+=rate*dt;
  const pct=Math.min(mining.progress/hard,1);

  bar.classList.remove("hidden");
  fill.style.width=(pct*100)+"%";

  if(pct>=1){
    mineBlock(target.x,target.y,target.z,bt);
    mining.active=false;
    bar.classList.add("hidden");
  }
}

function mineBlock(x,y,z,bt){
  setBlock(x,y,z,B.AIR);
  const bd=BDATA[bt];
  if(bd.val>0){
    player.inventory[bt]=(player.inventory[bt]||0)+1;
    if(!discovered.has(bd.name)){
      discovered.add(bd.name);
      showDiscovery(bd.name,bd.val);
    }
  }
  spawnBreakParticles(x,y,z,bd.color);
  updateHotbar();
}

// ═══════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════
function spawnBreakParticles(x,y,z,c){
  for(let i=0;i<12;i++){
    const geo=new THREE.BoxGeometry(0.08,0.08,0.08);
    const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(c[0],c[1],c[2])});
    const m=new THREE.Mesh(geo,mat);
    m.position.set(x+0.5+(Math.random()-0.5)*0.6, y+0.5+(Math.random()-0.5)*0.6, z+0.5+(Math.random()-0.5)*0.6);
    m.userData={vx:(Math.random()-0.5)*3, vy:Math.random()*4+2, vz:(Math.random()-0.5)*3, life:1};
    scene.add(m); particles.push(m);
  }
}

function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i], u=p.userData;
    u.vy-=15*dt;
    p.position.x+=u.vx*dt; p.position.y+=u.vy*dt; p.position.z+=u.vz*dt;
    u.life-=dt*2;
    p.material.opacity=Math.max(0,u.life);
    p.material.transparent=true;
    if(u.life<=0){scene.remove(p);p.geometry.dispose();p.material.dispose();particles.splice(i,1);}
  }
}

// ═══════════════════════════════════════════
//  UI
// ═══════════════════════════════════════════
function notify(msg,type="info"){
  const e=document.createElement("div");e.className="notif "+type;e.textContent=msg;
  document.getElementById("notif-area").appendChild(e);setTimeout(()=>e.remove(),3500);
}

function showDiscovery(name,val){
  const el=document.getElementById("discovery"),txt=document.getElementById("disc-text");
  txt.textContent="✨ NEW ORE: "+name.toUpperCase()+" — $"+val+" each!";
  el.classList.remove("hidden");
  setTimeout(()=>el.classList.add("hidden"),3200);
  notify("Discovered "+name+"!","success");
}

function updateHUD(){
  document.getElementById("hud-money").textContent="$"+player.money.toLocaleString();
  const depth=Math.max(0,SURFACE-Math.floor(player.y));
  document.getElementById("hud-depth").textContent=depth>0?"Depth: "+depth+"m":"Surface";
  document.getElementById("hud-tool").textContent="⛏ "+TOOLS[player.tool].name;
}

function updateHotbar(){
  const el=document.getElementById("hotbar");
  el.innerHTML="";
  const ores=[B.COAL,B.IRON,B.GOLD,B.DIAMOND,B.EMERALD,B.RUBY];
  let totalVal=0;
  for(const o of ores){
    const cnt=player.inventory[o]||0;
    const bd=BDATA[o];
    totalVal+=cnt*bd.val;
    const slot=document.createElement("div");slot.className="hotbar-slot";
    slot.innerHTML=`<span class="hotbar-icon">${bd.icon}</span><span class="hotbar-name">${bd.name}</span><span class="hotbar-count">${cnt}</span>`;
    el.appendChild(slot);
  }
  // Total value slot
  const tv=document.createElement("div");tv.className="hotbar-slot";
  tv.innerHTML=`<span class="hotbar-icon">💰</span><span class="hotbar-name">Value</span><span class="hotbar-count" style="color:#fbbf24">$${totalVal}</span>`;
  el.appendChild(tv);
}

// ═══════════════════════════════════════════
//  SHOP
// ═══════════════════════════════════════════
function toggleShop(){
  shopOpen=!shopOpen;
  document.getElementById("shop-overlay").classList.toggle("hidden",!shopOpen);
  if(shopOpen){
    document.exitPointerLock();
    renderShop();
  } else {
    controls.lock();
  }
}

function renderShop(){
  // Sell list
  const sell=document.getElementById("sell-list");sell.innerHTML="";
  const ores=[B.COAL,B.IRON,B.GOLD,B.DIAMOND,B.EMERALD,B.RUBY];
  for(const o of ores){
    const bd=BDATA[o],cnt=player.inventory[o]||0;
    const row=document.createElement("div");row.className="shop-row";
    row.innerHTML=`<div class="shop-row-left"><div class="shop-ore-swatch" style="background:rgb(${bd.color.map(c=>Math.round(c*255)).join(",")})"></div><span class="shop-row-name">${bd.name}</span><span class="shop-row-detail">×${cnt} · $${bd.val}ea</span></div>`;
    if(cnt>0){
      const btn=document.createElement("button");btn.className="shop-btn sell";btn.style.width="auto";btn.style.padding="3px 8px";btn.textContent="SELL $"+(cnt*bd.val);
      btn.onclick=()=>{player.money+=cnt*bd.val;player.inventory[o]=0;renderShop();updateHotbar();updateHUD();notify("Sold "+cnt+" "+bd.name,"success");};
      row.appendChild(btn);
    }
    sell.appendChild(row);
  }
  document.getElementById("sell-all-btn").onclick=()=>{
    let total=0;
    for(const o of ores){const cnt=player.inventory[o]||0;total+=cnt*BDATA[o].val;player.inventory[o]=0;}
    if(total>0){player.money+=total;notify("Sold all ores for $"+total,"success");}
    renderShop();updateHotbar();updateHUD();
  };

  // Tools
  const tl=document.getElementById("tool-list");tl.innerHTML="";
  for(let i=0;i<TOOLS.length;i++){
    const t=TOOLS[i],owned=player.tool>=i;
    const row=document.createElement("div");row.className="shop-row";
    row.innerHTML=`<div class="shop-row-left"><span class="shop-row-name">${t.name}</span><span class="shop-row-detail">Pow:${t.pow} Spd:${t.spd}x</span></div>`;
    if(owned&&player.tool===i){
      const lbl=document.createElement("span");lbl.textContent="EQUIPPED";lbl.style.cssText="font-size:10px;color:#10b981;font-weight:700;";row.appendChild(lbl);
    } else if(owned){
      const btn=document.createElement("button");btn.className="shop-btn buy";btn.style.cssText="width:auto;padding:3px 8px";btn.textContent="EQUIP";
      btn.onclick=()=>{player.tool=i;renderShop();updateHUD();};row.appendChild(btn);
    } else {
      const btn=document.createElement("button");btn.className="shop-btn buy";btn.style.cssText="width:auto;padding:3px 8px";
      btn.textContent="$"+t.cost.toLocaleString();
      btn.disabled=player.money<t.cost;
      btn.onclick=()=>{if(player.money>=t.cost){player.money-=t.cost;player.tool=i;notify("Bought "+t.name,"success");renderShop();updateHUD();}};
      row.appendChild(btn);
    }
    tl.appendChild(row);
  }

  // Upgrades
  const ul=document.getElementById("upgrade-list");ul.innerHTML="";
  for(const u of UPGRADES){
    const owned=!!player.upgrades[u.id];
    const row=document.createElement("div");row.className="shop-row";
    row.innerHTML=`<div class="shop-row-left"><span class="shop-row-name">${u.name}</span><span class="shop-row-detail">${u.desc}</span></div>`;
    if(owned){
      const lbl=document.createElement("span");lbl.textContent="OWNED";lbl.style.cssText="font-size:10px;color:#10b981;font-weight:700;";row.appendChild(lbl);
    } else {
      const btn=document.createElement("button");btn.className="shop-btn buy";btn.style.cssText="width:auto;padding:3px 8px";
      btn.textContent="$"+u.cost.toLocaleString();
      btn.disabled=player.money<u.cost;
      btn.onclick=()=>{if(player.money>=u.cost){player.money-=u.cost;player.upgrades[u.id]=true;applyUpgrade(u.id);notify("Bought "+u.name,"success");renderShop();updateHUD();}};
      row.appendChild(btn);
    }
    ul.appendChild(row);
  }
}

function applyUpgrade(id){
  if(id==="lamp2"){flashlight.distance=35;flashlight.intensity=3.5;}
  if(id==="lamp3"){flashlight.distance=50;flashlight.intensity=4.5;}
}

// ═══════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════
let lastTime=0;
function loop(ts){
  requestAnimationFrame(loop);
  const dt=Math.min((ts-lastTime)/1000,0.05);
  lastTime=ts;

  if(locked&&!shopOpen){
    movePlayer(dt);
    const target=updateHighlight();
    updateMining(dt,target);
  } else {
    hlMesh.visible=false;
  }
  updateParticles(dt);
  rebuildDirty();
  updateHUD();

  renderer.render(scene,camera);
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
const startOverlay=document.getElementById("start-overlay");
const playBtn=document.getElementById("play-btn");

controls.addEventListener("lock",()=>{
  locked=true;
  startOverlay.classList.remove("active");
});
controls.addEventListener("unlock",()=>{
  locked=false;
  if(!shopOpen) startOverlay.classList.add("active");
});

playBtn.addEventListener("click",()=>controls.lock());
renderer.domElement.addEventListener("click",()=>{
  if(!locked&&!shopOpen) controls.lock();
});

generateWorld();
camera.position.set(player.x,player.y+1.5,player.z);
initChunks();
updateHotbar();
requestAnimationFrame(loop);
