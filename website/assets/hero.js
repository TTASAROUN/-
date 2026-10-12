// 메인 화면 배경: 공원 사진(assets/hero.jpg) 위에 나비·풍선·아기·강아지 움직임을 입힙니다.
// 사진을 바꾸면 아래 OBJ 좌표(사진 기준 픽셀)도 함께 바꿔 주세요.
// 실제 영상(assets/hero.mp4)을 넣으면 영상이 자동으로 우선 재생됩니다.
(function(){
const hero=document.querySelector('.hero');if(!hero)return;
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.createElement('canvas');cv.className='hero-media';cv.setAttribute('aria-hidden','true');
hero.insertBefore(cv,hero.firstChild);
const c=cv.getContext('2d');if(!c)return;
const IW=1672,IH=941,TAU=Math.PI*2;
// 움직일 대상: x,y 중심 · rx,ry 영역 · kind: crawl(기어감) sit(앉아 놂) balloon(풍선) dog(강아지)
const OBJ=[
 {k:'crawl',x:950,y:195,rx:62,ry:42,dx:1,dy:0,p:0},
 {k:'crawl',x:490,y:285,rx:62,ry:46,dx:-1,dy:0,p:1.3},
 {k:'crawl',x:850,y:330,rx:56,ry:46,dx:.9,dy:-.2,p:2.1},
 {k:'crawl',x:590,y:395,rx:56,ry:42,dx:1,dy:-.1,p:.7},
 {k:'crawl',x:795,y:500,rx:52,ry:42,dx:-.3,dy:-.9,p:3.2},
 {k:'crawl',x:1215,y:600,rx:52,ry:46,dx:-.4,dy:-.8,p:4.1},
 {k:'crawl',x:1385,y:290,rx:56,ry:46,dx:-1,dy:0,p:5.0},
 {k:'sit',x:1040,y:680,rx:46,ry:46,p:.4},
 {k:'sit',x:1120,y:710,rx:46,ry:46,p:2.4},
 {k:'dog',x:1150,y:160,rx:48,ry:42,dx:-1,dy:.3,p:.9},
 {k:'dog',x:440,y:625,rx:72,ry:46,dx:1,dy:-.1,p:2.8},
 {k:'balloon',x:360,y:62,rx:34,ry:36,ax:415,ay:165,p:0},
 {k:'balloon',x:1585,y:172,rx:34,ry:36,ax:1512,ay:262,p:2},
 {k:'balloon',x:1472,y:450,rx:34,ry:36,ax:1512,ay:545,p:4}
];
const img=new Image();img.decoding='async';img.src='assets/hero.jpg';
let W=0,H=0,dpr=1,sc=1,ox=0,oy=0,ready=false,raf=0,running=false,t0=0;
// 나비: 종류마다 색이 다르고, 날개를 퍼덕이다 날개를 펴고 미끄러지듯 날기를 반복해요
const FW=new Path2D('M.8,-2C3,-9 10,-13 14.500,-11.500C16.500,-10.500 15.500,-4 11.500,-.5C8.500,2 4,2 .8,.6Z');
const HW=new Path2D('M.8,.6C4.500,1.500 9.500,2 11.500,5.500C12.500,9.500 8,12.500 4.500,10.500C2,9 1,5.500 .8,3Z');
const SPECIES={
 monarch:{a:'#f6a21e',b:'#e0661a',edge:'#2b1d12',dots:'#fff',vein:'rgba(40,20,5,.55)'},
 swallow:{a:'#ffe86a',b:'#f2c230',edge:'#2b2415',dots:'#f2c230',vein:'rgba(40,30,5,.5)'},
 white:{a:'#ffffff',b:'#e9eef2',edge:'#8a949c',dots:'',vein:'rgba(110,120,130,.5)'},
 blue:{a:'#8fc8ff',b:'#4f8fe0',edge:'#1d2f55',dots:'#fff',vein:'rgba(20,40,90,.5)'}
};
const BF=[['white',.15,.22],['monarch',.5,.62],['swallow',.72,.3],['white',.3,.82],['blue',.86,.7],['white',.62,.14],['monarch',.08,.58]].map((b,i)=>({sp:SPECIES[b[0]],u:b[1],v:b[2],ph:i*1.9,spd:.11+.025*(i%3),ax:.09+.02*(i%4),ay:.06+.02*(i%3),phase:i,hd:0,lt:0,sz:1.6+.25*(i%3)}));
function feather(o){ // 가장자리가 부드러운 조각을 사진에서 잘라 둡니다
 const w=Math.ceil(o.rx*2+8),h=Math.ceil(o.ry*2+8),p=document.createElement('canvas');p.width=w;p.height=h;const g=p.getContext('2d');
 g.drawImage(img,o.x-w/2,o.y-h/2,w,h,0,0,w,h);
 g.globalCompositeOperation='destination-in';g.save();g.translate(w/2,h/2);g.scale(o.rx/o.ry>1?1:o.rx/o.ry,o.rx/o.ry>1?o.ry/o.rx:1);
 const R=Math.max(o.rx,o.ry),gr=g.createRadialGradient(0,0,R*.55,0,0,R);gr.addColorStop(0,'#000');gr.addColorStop(1,'#0000');g.fillStyle=gr;g.fillRect(-w,-h,w*2,h*2);g.restore();
 o.cv=p;
}
function size(){
 const r=hero.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);W=Math.max(1,Math.round(r.width*dpr));H=Math.max(1,Math.round(r.height*dpr));
 cv.width=W;cv.height=H;sc=Math.max(W/IW,H/IH);const mobile=r.width<760;ox=(W-IW*sc)*(mobile?.68:.6);oy=(H-IH*sc)*.1;draw(t0)
}
function wing(sp,f){
 c.save();c.scale(f,1);
 for(const P of[FW,HW]){
  const g=c.createRadialGradient(0,0,1,8,-3,15);g.addColorStop(0,sp.b);g.addColorStop(1,sp.a);
  c.fillStyle=g;c.fill(P);c.lineWidth=.85;c.strokeStyle=sp.edge;c.lineJoin='round';c.stroke(P);
 }
 c.strokeStyle=sp.vein;c.lineWidth=.45;c.beginPath();
 for(const[x,y]of[[13,-9],[12,-5],[9,-2],[10,6],[7,9]]){c.moveTo(1,0);c.quadraticCurveTo(x*.55,y*.35,x,y)}c.stroke();
 if(sp.dots){c.fillStyle=sp.dots;for(const[x,y]of[[13,-9.800],[14.300,-6.500],[12.800,-2.800],[10.800,8.500],[7.500,10.800]]){c.beginPath();c.arc(x-.4,y,.55,0,TAU);c.fill()}}
 c.restore();
}
function butterfly(b,x,y,ang,s,flap,glide){
 c.save();c.translate(x+4*s,y+9*s);c.rotate(ang);c.scale(s*.9,s*.9);c.globalAlpha=.13;c.fillStyle='#10260c';
 c.beginPath();c.ellipse(0,0,10*Math.max(.3,flap),8,0,0,TAU);c.fill();c.restore(); // 풀밭에 비친 그림자
 c.save();c.translate(x,y);c.rotate(ang);c.scale(s,s);
 wing(b.sp,flap);c.scale(-1,1);wing(b.sp,flap);c.scale(-1,1);
 c.fillStyle='#2e2418';c.beginPath();c.ellipse(0,1,.95,5.600,0,0,TAU);c.fill();c.beginPath();c.arc(0,-5.200,1.100,0,TAU);c.fill();
 c.strokeStyle='#2e2418';c.lineWidth=.5;c.beginPath();c.moveTo(-.4,-6);c.quadraticCurveTo(-2.500,-9.500,-3.800,-9);c.moveTo(.4,-6);c.quadraticCurveTo(2.500,-9.500,3.800,-9);c.stroke();
 c.restore();
}
function draw(t){
 if(!ready)return;
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
 c.setTransform(sc,0,0,sc,ox,oy);c.drawImage(img,0,0);
 for(const o of OBJ){
  if(!o.cv)feather(o);
  const s=t+o.p;let tx=0,ty=0,rot=0,z=1,cx=o.x,cy=o.y;
  if(o.k==='crawl'){ // 앞으로 기어갔다가 천천히 돌아오는 느낌
   const m=Math.sin(s*1.6),stp=Math.sin(s*5.2);tx=o.dx*m*7;ty=o.dy*m*7;rot=Math.sin(s*5.2)*.035;z=1+stp*.012;
  }else if(o.k==='sit'){rot=Math.sin(s*1.9)*.035;ty=Math.sin(s*3.8)*1.4;z=1+Math.sin(s*3.8)*.01}
  else if(o.k==='dog'){const m=Math.sin(s*1.2);tx=o.dx*m*5;ty=o.dy*m*5+Math.sin(s*6)*1.2;rot=Math.sin(s*6)*.03}
  else{ // 풍선: 손에 잡힌 끈을 중심으로 바람에 흔들려요
   const a=Math.sin(s*1.1)*.05+Math.sin(s*2.3)*.02,dx=o.x-o.ax,dy=o.y-o.ay,ca=Math.cos(a),sa=Math.sin(a);
   cx=o.ax+dx*ca-dy*sa;cy=o.ay+dx*sa+dy*ca;rot=a;
  }
  c.save();c.translate(cx+tx,cy+ty);c.rotate(rot);c.scale(z,z);c.drawImage(o.cv,-o.cv.width/2,-o.cv.height/2);c.restore();
 }
 c.setTransform(1,0,0,1,0,0);
 for(const b of BF){
  const dt=b.lt?Math.min(.05,Math.max(0,t-b.lt)):0;b.lt=t;
  const w=t*b.spd+b.ph;
  const U=b.u+Math.sin(w)*b.ax+Math.sin(w*2.31+1.3)*.03,V=b.v+Math.cos(w*1.27)*b.ay+Math.sin(w*3.1)*.015;
  const e=.02,w2=w+e*b.spd,U2=b.u+Math.sin(w2)*b.ax+Math.sin(w2*2.31+1.3)*.03,V2=b.v+Math.cos(w2*1.27)*b.ay+Math.sin(w2*3.1)*.015;
  const tgt=Math.atan2((V2-V)*H,(U2-U)*W)+Math.PI/2;let d=tgt-b.hd;d=Math.atan2(Math.sin(d),Math.cos(d));b.hd+=d*Math.min(1,dt*4);
  const burst=Math.sin(t*.8+b.ph*2.1);const glide=burst>.55;           // 가끔 날개를 펴고 미끄러져요
  b.phase+=dt*(glide?1.2:(11+5*Math.sin(t*1.7+b.ph)));
  const flap=glide?.9+.08*Math.sin(b.phase*3):.12+.88*Math.abs(Math.cos(b.phase));
  const bob=Math.sin(b.phase*2)*(glide?.4:2.2);
  butterfly(b,U*W+Math.cos(b.hd)*bob,V*H+Math.sin(b.hd)*bob,b.hd,sc*b.sz,flap,glide);
 }
}
function loop(ts){if(!running)return;if(!t0)t0=ts/1000;draw(ts/1000);raf=requestAnimationFrame(loop)}
function start(){if(running||reduce||!ready)return;running=true;raf=requestAnimationFrame(loop)}
function stop(){running=false;cancelAnimationFrame(raf)}
img.onload=()=>{ready=true;size();start()};
let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,150)});
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
if('IntersectionObserver' in window)new IntersectionObserver(es=>es[0].isIntersecting?start():stop()).observe(hero);
// 실제 영상이 있으면 우선 사용
const v=document.createElement('video');v.className='hero-media hero-video';v.src='assets/hero.mp4';v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto';v.setAttribute('aria-hidden','true');v.style.opacity='0';
if(!reduce){v.addEventListener('canplaythrough',()=>{v.play().then(()=>{v.style.opacity='1';stop();setTimeout(()=>{cv.style.display='none'},900)}).catch(()=>v.remove())},{once:true});v.addEventListener('error',()=>v.remove());cv.after(v)}
window.__hero={draw,size,stop,start};
})();
