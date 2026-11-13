/* About hero network plane
 * A perspective grid of nodes running to the horizon, with peach pulses travelling along it.
 * Webflow elements: .section_about-hero > canvas.about-hero_canvas
 */
import {RM,lift,canvasIn} from '../core/utils.js';
export default function initAboutNetwork(){const host0=document.querySelector('.section_about-hero');if(!host0)return;const c=canvasIn(host0,'about-hero_canvas');if(!c)return;c.setAttribute('aria-hidden','true');lift(host0);host0.style.backgroundImage='linear-gradient(#05131C 0%,#073554 22%,#0071B1 46%,#3E9FD8 58%,#9CD3F1 65%,#F4D3B6 66.2%,#E8EEF0 70%,#F3F2EE 100%)';const host=host0,x=c.getContext('2d');
let W=0,H=0,dpr=1,N=[],E=[],P=[],on=false,raf=0,seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function build(){const r=host.getBoundingClientRect();W=r.width;H=r.height;if(!W||!H)return;dpr=Math.min(2,devicePixelRatio||1);c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
 seed=7;N=[];const cols=W<700?22:34,rows=26;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const z=1.4+j*1.0,X=(i/(cols-1)-.5)*34+(rnd()-.5)*.8;N.push({X,z:z+(rnd()-.5)*.5,hub:rnd()<.05})}
 E=[];N.forEach((a,i)=>{const near=N.map((b,k)=>[k,Math.hypot(a.X-b.X,a.z-b.z)]).filter(q=>q[0]!==i&&q[1]<1.7).sort((p,q)=>p[1]-q[1]).slice(0,4);near.forEach(([k])=>{if(k>i&&rnd()<.72)E.push([i,k])})});
 P=[];for(let k=0;k<(W<700?8:16);k++)P.push({e:(rnd()*E.length)|0,t:rnd(),v:.0025+rnd()*.003});draw(performance.now())}
function pr(n){const hy=H*.66,f=H*.95,cam=(H*1.08-hy)/f;return[W/2+n.X*W*.06/n.z,hy+cam*f/n.z]}
function draw(){x.clearRect(0,0,W,H);const hy=H*.66;
 const g=x.createLinearGradient(0,hy-H*.06,0,hy+H*.04);g.addColorStop(0,'rgba(242,191,149,0)');g.addColorStop(.6,'rgba(242,191,149,.45)');g.addColorStop(1,'rgba(242,191,149,0)');x.fillStyle=g;x.fillRect(0,hy-H*.06,W,H*.1);
 const Q=N.map(pr),A=N.map(n=>Math.max(0,Math.min(1,(27.5-n.z)/13))*.95);
 x.lineWidth=1;E.forEach(([i,k])=>{const a=Math.min(A[i],A[k]);if(a<=.02)return;x.strokeStyle='rgba(0,113,177,'+(a*.5).toFixed(3)+')';x.beginPath();x.moveTo(Q[i][0],Q[i][1]);x.lineTo(Q[k][0],Q[k][1]);x.stroke()});
 N.forEach((n,i)=>{const a=A[i];if(a<=.02)return;const r=Math.max(.6,3.2/Math.sqrt(n.z));x.fillStyle=n.hub?'rgba(242,191,149,'+a+')':'rgba(0,92,150,'+(a*.85).toFixed(3)+')';x.beginPath();x.arc(Q[i][0],Q[i][1],n.hub?r*1.6:r,0,6.283);x.fill();if(n.hub&&a>.3){x.fillStyle='rgba(242,191,149,'+(a*.18).toFixed(3)+')';x.beginPath();x.arc(Q[i][0],Q[i][1],r*5,0,6.283);x.fill()}});
 P.forEach(p=>{const[i,k]=E[p.e]||[0,0],a=Math.min(A[i],A[k]);if(a<.1)return;const X=Q[i][0]+(Q[k][0]-Q[i][0])*p.t,Y=Q[i][1]+(Q[k][1]-Q[i][1])*p.t;x.fillStyle='rgba(240,150,90,'+Math.min(1,a*1.2).toFixed(3)+')';x.beginPath();x.arc(X,Y,Math.max(1.4,2.6*a),0,6.283);x.fill()})}
function loop(t){raf=0;if(!on)return;P.forEach(p=>{p.t+=p.v;if(p.t>=1){p.t=0;const k=E[p.e][1],nx=E.map((e,j)=>[e,j]).filter(([e])=>e[0]===k||e[1]===k);if(nx.length){const[e,j]=nx[(rnd()*nx.length)|0];p.e=j;if(e[1]===k){E[j]=[e[1],e[0]]}}else p.e=(rnd()*E.length)|0}});draw(t);raf=requestAnimationFrame(loop)}
new ResizeObserver(()=>build()).observe(host);
new IntersectionObserver(es=>{on=es[0].isIntersecting&&!RM;if(on&&!raf)raf=requestAnimationFrame(loop)}).observe(host);
}
