/* Reusable ripple network
 * Triangular node grid drawn on a canvas. ripple(x,y) sends a wave out from the nearest node;
 * nodes and lines brighten as the wave passes. Used by the World Model section.
 */
import {RM,clamp,mix,rgba,rnd,setSeed,fit,LIGHT,DEEP,VIO} from './utils.js';

export default function Net(canvas,opt){
 const o=Object.assign({spacing:118,fade:()=>1,dark:true},opt);let W=0,H=0,x,nodes=[],edges=[],waves=[],mouse=null,on=true,raf=0,last=0;
 function build(){const f=fit(canvas,o.height&&o.height());x=f.x;W=f.w;H=f.h;setSeed(o.seed||7);nodes=[];edges=[];
  const s=Math.max(74,Math.min(o.spacing,W/9));const rows=Math.ceil(H/(s*.866))+2,cols=Math.ceil(W/s)+2;
  for(let j=-1;j<rows;j++)for(let i=-1;i<cols;i++){nodes.push({x:(i+.5*((j+2)%2))*s+rnd(-.2,.2)*s,y:j*s*.866+rnd(-.2,.2)*s,v:0,base:rnd(.75,1.1),ph:rnd(6.28)})}
  for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){const dx=nodes[a].x-nodes[b].x,dy=nodes[a].y-nodes[b].y;if(dx*dx+dy*dy<s*s*1.75)edges.push([a,b])}
  o.onBuild&&o.onBuild(nodes,W,H);draw(performance.now())}
 function draw(t){x.clearRect(0,0,W,H);const sp=o.speed||420;
  waves=waves.filter(w=>(t-w.t)/1000<w.life);
  for(const n of nodes){let v=0;for(const w of waves){const age=(t-w.t)/1000,r=age*sp,d=Math.hypot(n.x-w.x,n.y-w.y);const band=Math.exp(-((d-r)**2)/(2*95*95));const core=Math.exp(-d*d/(2*160*160))*Math.exp(-age*1.1);v+=(band*1.35+core)*Math.exp(-age*.42)}
   if(mouse){const d=Math.hypot(n.x-mouse.x,n.y-mouse.y);v+=Math.exp(-d*d/(2*150*150))*.72}
   n.v+=(v-n.v)*.2;n.drift=RM?0:Math.sin(t/1800+n.ph)*.08}
  for(const [a,b] of edges){const A=nodes[a],B=nodes[b],v=clamp((A.v+B.v)/2),m=(A.y+B.y)/2,f=o.fade(m,H,(A.x+B.x)/2,W);if(f<=.01)continue;const al=(.24+.7*v)*f;x.strokeStyle=rgba(mix(mix(LIGHT,DEEP,.5),DEEP,clamp(v*1.25)),al);x.lineWidth=.8+1.3*v;x.beginPath();x.moveTo(A.x,A.y);x.lineTo(B.x,B.y);x.stroke()}
  for(const n of nodes){const f=o.fade(n.y,H,n.x,W);if(f<=.01)continue;const v=clamp(n.v),r=(2.1+4.6*v)*n.base;x.fillStyle=rgba(mix(mix(LIGHT,DEEP,.5),DEEP,clamp(v*1.25)),clamp((.62+n.drift+.38*v))*f);x.beginPath();x.arc(n.x,n.y,r,0,6.283);x.fill()}
  for(const w of waves){const age=Math.max(0,(t-w.t)/1000),r=age*sp,a=.9*Math.exp(-age*.75);if(a<.01)continue;const f=o.fade(w.y,H,w.x,W);x.strokeStyle=rgba(VIO,a*f);x.lineWidth=1.8;x.beginPath();x.arc(w.x,w.y,r,0,6.283);x.stroke();if(age<1.2){x.fillStyle=rgba(VIO,f*(1-age/1.2));x.beginPath();x.arc(w.x,w.y,6,0,6.283);x.fill()}}
  o.after&&o.after(x,t,W,H)}
 function loop(t){if(!on){raf=0;return}draw(t);if(RM&&!waves.length&&!mouse&&nodes.every(n=>n.v<.01)){raf=0;return}raf=requestAnimationFrame(loop)}
 const kick=()=>{if(on&&!raf)raf=requestAnimationFrame(loop)};
 const api={build,ripple(px,py,life=5){const n=nearest(px,py);waves.push({x:n.x,y:n.y,t:performance.now(),life});if(waves.length>6)waves.shift();kick();return n},
  nearest,setMouse(m){mouse=m;kick()},get nodes(){return nodes},get size(){return[W,H]},
  run(v){on=v;kick()}};
 function nearest(px,py){let b=nodes[0],bd=1e12;for(const n of nodes){const d=(n.x-px)**2+(n.y-py)**2;if(d<bd){bd=d;b=n}}return b}
 return api}
