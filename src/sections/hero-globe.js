/* Hero globe (Home)
 * Dotted globe with land, hub arcs and a pulse you can send by clicking. Drag to turn it.
 * Webflow elements: .section_home-hero > canvas.home-hero_globe (the globe; its colour blend, glow and
 *   opacity are Webflow styles), canvas.home-hero_dots (land dots), .home-hero_fade (soft fade at the bottom).
 * Switch: heroGlobe (off: the hero shows its static globe picture from Webflow).
 * While it runs, the hero's static globe picture is swapped for the plain sky gradient the globe sits on.
 * Data: src/data/globe.json (land dots, hubs, arcs).
 */
import {ON,canvasIn,RM,$,$$,clamp,mix,rgba,rnd,setSeed,DPR,fit,visible,debounce,lift,NAVY,DEEP,LIGHT,CREAM,PEACH,VIO} from '../core/utils.js';
import GD from '../data/globe.json';
const route='home';
export default function initHeroGlobe(){var heroEl=document.querySelector('.section_home-hero');if(!heroEl||!ON('heroGlobe'))return;
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
// A click sends a pulse: the globe deepens to Sky Horizon blue for a moment and bright dot trails race city to city.
const GRAT=[];for(let lo=0;lo<180;lo+=30){const a=[];for(let la=-180;la<=180;la+=5)a.push(toV(la<=90&&la>=-90?la:(la>0?180-la:-180-la),la<=90&&la>=-90?lo:lo+180));GRAT.push(a)}for(let la=-60;la<=60;la+=30){const a=[];for(let lo=-180;lo<=180;lo+=5)a.push(toV(la,lo));GRAT.push(a)}
function drawGlobe(t){if(!gx)return;let x=gx;x.clearRect(0,0,gW,gH);const FX=(()=>{const c=dotsCv;if(!c)return gx;if(c.width!==gc.width||c.height!==gc.height){c.width=gc.width;c.height=gc.height}const f=c.getContext('2d');f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,c.width,c.height);f.setTransform(gx.getTransform());return f})();
 const hi=gR-70,ho=gR+170,hs=(gR-hi)/(ho-hi);const halo=x.createRadialGradient(gCx,gCy,hi,gCx,gCy,ho);halo.addColorStop(0,'rgba(255,255,255,0)');halo.addColorStop(hs,'rgba(255,255,255,.8)');halo.addColorStop(hs+.035,'rgba(255,255,255,.3)');halo.addColorStop(hs+.26,'rgba(255,255,255,0)');halo.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=halo;x.fillRect(0,0,gW,gH);
 const disc=x.createRadialGradient(gCx-gR*.24,gCy-gR*.8,gR*.04,gCx,gCy,gR);disc.addColorStop(0,'#2E9BDA');disc.addColorStop(.3,'#0071B1');disc.addColorStop(.72,'#00497A');disc.addColorStop(1,'#04304F');x.fillStyle=disc;x.beginPath();x.arc(gCx,gCy,gR,0,6.283);x.fill();
 const crest=x.createLinearGradient(gCx-gR,0,gCx+gR,0);crest.addColorStop(0,'rgba(109,194,242,0)');crest.addColorStop(.3,'rgba(255,255,255,.9)');crest.addColorStop(.5,'rgba(255,255,255,1)');crest.addColorStop(.7,'rgba(255,255,255,.9)');crest.addColorStop(1,'rgba(109,194,242,0)');x.strokeStyle=crest;x.lineWidth=1.2;x.beginPath();x.arc(gCx,gCy,gR,0,6.283);x.stroke();
 const o=[0,0,0],w=wave;let age=0,rr=0,amp=0;if(w){age=(t-w.t)/1000;if(age>WAVE){wave=null}else{rr=easeOut(age/WAVE)*1.25;amp=1-Math.pow(age/WAVE,2)}}
 const buckets=[[],[],[],[]];const hot=[];const sc=clamp(gW/1440,.72,1.15);
 const ra=(lon+pLon)*Math.PI/180,rb=lat*Math.PI/180,ca=Math.cos(ra),sa=Math.sin(ra),cb=Math.cos(rb),sb=Math.sin(rb);const wv=wave?w.v:null;
 for(let i=0;i<LV.length;i+=3){const vx=LV[i],vy=LV[i+1],vz=LV[i+2],xx=vx*ca-vz*sa,z0=vx*sa+vz*ca,yy=vy*cb-z0*sb,zz=vy*sb+z0*cb;if(zz<=.01)continue;const px=gCx+xx*gR,py=gCy-yy*gR;if(py>gH+4||px<-4||px>gW+4)continue;let b=0;if(wv){const ang=Math.acos(clamp(vx*wv[0]+vy*wv[1]+vz*wv[2],-1,1));b=(Math.exp(-(((ang-rr)/.1)**2))+Math.exp(-((ang/.12)**2))*Math.max(0,1-age*.55))*amp}
  buckets[Math.min(3,zz*5|0)].push(px,py,zz)}
 buckets.forEach((a,k)=>{const x=FX;x.fillStyle=rgba(mix([200,232,250],[0,84,140],k/3),.95);x.beginPath();for(let i=0;i<a.length;i+=3){const r=(1+.8*a[i+2])*sc;x.moveTo(a[i]+r,a[i+1]);x.arc(a[i],a[i+1],r,0,6.283)}x.fill()});
 // ---- clear network layer: every line sits on the normal layer above the globe (never blended into the sky) ----
 const F=FX,SIG=[77,173,255],NAVYL='rgba(5,19,28,',WHITE=[255,255,255];
 // land dots the ripple has reached: white into Sky Horizon blue
 for(const h of hot){const r=(1+.8*h[2])*sc*(1+.35*clamp(h[3]));F.fillStyle=rgba(mix([200,232,250],SIG,clamp(h[3]*1.1)),.95);F.beginPath();F.arc(h[0],h[1],r,0,6.283);F.fill()}
 x.lineWidth=.7;x.strokeStyle='rgba(255,255,255,.13)';x.beginPath();for(const l of GRAT){let up=false;for(const p of l){proj(p,o);if(o[2]<=.02){up=false;continue}up?x.lineTo(o[0],o[1]):x.moveTo(o[0],o[1]);up=true}}x.stroke();
 const AR=window.__arcR==null?1:window.__arcR;
 // lines adapt to what is behind them: white over the deep-blue top of the globe, Sky Horizon blue over its pale lower part
 const yT=gCy-gR,span=Math.max(1,gH-yT),DEEP2=[0,113,177];
 // (while the globe is deepened during a pulse, everything turns white)
 const LG=a=>{const c1=mix([46,155,218],WHITE,fvG),c2=mix(DEEP2,WHITE,fvG),g=F.createLinearGradient(0,yT,0,gH);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(.3,'rgba(255,255,255,'+a+')');g.addColorStop(.58,rgba(c1,a));g.addColorStop(1,rgba(c2,a));return g};
 const CASE=a=>{if(fvG>.5)return NAVYL+a+')';const g=F.createLinearGradient(0,yT,0,gH);g.addColorStop(0,NAVYL+a+')');g.addColorStop(.45,NAVYL+(a*.6)+')');g.addColorStop(.7,'rgba(255,255,255,'+(a*1.6)+')');g.addColorStop(1,'rgba(255,255,255,'+(a*1.6)+')');return g};
 const tint=y=>{const k=clamp(((y-yT)/span-.3)/.4)*(1-fvG);return mix(WHITE,DEEP2,k*k*(3-2*k))};
 const fvG=w?clamp(age/.35)*(1-clamp((age-2.9)/1.3)):0;
 // pulse: for a moment the globe deepens to Sky Horizon blue, so the network is the brightest thing on it
 const fv=w?clamp(age/.35)*(1-clamp((age-2.9)/1.3)):0;
 if(fv>0){const vg=F.createRadialGradient(gCx,gCy-gR*.6,gR*.1,gCx,gCy,gR);vg.addColorStop(0,'rgba(0,113,177,'+(.5*fv)+')');vg.addColorStop(.7,'rgba(0,92,150,'+(.6*fv)+')');vg.addColorStop(1,'rgba(0,73,122,'+(.68*fv)+')');F.fillStyle=vg;F.beginPath();F.arc(gCx,gCy,gR,0,6.283);F.fill()}
 // path of an arc (part of it: from u0 to u1 of its length, in the direction "fwd")
 const arcPath=(e,u0,u1,fwd)=>{const n=e.pts.length-1;F.beginPath();let up=false,hx=null,hy=null;for(let m=Math.floor(n*u0);m<=Math.ceil(n*u1);m++){const p=e.pts[fwd?m:n-m];if(!p)continue;proj(p,o);if(o[2]<=.04){up=false;continue}up?F.lineTo(o[0],o[1]):F.moveTo(o[0],o[1]);up=true;hx=o[0];hy=o[1]}return hx==null?null:[hx,hy]};
 // resting network: a hair-thin navy edge under a white line, so it reads on the light and the dark parts of the globe
 F.lineCap='round';
 const rest=1-.6*fv; // the resting network steps back while a pulse runs
 // resting network, always readable: navy edge underneath, crisp white line, faint blue glow
 if(AR>0)ARCS.forEach(e=>{if(!arcPath(e,0,1,true))return;F.lineWidth=2.2*sc;F.strokeStyle=CASE(.2*rest);F.stroke();F.lineWidth=1.2*sc;F.strokeStyle=LG(.92*rest);F.shadowColor=rgba(SIG,.55*rest);F.shadowBlur=6;F.stroke();F.shadowBlur=0});
 // quiet data flow along every other arc: small white points with a blue glow
 // data moving along every route: a short trail of dots (white at the front, into Signal Blue), always running
 if(AR>=1)ARCS.forEach((e,k)=>{const n=e.pts.length-1,u0=((t/(4200+(k%5)*500)+k*.37)%1),fade=Math.sin(u0*Math.PI)*rest;if(fade<=.02)return;
  for(let d=0;d<5;d++){const u=u0-d*.025;if(u<0)break;proj(e.pts[Math.round(u*n)],o);if(o[2]<=.03)continue;const tc=tint(o[1]);F.fillStyle=rgba(d?mix(tc,SIG,d/4):tc,fade*(1-d*.17));F.beginPath();F.arc(o[0],o[1],Math.max(.7,(2.4-d*.35)*sc),0,6.283);F.fill()}});
 // when each hub is reached by a pulse (seconds after the click), for flashes
 const arrive=[];
 if(w){
  const HOP=.5,TRAVEL=.95;
  HV.forEach((h,i)=>{const L=w.lv[i];arrive[i]=L>=99?null:L*HOP+(L?TRAVEL:0)});
  ARCS.forEach(e=>{const li=w.lv[e.i],lj=w.lv[e.j];if(Math.min(li,lj)>=99||li===lj)return;const fwd=li<lj,st=Math.min(li,lj)*HOP,q=(age-st)/TRAVEL;if(q<=0)return;
   const n=e.pts.length-1;
   // the arc stays lit for a moment after the pulse has passed
   // a lit line: thin white with a navy casing underneath and a soft blue glow (reads on light and dark)
   const lit=(u1,a)=>{if(!arcPath(e,0,u1,fwd))return;F.lineWidth=3.2*sc;F.strokeStyle=CASE(.38*a);F.stroke();F.lineWidth=1.4*sc;F.strokeStyle=LG(.95*a);F.shadowColor=rgba(SIG,.9*a);F.shadowBlur=9;F.stroke();F.shadowBlur=0};
   if(q>=1){const fd=clamp(1-(q-1)*TRAVEL/1.6);if(fd>0)lit(1,fd);return}
   const head=easeOut(q);lit(head,1);
   // the pulse itself: a short trail of dots (the logomark's dot language), largest and brightest at the front
   const pn=e.pts.length-1;for(let d=0;d<11;d++){const u=head-d*.032;if(u<0)break;const pp=e.pts[Math.round((fwd?u:1-u)*pn)];proj(pp,o);if(o[2]<=.04)continue;
    const rr2=(3.4-d*.26)*sc,al=1-d*.075;F.fillStyle=rgba(d?mix(WHITE,SIG,Math.min(1,d/5)):WHITE,al);if(!d){F.shadowColor='rgba(255,255,255,.95)';F.shadowBlur=12}F.beginPath();F.arc(o[0],o[1],Math.max(.8,rr2),0,6.283);F.fill();F.shadowBlur=0}});
 }
 // hubs: white points with a navy hairline; they flash when a pulse reaches them
 window.__hub=window.__hub||[];HV.forEach((v,i)=>{proj(v,o);window.__hub[i]=[o[0],o[1],o[2]];if(o[2]<=.02||AR<=0)return;const r=3*sc;
  const fa=w&&arrive[i]!=null?(age-arrive[i])/.9:-1;
  if(fa>=0&&fa<1){F.strokeStyle=rgba(SIG,1-fa);F.lineWidth=1.4;F.beginPath();F.arc(o[0],o[1],r+fa*16*sc,0,6.283);F.stroke()}
  const boost=fa>=0&&fa<1?1+.6*(1-fa):1;
  F.fillStyle=rgba(SIG,.3);F.beginPath();F.arc(o[0],o[1],r*2.6*boost,0,6.283);F.fill();
  F.fillStyle='#fff';F.beginPath();F.arc(o[0],o[1],r*boost,0,6.283);F.fill();F.lineWidth=.8;F.strokeStyle=NAVYL+'.35)';F.stroke()});
 // where you clicked: a small white point with a ring opening out
 if(w){proj(w.v,o);if(o[2]>0){const pu=clamp(age/1.2);F.strokeStyle=rgba(WHITE,1-pu);F.lineWidth=1.4;F.beginPath();F.arc(o[0],o[1],4+pu*20*sc,0,6.283);F.stroke();F.fillStyle=rgba(WHITE,Math.max(0,1-age/2.6));F.beginPath();F.arc(o[0],o[1],3.2*sc,0,6.283);F.fill()}}}
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
