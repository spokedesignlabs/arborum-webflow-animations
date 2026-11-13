// /* Beyond Energy
//  * A long pinned section (the Webflow section is 420vh with a sticky inner block).
//  *  - Canvas: threads fall in from above, then the camera flies through three network shapes:
//  *    a flat channel (Energy) -> a tunnel (Telecom) -> a constellation (Other networks). The background tint follows.
//  *  - Copy: the heading and paragraph change at 34% and 67% of the way through, with a short fade.
//  *  - The three network labels highlight with the copy; click one to scroll to its part.
//  *  - The heading is a highlighted phrase that opens an info window.
//  * Attaches to: #beyond, .home-beyond_sticky, .home-beyond_copy (h3, p), .home-beyond_net
//  */
// import {RM,$,$$,clamp,mix,rgba,rnd,setSeed,fit,visible,debounce,lift,keyable,NAVY,DEEP,VIO} from '../core/utils.js';
// import {makeTrigger} from '../ui/popups.js';
// import {scrollToY} from '../ui/smooth-scroll.js';

// const COPY=[['Different networks. Endless possibilities.','The world’s most critical systems — telecom, finance, logistics and beyond — are complex networks of interconnected systems. We are extending World Model beyond energy to understand them, anticipate problems and discover better solutions.'],
//  ['Understanding networks. Improving how they operate.','We are extending our World Models to telecom networks, spanning infrastructure asset management and network operations. By modelling how interconnected network components behave, we aim to help operators make better decisions across increasingly complex and distributed systems.'],
//  ['A world model for every complex network.','From data centres to logistics and other critical infrastructure, we see an opportunity to apply the same underlying technology to systems where multiple assets, constraints and decisions interact. We are building towards a future where complex networks can be modelled, simulated and optimised through a common intelligence layer.']];
// const STEPS=[.34,.67]; // where the copy changes, as a share of the pinned scroll
// const NETWORKS={k:'Different networks. Endless possibilities.',t:'One change moves every network',p:'Energy, telecom and markets look separate. In practice a decision in one moves the others, so they have to be understood together.',l:['A heatwave hits the city','Power demand rises','Telecom sites draw more power','Prices move across the market']};

// /* ---- Copy, labels and the info window ---- */
// function initCopy(bs){
//  const copy=bs.querySelector('.home-beyond_copy'),h3=copy&&copy.querySelector('h3'),pp=copy&&copy.querySelector('p'),nets=$$('.home-beyond_net:not(.is-arrow)',bs);
//  let cur=-1,tm,trig=null;
//  if(h3)trig=makeTrigger(h3,NETWORKS,{width:440});
//  function set(i,force){if(i===cur&&!force)return;const first=cur<0;cur=i;nets.forEach((n,k)=>n.classList.toggle('is-active',k===i));if(first||!copy)return;
//   copy.classList.add('is-out');clearTimeout(tm);tm=setTimeout(()=>{(trig||h3).textContent=COPY[i][0];pp.textContent=COPY[i][1];copy.classList.remove('is-out')},RM?0:260)}
//  function tick(){const r=bs.getBoundingClientRect(),p=clamp(-r.top/Math.max(1,r.height-innerHeight));set(p<STEPS[0]?0:p<STEPS[1]?1:2)}
//  addEventListener('scroll',tick,{passive:true});tick();
//  nets.forEach((n,k)=>{const go=()=>{const top=bs.getBoundingClientRect().top+scrollY,span=bs.offsetHeight-innerHeight;scrollToY(top+span*(k*.33+.16))};n.addEventListener('click',go);keyable(n,go)});
// }

// /* ---- Canvas: channel -> tunnel -> constellation ---- */
// function initMorph(){var morphSec=document.getElementById('beyond'),stage=morphSec&&morphSec.querySelector('.home-beyond_sticky');if(!stage)return;
//  var cv=document.createElement('canvas');cv.id='morph';cv.className='wf-anim';cv.setAttribute('aria-hidden','true');stage.prepend(cv);lift(stage);
//  let morphP=0,morphE=0;
//  function mScroll(){const vh=innerHeight,m=morphSec.getBoundingClientRect();morphP=clamp(-m.top/Math.max(1,m.height-vh));morphE=RM?1:clamp((vh*.6-m.top)/(vh*.6+(m.height-vh)*.08))}
//  addEventListener('scroll',mScroll,{passive:true});mScroll();
// /* ---- Beyond Energy: threads fall in, then the camera flies through channel, tunnel and constellation ---- */
// const mc=$('#morph');let mf,MP=[],ME=[[],[],[]],mOn=false,MTH=[];const N=456;
// function ease(t){return t*t*(3-2*t)}
// function buildMorph(){mf=fit(mc);setSeed(11);MP=[];ME=[[],[],[]];const A=[],B=[],C=[];
//  for(let s2=0;s2<2;s2++)for(let r=0;r<12;r++)for(let c=0;c<19;c++)A.push([(c-9)*38+(r%2)*19,(s2?1:-1)*(74+rnd(-3,3)),60+r*62]);
//  const at=(s2,r,c)=>s2*228+r*19+c;for(let s2=0;s2<2;s2++)for(let r=0;r<12;r++)for(let c=0;c<19;c++){if(c<18)ME[0].push([at(s2,r,c),at(s2,r,c+1)]);if(r<11){ME[0].push([at(s2,r,c),at(s2,r+1,c)]);if(c<18&&r%2)ME[0].push([at(s2,r,c),at(s2,r+1,c+1)])}}
//  for(let r=0;r<12;r++)for(let i=0;i<38;i++){const th=i/38*6.283+r*.16;B.push([Math.cos(th)*210,Math.sin(th)*122,60+r*62]);ME[1].push([r*38+i,r*38+(i+1)%38]);if(r<11&&i%3===0)ME[1].push([r*38+i,(r+1)*38+i])}
//  const CC=[];for(let i=0;i<12;i++)CC.push([rnd(-260,260),rnd(-130,130),rnd(90,760)]);for(let i=0;i<N;i++){const c=CC[i%12],th=rnd(6.283),ph=Math.acos(rnd(-1,1)),R=Math.pow(rnd(),.6)*46;C.push([c[0]+Math.sin(ph)*Math.cos(th)*R,c[1]+Math.cos(ph)*R*.8,c[2]+Math.sin(ph)*Math.sin(th)*R]);if(i>=12)ME[2].push([i,i%12])}
//  for(let i=0;i<N;i++)MP.push({a:A[i],b:B[i],c:C[i],r:rnd(1.5,2.8),ph:rnd(6.28)});
//  MTH=[at(1,5,3),at(1,4,15),at(1,8,9)];drawMorph(performance.now())}
// function drawMorph(t){const{x,w:W,h:H}=mf;if(!W)return;const p=morphP,w0=1-ease(clamp((p-.22)/.2)),w2=ease(clamp((p-.6)/.2)),w1=clamp(1-w0-w2);
//  const end=clamp((1-p)/.12);const C0=[243,242,238],bg=mix(mix(mix(C0,[212,233,246],clamp(p/.2)),[197,226,245],w1),[248,229,211],w2),bgc=mix(C0,bg,end*clamp(morphE*1.2));x.fillStyle=rgba(bgc);x.fillRect(0,0,W,H);
//  const f=Math.min(W*.66,H*1.05),cz=-70+p*(RM?0:330),o=RM?0:t/2600,cx=W/2,cy=H/2,P=[];const col=mix(mix(DEEP,mix(DEEP,VIO,.65),w1),mix(VIO,NAVY,.12),w2);
//  for(let i=0;i<N;i++){const m=MP[i],X=m.a[0]*w0+m.b[0]*w1+m.c[0]*w2,Y=m.a[1]*w0+m.b[1]*w1+m.c[1]*w2,Z=m.a[2]*w0+m.b[2]*w1+m.c[2]*w2;let d=Z-cz;if(d<14){d+=0;P.push(null);continue}const k=f/d;P.push([cx+(X+Math.sin(o+m.ph)*2)*k,cy-(Y+Math.cos(o*1.2+m.ph)*2)*k,d,k])}
//  const fadeD=d=>clamp((d-14)/46)*clamp(1.12-d/820);
//  const bk=[[],[],[],[]];[w0,w1,w2].forEach((w,k)=>{if(w<.02)return;for(const[a,b]of ME[k]){const q=P[a],r=P[b];if(!q||!r)continue;const al=fadeD((q[2]+r[2])/2)*w;if(al<.03)continue;bk[Math.min(3,al*4|0)].push(q[0],q[1],r[0],r[1])}});
//  x.lineWidth=1;bk.forEach((a,k)=>{if(!a.length)return;x.strokeStyle=rgba(col,.16+k*.2);x.beginPath();for(let i=0;i<a.length;i+=4){x.moveTo(a[i],a[i+1]);x.lineTo(a[i+2],a[i+3])}x.stroke()});
//  for(let i=0;i<N;i++){const q=P[i];if(!q||q[0]<-8||q[0]>W+8||q[1]<-8||q[1]>H+8)continue;const a=fadeD(q[2]);if(a<.02)continue;x.fillStyle=rgba(col,.92*a);x.beginPath();x.arc(q[0],q[1],clamp(MP[i].r*q[3]*.42,.7,6),0,6.283);x.fill()}
//  const v=x.createLinearGradient(0,cy-H*.34,0,cy+H*.34);v.addColorStop(0,rgba(bgc,0));v.addColorStop(.3,rgba(bgc,.72));v.addColorStop(.7,rgba(bgc,.72));v.addColorStop(1,rgba(bgc,0));x.fillStyle=v;x.fillRect(0,0,W,H);
//  const ta=1-clamp((p-.14)/.1);if(ta>0&&morphE>0)MTH.forEach((id,i)=>{const q=P[id];if(!q)return;const qq=clamp(morphE*1.08-i*.04);if(qq<=0)return;const ex=cx+MP[id].a[0]*f/(MP[id].a[2]+70),B=u=>{const w=1-u;return[w*w*w*ex+3*w*w*u*ex+3*w*u*u*q[0]+u*u*u*q[0],3*w*w*u*q[1]*.5+3*w*u*u*q[1]*.55+u*u*u*q[1]]};x.strokeStyle=`rgba(5,19,28,${.55*ta})`;x.lineWidth=1.2;x.beginPath();x.moveTo(ex,0);for(let k=1;k<=30;k++){const b=B(k/30*qq);x.lineTo(b[0],b[1])}x.stroke();const h=B(qq);x.fillStyle=`rgba(5,19,28,${ta})`;x.beginPath();x.arc(h[0],h[1],qq<1?4:2.6,0,6.283);x.fill();if(qq>=1){x.strokeStyle=`rgba(5,19,28,${.4*ta})`;x.beginPath();x.arc(h[0],h[1],7,0,6.283);x.stroke()}})}
// (function loop(t){if(mOn&&mf)drawMorph(t);requestAnimationFrame(loop)})(0);
// visible(mc,v=>mOn=v);


//  buildMorph();addEventListener('resize',debounce(buildMorph));
// }

// export default function initBeyondEnergy(){const bs=document.getElementById('beyond');if(!bs)return;initCopy(bs);initMorph()}
