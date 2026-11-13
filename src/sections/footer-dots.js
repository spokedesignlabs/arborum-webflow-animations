/* Footer dot field (Home + About)
 * Breathing dots over the sky gradient; dots near the pointer brighten.
 * Attaches to: .footer_component
 */
import {RM,$,$$,clamp,mix,rgba,rnd,setSeed,DPR,fit,visible,debounce,lift,NAVY,DEEP,LIGHT,CREAM,PEACH,VIO} from '../core/utils.js';
export default function initFooterDots(){var foot=document.querySelector('.footer_component');if(!foot)return;
 var dc=document.createElement('canvas');dc.className='wf-anim';dc.setAttribute('aria-hidden','true');dc.style.webkitMaskImage=dc.style.maskImage='linear-gradient(transparent 0%,transparent 35%,#000 75%)';foot.prepend(dc);lift(foot);
 var mq=matchMedia('(max-width:767px)');function bg(){foot.style.backgroundImage=mq.matches?'linear-gradient(#F3F2EE 0,#F2BF95 14%,#E6D5B7 38%,#6DC2F2 68%,#0071B1 100%)':'linear-gradient(#F3F2EE 0,#F2BF95 18%,#E6D5B7 34%,#6DC2F2 54%,#0071B1 84%)'}bg();mq.addEventListener('change',bg);
 var df,fOn=false,mxy=null,fLast=0;function buildDots(){df=fit(dc)}buildDots();addEventListener('resize',debounce(buildDots));
 foot.addEventListener('pointermove',function(e){var r=foot.getBoundingClientRect();mxy={x:e.clientX-r.left,y:e.clientY-r.top}});foot.addEventListener('pointerleave',function(){mxy=null});
 function drawDots(t){var x=df.x,W=df.w,H=df.h;x.clearRect(0,0,W,H);var s=22,j=0,T=RM?0:t/5200;
  for(var y=0;y<H+s;y+=s*.866,j++){for(var i=0;i<W/s+2;i++){var X=(i+.5*(j%2))*s;var v=.5+.27*Math.sin(X/190+T)+.23*Math.sin(y/130-T*1.3+X/420);v=Math.max(0,(v-.42)*1.75);var g=0;if(mxy){var d=Math.hypot(X-mxy.x,y-mxy.y);g=Math.exp(-d*d/(2*125*125))}
   var r=.9+v*3.6+g*3.4;x.fillStyle='rgba(255,255,255,'+clamp(.05+v*.2+g*.55)+')';x.beginPath();x.arc(X,y,r,0,6.283);x.fill()}}}
 visible(foot,function(v){fOn=v});(function loop(t){if(fOn&&df&&t-fLast>33){drawDots(t);fLast=t}requestAnimationFrame(loop)})(0);
}
