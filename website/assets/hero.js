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
// 나비: 사진 위를 천천히 날아다녀요
const BF=[[.15,.2,'#fff'],[.45,.6,'#ffe27a'],[.7,.3,'#fff'],[.3,.8,'#fff'],[.85,.7,'#ffd24d'],[.6,.12,'#fff'],[.08,.55,'#ffe27a']].map((b,i)=>({u:b[0],v:b[1],col:b[2],ph:i*1.7,sp:.12+.03*(i%3),ax:.07+.02*(i%4),ay:.05+.02*(i%3)}));
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
function butterfly(x,y,a,s,col,flap){
 c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);
 c.fillStyle=col;c.strokeStyle='rgba(70,55,30,.45)';c.lineWidth=.7;
 const f=.2+.8*Math.abs(Math.sin(flap));
 for(const sd of[-1,1]){c.save();c.scale(sd*f,1);
  c.beginPath();c.ellipse(5,-3.5,5,6.5,.5,0,TAU);c.fill();c.stroke();
  c.beginPath();c.ellipse(3.8,4,3.2,4.4,-.4,0,TAU);c.fill();c.stroke();c.restore()}
 c.fillStyle='#4a3d2a';c.beginPath();c.ellipse(0,0,.9,5.5,0,0,TAU);c.fill();c.restore();
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
  const u=b.u+Math.sin(t*b.sp+b.ph)*b.ax+Math.sin(t*b.sp*2.3+b.ph)*.02,v=b.v+Math.cos(t*b.sp*1.3+b.ph)*b.ay;
  const u2=b.u+Math.sin((t+.05)*b.sp+b.ph)*b.ax+Math.sin((t+.05)*b.sp*2.3+b.ph)*.02,v2=b.v+Math.cos((t+.05)*b.sp*1.3+b.ph)*b.ay;
  const x=u*W,y=v*H,ang=Math.atan2((v2-v)*H,(u2-u)*W)+Math.PI/2;
  butterfly(x,y,ang,sc*1.9,b.col,t*14+b.ph);
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
