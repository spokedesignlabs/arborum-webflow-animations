/* Hero globe (Home)
 * Dotted globe with land, hub arcs and a pulse you can send by clicking. Drag to turn it.
 * Webflow elements: .section_home-hero > canvas.home-hero_globe (the globe; its colour blend, glow and
 *   opacity are Webflow styles), canvas.home-hero_dots (land dots), .home-hero_fade (soft fade at the bottom).
 * While it runs, the hero's static globe picture is swapped for the plain sky gradient the globe sits on.
 * Data: src/data/globe.json (land dots, hubs, arcs).
 */
import {canvasIn,RM,$,$$,clamp,mix,rgba,rnd,setSeed,DPR,fit,visible,debounce,lift,NAVY,DEEP,LIGHT,CREAM,PEACH,VIO} from '../core/utils.js';
import GD from '../data/globe.json';
const route='home';
export default function initHeroGlobe(){var heroEl=document.querySelector('.section_home-hero');if(!heroEl)return;
 heroEl.id=heroEl.id||'hero';if(getComputedStyle(heroEl).position==='static')heroEl.style.position='relative';
 heroEl.style.backgroundImage='linear-gradient(#005C96 0%,#0071B1 16%,#1A82C4 32%,#3E9FD8 48%,#5BB6EC 62%,#6DC2F2 70%,#A6CFEA 77%,#DCCFE0 83%,#F0CDBE 88%,#F4D3B6 93%,#F3F2EE 100%)';
 var cv=canvasIn(heroEl,'home-hero_globe');if(!cv)return;cv.id='globe';cv.setAttribute('aria-hidden','true');
 var dotsCv=canvasIn(heroEl,'home-hero_dots');if(dotsCv)dotsCv.setAttribute('aria-hidden','true');
 var btn=heroEl.querySelector('.button');lift(heroEl);
 const hero=heroEl;
/* ---- The world: dotted globe, thin network, one smooth response ---- */
const gc=$('#globe');let gx,gW=0,gH=0,gR=0,gCx=0,gCy=0,gOn=false,gRaf=0;
const toV=(la,lo)=>{const a=la*Math.PI/180,b=lo*Math.PI/180;return[Math.cos(a)*Math.sin(b),Math.sin(a),Math.cos(a)*Math.cos(b)]};
const LV=new Float32Array(GD.land.length*3);GD.land.forEach((p,i)=>{const v=toV(p[0],p[1]);LV[i*3]=v[0];LV[i*3+1]=v[1];LV[i*3+2]=v[2]});
const HV=GD.hubs.map(h=>toV(h[0],h[1]));
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const ARCS=GD.edges.map(([i,j])=>{const a=HV[i],b=HV[j],o=Math.acos(clamp(dot(a,b),-1,1)),pts=[];for(let k=0;k<=36;k++){const t=k/36,s1=Math.sin((1-t)*o)/Math.sin(o),s2=Math.sin(t*o)/Math.sin(o),lift=1+.018*Math.sin(Math.PI*t)*Math.min(1,o);pts.push([(s1*a[0]+s2*b[0])*lift,(s1*a[1]+s2*b[1])*lift,(s1*a[2]+s2*b[2])*lift])}return{i,j,pts}});
const ADJ=GD.hubs.map(()=>[]);ARCS.forEach((e,k)=>{ADJ[e.i].push([e.j,k]);ADJ[e.j].push([e.i,k])});
const LAT0=-36;let lon=78,lat=LAT0,vLon=0,tLat=LAT0,pLon=0,dragging=false,wave=null;
function buildGlobe(){const f=fit(gc);gx=f.x;gW=f.w;gH=f.h;gR=clamp(gW*.46,300,760);gCx=gW/2;const ctaB=(btn||heroEl).getBoundingClientRect(),gT=gc.getBoundingClientRect().top,crestY=ctaB.height?Math.min(ctaB.bottom-gT+56,gH-170):gH*.68;gCy=(gW<gH?Math.max(crestY,$('#hero').getBoundingClientRect().bottom-gT-(gW<600?210:330)):crestY)+gR;drawGlobe(performance.now())}
function proj(v,out){const a=(lon+pLon)*Math.PI/180,b=lat*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);const x=v[0]*ca-v[2]*sa,z0=v[0]*sa+v[2]*ca,y=v[1]*cb-z0*sb,z=v[1]*sb+z0*cb;out[0]=gCx+x*gR;out[1]=gCy-y*gR;out[2]=z;return out}
function unproj(px,py){const X=(px-gCx)/gR,Y=(gCy-py)/gR,q=X*X+Y*Y;if(q>=1)return null;const Z=Math.sqrt(1-q),a=(lon+pLon)*Math.PI/180,b=lat*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);const z0=Z*cb-Y*sb,y=Y*cb+Z*sb;return[X*ca+z0*sa,y,-X*sa+z0*ca]}
const easeOut=t=>1-Math.pow(1-t,3),WAVE=4.4;
const GRAT=[];for(let lo=0;lo<180;lo+=30){const a=[];for(let la=-180;la<=180;la+=5)a.push(toV(la<=90&&la>=-90?la:(la>0?180-la:-180-la),la<=90&&la>=-90?lo:lo+180));GRAT.push(a)}for(let la=-60;la<=60;la+=30){const a=[];for(let lo=-180;lo<=180;lo+=5)a.push(toV(la,lo));GRAT.push(a)}
function drawGlobe(t){if(!gx)return;let x=gx;x.clearRect(0,0,gW,gH);const FX=(()=>{const c=dotsCv;if(!c)return gx;if(c.width!==gc.width||c.height!==gc.height){c.width=gc.width;c.height=gc.height}const f=c.getContext('2d');f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,c.width,c.height);f.setTransform(gx.getTransform());return f})();
 const hi=gR-70,ho=gR+170,hs=(gR-hi)/(ho-hi);const halo=x.createRadialGradient(gCx,gCy,hi,gCx,gCy,ho);halo.addColorStop(0,'rgba(255,255,255,0)');halo.addColorStop(hs,'rgba(255,255,255,.8)');halo.addColorStop(hs+.035,'rgba(255,255,255,.3)');halo.addColorStop(hs+.26,'rgba(255,255,255,0)');halo.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=halo;x.fillRect(0,0,gW,gH);
 const disc=x.createRadialGradient(gCx-gR*.24,gCy-gR*.8,gR*.04,gCx,gCy,gR);disc.addColorStop(0,'#2E9BDA');disc.addColorStop(.3,'#0071B1');disc.addColorStop(.72,'#00497A');disc.addColorStop(1,'#04304F');x.fillStyle=disc;x.beginPath();x.arc(gCx,gCy,gR,0,6.283);x.fill();
 const crest=x.createLinearGradient(gCx-gR,0,gCx+gR,0);crest.addColorStop(0,'rgba(109,194,242,0)');crest.addColorStop(.3,'rgba(255,255,255,.9)');crest.addColorStop(.5,'rgba(255,255,255,1)');crest.addColorStop(.7,'rgba(255,255,255,.9)');crest.addColorStop(1,'rgba(109,194,242,0)');x.strokeStyle=crest;x.lineWidth=1.2;x.beginPath();x.arc(gCx,gCy,gR,0,6.283);x.stroke();
 const o=[0,0,0],w=wave;let age=0,rr=0,amp=0;if(w){age=(t-w.t)/1000;if(age>WAVE){wave=null}else{rr=easeOut(age/WAVE)*1.25;amp=1-Math.pow(age/WAVE,2)}}
 const buckets=[[],[],[],[]];const hot=[];const sc=clamp(gW/1440,.72,1.15);
 const ra=(lon+pLon)*Math.PI/180,rb=lat*Math.PI/180,ca=Math.cos(ra),sa=Math.sin(ra),cb=Math.cos(rb),sb=Math.sin(rb);const wv=wave?w.v:null;
 for(let i=0;i<LV.length;i+=3){const vx=LV[i],vy=LV[i+1],vz=LV[i+2],xx=vx*ca-vz*sa,z0=vx*sa+vz*ca,yy=vy*cb-z0*sb,zz=vy*sb+z0*cb;if(zz<=.01)continue;const px=gCx+xx*gR,py=gCy-yy*gR;if(py>gH+4||px<-4||px>gW+4)continue;let b=0;if(wv){const ang=Math.acos(clamp(vx*wv[0]+vy*wv[1]+vz*wv[2],-1,1));b=(Math.exp(-(((ang-rr)/.1)**2))+Math.exp(-((ang/.12)**2))*Math.max(0,1-age*.55))*amp}
  if(b>.04)hot.push([px,py,zz,b]);else buckets[Math.min(3,zz*5|0)].push(px,py,zz)}
 buckets.forEach((a,k)=>{const x=FX;x.fillStyle=rgba(mix([200,232,250],[0,84,140],k/3),.95);x.beginPath();for(let i=0;i<a.length;i+=3){const r=(1+.8*a[i+2])*sc;x.moveTo(a[i]+r,a[i+1]);x.arc(a[i],a[i+1],r,0,6.283)}x.fill()});
 for(const h of hot){const r=(.74+.5*h[2])*sc*(1+.6*clamp(h[3]));x.fillStyle=rgba(mix([255,255,255],PEACH,clamp(h[3]*1.2)),clamp(.6+h[3]));x.beginPath();x.arc(h[0],h[1],r,0,6.283);x.fill()}
 x.lineWidth=.7;x.strokeStyle='rgba(255,255,255,.13)';x.beginPath();for(const l of GRAT){let up=false;for(const p of l){proj(p,o);if(o[2]<=.02){up=false;continue}up?x.lineTo(o[0],o[1]):x.moveTo(o[0],o[1]);up=true}}x.stroke();
 x.lineWidth=2*sc;x.lineCap='round';
 const AR=window.__arcR==null?1:window.__arcR,AO=window.__arcO,ad=p=>AO?Math.acos(Math.max(-1,Math.min(1,(p[0]*AO[0]+p[1]*AO[1]+p[2]*AO[2])/(Math.hypot(p[0],p[1],p[2])||1))))/Math.PI:0;if(AR>0)ARCS.forEach((e,k)=>{if(wave&&w.lv){const lv2=Math.min(w.lv[e.i],w.lv[e.j]);if(lv2<99&&age>.15+lv2*.62&&age<.15+lv2*.62+3.4)return}const n=e.pts.length,d0=ad(e.pts[0]),d1=ad(e.pts[n-1]),rev=d1<d0,lim=Math.ceil(n*Math.min(1,Math.max(0,(AR*2.4-Math.min(d0,d1)*1.4-(AO?0:k*.03))*1.5)));x.beginPath();let up=false;const P2=rev?e.pts.slice().reverse():e.pts;for(const p of P2.slice(0,lim)){proj(p,o);if(o[2]<=.05){up=false;continue}up?x.lineTo(o[0],o[1]):x.moveTo(o[0],o[1]);up=true}x.strokeStyle=rgba([255,255,255],.4);x.stroke()});
 x=FX;ARCS.forEach((e,k)=>{if(k%2||AR<1)return;const n=e.pts.length-1,u=((t/4200+k*.37)%1),p=e.pts[Math.round(u*n)];proj(p,o);if(o[2]<=.02)return;x.fillStyle=rgba([240,176,124],.85*Math.sin(u*Math.PI));x.beginPath();x.arc(o[0],o[1],2.8*sc,0,6.283);x.fill()});
 if(wave){const v0=w.v,nh=HV.map((h,i)=>[i,dot(h,v0)]).sort((p,q)=>q[1]-p[1]).slice(0,4),sq=clamp(age/.55),sf=Math.max(0,1-Math.max(0,age-2.4)/1.6);
  if(sf>0)nh.forEach(([i],k)=>{const h=HV[i],c=clamp(dot(h,v0),-1,1),om=Math.acos(c);if(om<1e-3)return;const so=Math.sin(om),qq=clamp(sq*1.3-k*.1);if(qq<=0)return;x.beginPath();let up=false,hx=null,hy=null;for(let m=0;m<=24*qq;m++){const t2=m/24,a1=Math.sin((1-t2)*om)/so,a2=Math.sin(t2*om)/so;proj([v0[0]*a1+h[0]*a2,v0[1]*a1+h[1]*a2,v0[2]*a1+h[2]*a2],o);if(o[2]<=0){up=false;continue}up?x.lineTo(o[0],o[1]):x.moveTo(o[0],o[1]);up=true;hx=o[0];hy=o[1]}
   x.lineWidth=1.1*sc;x.strokeStyle=rgba([240,176,124],.75*sf);x.shadowColor='rgba(242,191,149,.4)';x.shadowBlur=3;x.stroke();x.shadowBlur=0;if(hx!=null&&qq>=1){x.fillStyle=rgba([240,176,124],sf);x.beginPath();x.arc(hx,hy,3.2*sc,0,6.283);x.fill()}});}
 if(wave){ // the response travels hub to hub along the network
  ARCS.forEach((e,k)=>{const li=w.lv[e.i],lj=w.lv[e.j];const from=li<=lj;const lev=Math.min(li,lj);if(lev>=99)return;const st=.15+lev*.62,q=clamp((age-st)/1.05);if(q<=0)return;const fd=Math.max(0,1-Math.max(0,age-st-1.5)/1.9);if(fd<=0)return;const hd=easeOut(q),n=e.pts.length-1;x.beginPath();let up=false,hx=null,hy=null;for(let m=0;m<=n*hd;m++){const p=e.pts[from?m:n-m];proj(p,o);if(o[2]<=0){up=false;continue}up?x.lineTo(o[0],o[1]):x.moveTo(o[0],o[1]);up=true;hx=o[0];hy=o[1]}x.lineWidth=1.3*sc;x.strokeStyle=rgba([240,176,124],.9*fd);x.shadowColor='rgba(242,191,149,.45)';x.shadowBlur=3;x.stroke();x.shadowBlur=0;if(q<1&&hx!=null){x.fillStyle='#fff';x.beginPath();x.arc(hx,hy,2.4*sc,0,6.283);x.fill()}});
  // ring on the surface
  const a=w.v,u=Math.abs(a[1])<.9?[0,1,0]:[1,0,0];let e1=[a[1]*u[2]-a[2]*u[1],a[2]*u[0]-a[0]*u[2],a[0]*u[1]-a[1]*u[0]];const nn=Math.hypot(...e1);e1=e1.map(c=>c/nn);const e2=[a[1]*e1[2]-a[2]*e1[1],a[2]*e1[0]-a[0]*e1[2],a[0]*e1[1]-a[1]*e1[0]];
  x.beginPath();let up=false;for(let k=0;k<=96;k++){const th=k/96*6.283,c=Math.cos(rr),s=Math.sin(rr),v=[a[0]*c+(e1[0]*Math.cos(th)+e2[0]*Math.sin(th))*s,a[1]*c+(e1[1]*Math.cos(th)+e2[1]*Math.sin(th))*s,a[2]*c+(e1[2]*Math.cos(th)+e2[2]*Math.sin(th))*s];proj(v,o);if(o[2]<=.01){up=false;continue}up?x.lineTo(o[0],o[1]):x.moveTo(o[0],o[1]);up=true}x.lineWidth=1;x.strokeStyle=rgba(PEACH,.5*amp);x.stroke()}
 window.__hub=window.__hub||[];HV.forEach((v,i)=>{proj(v,o);window.__hub[i]=[o[0],o[1],o[2]];const hq=Math.min(1,Math.max(0,(AR*2.4-ad(v)*1.4)*1.5));if(o[2]<=.02||hq<=0)return;const r=3.2*sc*hq;x.fillStyle=rgba([255,255,255],.22);x.beginPath();x.arc(o[0],o[1],r*2.3,0,6.283);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(o[0],o[1],r,0,6.283);x.fill()});
 if(wave){proj(w.v,o);if(o[2]>0){const pu=clamp(age/1.1);x.strokeStyle=rgba([240,176,124],1-pu);x.lineWidth=1.2;x.beginPath();x.arc(o[0],o[1],3+pu*14,0,6.283);x.stroke();x.fillStyle=rgba([240,176,124],Math.max(.0,1-age/2.4));x.beginPath();x.arc(o[0],o[1],3*sc,0,6.283);x.fill()}}}
let gDrift=1,gLast=0;function gLoop(t){gRaf=0;if(!gOn)return;const dt=Math.min(50,t-gLast||16);gLast=t;
 if(!dragging){if(!RM){const m=((lon-78+540)%360)-180;if(m>42)gDrift=-1;else if(m<-42)gDrift=1;lon+=dt*.0016*gDrift}lon+=vLon;vLon*=.94;if(Math.abs(vLon)<.001)vLon=0}
 lat+=(tLat-lat)*.05;pLon+=(tPLon-pLon)*.05;drawGlobe(t);
 if(!RM||wave||dragging||vLon||Math.abs(tPLon-pLon)>.01||Math.abs(tLat-lat)>.01)gRaf=requestAnimationFrame(gLoop)}
let tPLon=0;const gKick=()=>{if(gOn&&!gRaf)gRaf=requestAnimationFrame(gLoop)};
visible(hero,v=>{gOn=v;gKick()});
function sendWave(v,raw){if(window.__arcReveal)window.__arcReveal(v);let best=0,bd=-2;HV.forEach((h,i)=>{const d=dot(h,v);if(d>bd){bd=d;best=i}});const lv=GD.hubs.map(()=>99);lv[best]=0;const q=[best];while(q.length){const a=q.shift();for(const[b]of ADJ[a])if(lv[b]===99){lv[b]=lv[a]+1;q.push(b)}}wave={v:raw?v:HV[best],t:performance.now(),lv};gKick()}
const hint={style:{}};let down=null,lastHit=0;
hero.addEventListener('pointerdown',e=>{if(e.target.closest('a'))return;down={x:e.clientX,y:e.clientY,lon,moved:false};hero.setPointerCapture&&hero.setPointerCapture(e.pointerId)});
hero.addEventListener('pointermove',e=>{const r=gc.getBoundingClientRect();if(down){const d=e.clientX-down.x;if(Math.abs(d)>4){down.moved=true;dragging=true;}if(down.moved){const n=down.lon-d*.075;vLon=(n-lon)*.45;lon=n;gKick()}}else if(!RM){tPLon=-((e.clientX-r.left)/r.width-.5)*2.4;tLat=LAT0+((e.clientY-r.top)/r.height-.5)*.9;gKick()}});
hero.addEventListener('pointerup',e=>{if(!down)return;const m=down.moved;down=null;dragging=false;if(m){gKick();return}const r=gc.getBoundingClientRect();const v=unproj(e.clientX-r.left,e.clientY-r.top);let target=v;if(!target){const dx=e.clientX-r.left-gCx,dy=gCy-(e.clientY-r.top),n=Math.hypot(dx,dy)||1;target=unproj(gCx+dx/n*gR*.92,gCy-dy/n*gR*.92)||HV[0]}sendWave(target);lastHit=performance.now();hint.style.opacity=0;0});
hero.addEventListener('pointerleave',()=>{tPLon=0;tLat=LAT0;gKick()});
if(!RM)setTimeout(()=>{if(!wave&&route==='home'){const c=unproj(gCx,gCy-gR*.985);if(c)sendWave(c,true)}},650);


 buildGlobe();addEventListener('resize',debounce(buildGlobe));if(document.fonts&&document.fonts.ready)document.fonts.ready.then(buildGlobe);
}
