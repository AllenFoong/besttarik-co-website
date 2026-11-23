/* Cup shape: the outline of the Premium front shot is the master for every flavour.
   Each flavour keeps only its own cream dome above the rim. */
function rimOf(raw){ let k = -1; raw.forEach((p,i)=>{ if (p[1] > .6 && p[1] < .97 && (k < 0 || p[0] > raw[k][0])) k = i; }); return k; }
const MASTER = (()=>{ const raw = A.premium.profile, k = rimOf(raw); return {raw, k, ry: raw[k][1], rr: raw[k][0]}; })();
function masterR(y){
  const r = MASTER.raw;
  for (let i=1;i<=MASTER.k;i++) if (r[i][1] >= y){ const a = r[i-1], b = r[i], t = (y-a[1]) / Math.max(1e-6, b[1]-a[1]); return a[0] + (b[0]-a[0])*t; }
  return MASTER.rr;
}
function profileFor(fid){
  const raw = A[fid].profile;
  if (A[fid].master) return raw.map(([r,y],i)=>new THREE.Vector2(i === 0 ? 0 : r*HW, y*HW - HW/2));
  const k = rimOf(raw), ry = raw[k][1], rr = raw[k][0], s = MASTER.rr / rr;
  return raw.map(([r,y],i)=>{
    if (i === 0) return new THREE.Vector2(0, -HW/2);
    let Y, R;
    if (y <= ry){ Y = y/ry*MASTER.ry; R = masterR(Y); } else { Y = MASTER.ry + (y-ry)*s; R = r*s; }
    return new THREE.Vector2(R*HW, Y*HW - HW/2);
  });
}
// Older photos see the base from above, so their bottom rows show the base ellipse as stripes: stretch the band above it down.
function clampBaseUV(geo, prof){
  const j = prof.findIndex(p=>p.y >= .06*HW - HW/2); const vMin = j / (prof.length - 1);
  const uv = geo.attributes.uv;
  for (let i=0;i<uv.count;i++) if (uv.getY(i) < vMin) uv.setY(i, vMin);
  uv.needsUpdate = true;
}
const RADIAL = (()=>{ const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const r = g.createRadialGradient(128,128,0,128,128,128); r.addColorStop(0,'#fff'); r.addColorStop(.72,'#fff'); r.addColorStop(.9,'#000'); r.addColorStop(1,'#000');
  g.fillStyle = r; g.fillRect(0,0,256,256); return new THREE.CanvasTexture(c); })();
function buildCup(fid, set){
  const g = new THREE.Group();
  const prof = profileFor(fid);
  const bodyGeo = new THREE.LatheGeometry(prof, 200); if (!A[fid].master && !A[fid].level) clampBaseUV(bodyGeo, prof);
  g.add(new THREE.Mesh(bodyGeo, new THREE.MeshBasicMaterial({map:set.tex})));
  const rim = rimOf(A[fid].profile);
  const gl = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(0, rim+1).map(p=>new THREE.Vector2(p.x*1.012+.004, p.y)), 200),
    new THREE.MeshPhysicalMaterial({color:0xffffff, roughness:.05, metalness:0, transparent:true, opacity:.12, clearcoat:1, clearcoatRoughness:.03, envMapIntensity:2.4, depthWrite:false}));
  gl.renderOrder = 2; g.add(gl);
  if (set.cap){                                        // foam seen from above, laid over the dome and faded out at its edge
    const dome = prof.slice(rim); const Rd = Math.max(...dome.map(p=>p.x));
    const geo = new THREE.LatheGeometry(dome.map(p=>new THREE.Vector2(p.x*1.004+.002, p.y+.003)), 200);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i=0;i<uv.count;i++) uv.setXY(i, .5 + pos.getX(i)/(2*Rd), .5 - pos.getZ(i)/(2*Rd));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({map:set.cap, alphaMap:RADIAL, transparent:true, depthWrite:false}));
    m.renderOrder = 1; g.add(m);
  }
  if (set.base){                                       // the underside, from the bottom-view photo
    const disk = new THREE.Mesh(new THREE.CircleGeometry(prof[1].x, 96), new THREE.MeshBasicMaterial({map:set.base}));
    disk.rotation.x = Math.PI/2; disk.position.y = -HW/2 - .002; g.add(disk);
  }
  return g;
}
const loader = new THREE.TextureLoader();
const texCache = {};
const loadTex = url => new Promise(res=>loader.load(url, t=>{ t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; renderer.initTexture(t); res(t); }, undefined, ()=>res(null)));
function texFor(fid){
  if (!texCache[fid]) texCache[fid] = Promise.all([loadTex(`a/wrap-${fid}.webp`), A[fid].cap ? loadTex('a/' + A[fid].cap) : null, A[fid].base ? loadTex('a/' + A[fid].base) : null])
    .then(([tex, cap, base])=>({tex, cap, base}));
  return texCache[fid];
}
let cupMesh = null;
function setCup(fid, set){
  if (cupMesh){ spinG.remove(cupMesh); cupMesh.traverse(o=>{ if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
  cupMesh = buildCup(fid, set); spinG.add(cupMesh);
}
const heroEl = document.getElementById('hero');
