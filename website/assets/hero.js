// 메인 화면 초록 영역 배경: 하늘에서 내려다본 잔디밭 (아기들, 관리사님·가족, 동물, 나비)
// 직접 그린 애니메이션입니다. 실제 촬영 영상으로 바꾸려면 아래 HERO_VIDEO에 영상 경로를 적으세요. (예: 'assets/hero.mp4')
(function(){
const HERO_VIDEO='';
const hero=document.querySelector('.hero');if(!hero)return;
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── 영상 파일이 지정되면 그 영상을 사용 ──
if(HERO_VIDEO){
 const v=document.createElement('video');v.className='hero-media';v.src=HERO_VIDEO;v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('aria-hidden','true');
 v.onerror=()=>v.remove();hero.insertBefore(v,hero.firstChild);v.play&&v.play().catch(()=>{});
 hero.insertAdjacentHTML('afterbegin','<div class="hero-ov"></div>');return;
}

const cv=document.createElement('canvas');cv.className='hero-media';cv.setAttribute('aria-hidden','true');
hero.insertBefore(cv,hero.firstChild);hero.insertAdjacentHTML('afterbegin','<div class="hero-ov"></div>');
const c=cv.getContext('2d');if(!c)return;
const TAU=Math.PI*2;
let W=0,H=0,dpr=1,U=1,bg=null,scene=null,t=0,last=0,raf=0,running=false;

// 고정 난수 (매번 같은 모양)
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let x=Math.imul(seed^seed>>>15,1|seed);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296}}
const lerp=(a,b,k)=>a+(b-a)*k,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angDiff=(a,b)=>{let d=(b-a+Math.PI)%TAU;if(d<0)d+=TAU;return d-Math.PI};
const R=rng(7),rr=(a,b)=>a+(b-a)*R();

// ── 잔디 배경(한 번만 그려 두고 재사용) ──
function makeGrass(w,h){
 const o=document.createElement('canvas');o.width=w*dpr;o.height=h*dpr;const g=o.getContext('2d');g.scale(dpr,dpr);
 const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#86cc72');gr.addColorStop(.5,'#74bf62');gr.addColorStop(1,'#68b45a');g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.save();g.rotate(-.35);for(let x=-h;x<w+h;x+=70*U){g.fillStyle='rgba(255,255,220,.055)';g.fillRect(x,-h,35*U,w+h*2)}g.restore(); // 잔디깎기 줄무늬
 const r=rng(11);
 for(let i=0;i<Math.round(w*h/110);i++){
  const x=r()*w,y=r()*h,a=-Math.PI/2+(r()-.5)*1.1,l=(5+r()*9)*U;
  g.strokeStyle=r()<.5?'rgba(60,130,50,.55)':'rgba(170,225,120,.5)';g.lineWidth=1.1*U;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();
 }
 for(let i=0;i<Math.round(w*h/9000);i++){ // 클로버·들꽃
  const x=r()*w,y=r()*h,k=r();
  if(k<.55){g.fillStyle='rgba(255,255,255,.9)';for(let j=0;j<5;j++){g.beginPath();g.arc(x+Math.cos(j*TAU/5)*2.6*U,y+Math.sin(j*TAU/5)*2.6*U,1.9*U,0,TAU);g.fill()}g.fillStyle='#f4c84a';g.beginPath();g.arc(x,y,1.7*U,0,TAU);g.fill()}
  else{g.fillStyle='rgba(255,231,120,.95)';g.beginPath();g.arc(x,y,2.4*U,0,TAU);g.fill()}
 }
 return o;
}
// 체크무늬 담요 무늬
function makePattern(){
 const p=document.createElement('canvas');p.width=p.height=36;const g=p.getContext('2d');
 g.fillStyle='#fff7ea';g.fillRect(0,0,36,36);g.fillStyle='rgba(240,150,150,.38)';g.fillRect(0,0,36,18);g.fillStyle='rgba(240,150,150,.38)';g.fillRect(0,0,18,36);
 return c.createPattern(p,'repeat');
}

// ── 그리기 도구 ──
function cap(x1,y1,x2,y2,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function el(x,y,rx,ry,col,rot){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fill()}
const shadow=(x,y,rx,ry,a)=>el(x,y,rx,ry,`rgba(20,60,25,${a||.16})`);

// 기어가는 아기·어른(네 발로 기기) — 앞쪽이 +x
function drawCrawler(e){
 c.save();c.translate(e.x,e.y);c.rotate(e.a);c.scale(e.sc,e.sc);
 shadow(3,7,17,11);
 const s1=Math.sin(e.ph),s2=Math.sin(e.ph+Math.PI);
 const limb=(bx,by,dx,dy,col,w)=>{cap(bx,by,bx+dx,by+dy,w,col)};
 limb(8,-8,8+s1*5,-2,e.skin,4);limb(8,8,8+s2*5,2,e.skin,4);
 limb(-8,-7,-8+s2*4,-4,e.pants,5.2);limb(-8,7,-8+s1*4,4,e.pants,5.2);
 el(0,0,13,9.5,e.top);el(-8,0,7.5,8.5,e.pants);
 if(e.stripe){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.6;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*4,-8);c.lineTo(i*4,8);c.stroke()}}
 el(15,0,7.6,7.6,e.skin);el(14.5,-7.4,2,2,e.skin);el(14.5,7.4,2,2,e.skin);
 el(12.6,0,7.4,7.3,e.hair);el(8.4,0,2.2,2.2,e.hair);
 if(e.bow){el(18.5,-4,2.3,2.3,e.bow);el(18.5,-1.2,2.3,2.3,e.bow)}
 c.restore();
}
// 앉은 어른(관리사님·부모) — 앞쪽이 +x
function drawSitter(e,t){
 c.save();c.translate(e.x,e.y);c.rotate(e.a+Math.sin(t*.6+e.sw)*.05);c.scale(e.sc,e.sc);
 el(5,10,22,19,'rgba(20,60,25,.09)');
 cap(-2,-9,13,-15,7,e.pants);cap(-2,9,13,15,7,e.pants);el(14,-15,4.2,4.2,e.skin);el(14,15,4.2,4.2,e.skin);
 el(0,0,11,20,e.top);
 if(e.apron)el(3,0,6.5,13,e.apron);
 const wv=Math.sin(t*2.2+e.sw)*5;
 cap(2,-17,17+wv,-10+(e.hold?6:0),5,e.top);cap(2,17,17-wv,10-(e.hold?6:0),5,e.top);
 el(17+wv,-10+(e.hold?6:0),3.4,3.4,e.skin);el(17-wv,10-(e.hold?6:0),3.4,3.4,e.skin);
 if(e.hold){ // 안고 있는 아기
  const b=Math.sin(t*1.4)*.8;el(16,b,9,6.5,'#ffd9c7');el(24,b,5.2,5.2,'#f6cba8');el(22.6,b,4.8,4.7,'#6b4a34');
 }
 el(5,0,9.4,9.4,e.skin);el(2.8,0,8.8,8.7,e.hair);
 if(e.bun)el(-6,0,5.6,5.6,e.hair);
 c.restore();
}
function drawPuppy(e,t){
 c.save();c.translate(e.x,e.y);c.rotate(e.a);c.scale(e.sc,e.sc);
 shadow(3,6,17,10);
 const s=Math.sin(e.ph);
 el(8+s*2,-6,2.6,2.6,'#c98a43');el(8-s*2,6,2.6,2.6,'#c98a43');el(-8-s*2,-6,2.6,2.6,'#c98a43');el(-8+s*2,6,2.6,2.6,'#c98a43');
 const tw=Math.sin(t*(e.moving?18:6))*(e.moving?.7:.4);
 cap(-12,0,-20,Math.sin(tw)*7,3.4,'#d9a057');
 el(0,0,13,8.6,'#e0a85f');el(-2,0,6,6.2,'#f1c98b');
 el(12,0,7.2,6.6,'#e0a85f');el(17,0,3.5,2.8,'#f4d9b0');el(19.8,0,1.4,1.4,'#3a2a22');
 el(10,-7.5,3.4,4.6,'#8d5a2b',.3);el(10,7.5,3.4,4.6,'#8d5a2b',-.3);
 c.restore();
}
function drawBunny(e){
 const hp=e.hop,lift=Math.sin(Math.PI*hp)*9;
 c.save();c.translate(e.x,e.y);c.rotate(e.a);
 shadow(2,6+lift*.5,11-lift*.2,7,.2-lift*.008);
 c.translate(0,-lift*.6);c.scale(e.sc*(1+lift*.012),e.sc*(1+lift*.012));
 el(-9,0,5,4.5,'#fff');el(0,0,11,8,'#f4f1ee');el(10,0,6.3,6,'#fbfaf8');
 el(8,-4.6,2.2,6.2,'#f4f1ee',-.5);el(8,4.6,2.2,6.2,'#f4f1ee',.5);el(8,-4.6,1,4.2,'#f6b9c4',-.5);el(8,4.6,1,4.2,'#f6b9c4',.5);
 el(15.5,0,1.7,1.4,'#f08aa0');
 c.restore();
}
function drawKitten(e,t){
 c.save();c.translate(e.x,e.y);c.rotate(e.a);c.scale(e.sc*(1+Math.sin(t*1.6)*.02),e.sc*(1+Math.sin(t*1.6)*.02));
 shadow(2,6,15,11);
 el(0,0,13,11,'#e8a35d');c.strokeStyle='rgba(150,80,30,.5)';c.lineWidth=1.6;for(let i=-1;i<=1;i++){c.beginPath();c.arc(-2,0,5+i*3.2,-1,1);c.stroke()}
 cap(9,8,-6,11+Math.sin(t*.9)*2,3.6,'#d98d45');
 el(10,-1,6.6,6.2,'#efb06b');c.fillStyle='#d98d45';c.beginPath();c.moveTo(7,-6);c.lineTo(9,-10);c.lineTo(11,-6);c.fill();c.beginPath();c.moveTo(7,4);c.lineTo(9,8);c.lineTo(11,4);c.fill();
 c.restore();
}
function drawButterfly(b,t){
 const fl=Math.abs(Math.sin(b.fp)),x=b.x,y=b.y;
 // 땅에 비친 그림자
 c.save();c.translate(x+16*U,y+22*U);c.rotate(b.a);c.fillStyle='rgba(20,60,25,.13)';c.beginPath();c.ellipse(0,-4*U*fl,5*U,7.5*U*(.3+fl*.7),0,0,TAU);c.ellipse(0,4*U*fl,5*U,7.5*U*(.3+fl*.7),0,0,TAU);c.fill();c.restore();
 c.save();c.translate(x,y);c.rotate(b.a);c.scale(U*b.sc,U*b.sc);
 c.fillStyle=b.c1;c.beginPath();c.ellipse(-1,-6*fl-1,6,9,-.5,0,TAU);c.ellipse(-1,6*fl+1,6,9,.5,0,TAU);c.fill();
 c.fillStyle=b.c2;c.beginPath();c.ellipse(-6,-4*fl,3.8,5.5,-.9,0,TAU);c.ellipse(-6,4*fl,3.8,5.5,.9,0,TAU);c.fill();
 c.strokeStyle='rgba(60,40,30,.8)';c.lineWidth=1.6;c.beginPath();c.moveTo(-8,0);c.lineTo(8,0);c.stroke();
 c.lineWidth=.9;c.beginPath();c.moveTo(8,0);c.lineTo(13,-3);c.moveTo(8,0);c.lineTo(13,3);c.stroke();
 c.restore();
}
function drawBall(b){shadow(b.x+3,b.y+5,9,6,.2);c.fillStyle='#ef6b5a';c.beginPath();c.arc(b.x,b.y,8*U,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,8*U,.2,1.3);c.lineTo(b.x,b.y);c.fill();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(b.x-2.5*U,b.y-3*U,2.4*U,0,TAU);c.fill()}

// ── 장면 구성 ──
function build(){
 U=clamp(H/520,.72,1.5);
 const bx=W*.70,by=H*.54,bw=360*U,bh=250*U,ba=-.07;
 const toW=(lx,ly)=>({x:bx+Math.cos(ba)*lx-Math.sin(ba)*ly,y:by+Math.sin(ba)*lx+Math.cos(ba)*ly});
 const sk=['#f6cba8','#f1bd96','#e8ae85','#fad4b8'],hr=['#6b4a34','#3d2a20','#8a5b3a','#c98a43'];
 const mkBaby=(x,y,i,top,bounds)=>({k:'baby',x,y,a:rr(0,TAU),sc:1.05*U*E,ph:rr(0,TAU),sp:rr(22,32)*U,bounds,tgt:null,pause:rr(0,2),skin:sk[i%4],top,pants:'#fff3e0',hair:hr[i%4],bow:i%2?'#ff8fa8':null,stripe:i%2===0});
 const blanketB={x0:bx-bw*.32,x1:bx+bw*.34,y0:by-bh*.28,y1:by+bh*.3};
 const grassB={x0:W*.5,x1:W*.96,y0:H*.1,y1:H*.9};
 const E=1.25;
 const S={bx,by,bw,bh,ba,pat:makePattern(),ents:[],butter:[],ball:null};
 const care=toW(-bw*.43,bh*.18),mom=toW(bw*.38,-bh*.16);
 S.care={k:'sitter',x:care.x,y:care.y,a:ba-.15,sc:1.05*U*E,sw:0,skin:'#f6cba8',hair:'#3d2a20',top:'#ffffff',pants:'#7a8fb5',apron:'#4aa58e',bun:true};
 S.mom={k:'sitter',x:mom.x,y:mom.y,a:ba+Math.PI-.1,sc:1.05*U*E,sw:2,skin:'#f1bd96',hair:'#6b4a34',top:'#ffb3a7',pants:'#556',hold:true};
 const babyA=mkBaby(bx-bw*.1,by+bh*.05,0,'#9fd8c9',blanketB),babyD=mkBaby(W*.58,H*.72,2,'#ffd27d',grassB);
 const dad={k:'adult',x:W*.55,y:H*.3,a:0,sc:2.3*U*E,ph:0,sp:20*U,bounds:grassB,tgt:null,pause:1,skin:'#e8ae85',top:'#5b87c6',pants:'#3b4a63',hair:'#3d2a20'};
 const babyC=mkBaby(W*.5,H*.34,1,'#ffb3c7',grassB);babyC.follow=dad;
 const pup={k:'puppy',x:W*.86,y:H*.8,a:3,sc:1.15*U*E,ph:0,sp:70*U,bounds:grassB,moving:0,pause:0};
 const bun={k:'bunny',x:W*.5,y:H*.78,a:0,sc:1.15*U*E,hop:0,wait:1,from:null,to:null,bounds:grassB};
 const kit={k:'kitten',x:toW(bw*.34,bh*.3).x,y:toW(bw*.34,bh*.3).y,a:ba+2.6,sc:1.15*U*E};
 S.ents=[babyA,babyD,babyC,dad,pup,bun,kit,S.care,S.mom];S.babyA=babyA;S.dad=dad;S.pup=pup;
 S.ball={x:W*.8,y:H*.62,vx:0,vy:0,bounds:grassB};
 const cols=[['#ffd45c','#ff9a3c'],['#ff9ec7','#ff6fa5'],['#9fd0ff','#5aa6ff'],['#fff','#ffd9a8'],['#ffb36b','#ff7a3a'],['#d9b8ff','#a97bff']];
 for(let i=0;i<7;i++){const k=cols[i%cols.length];S.butter.push({cx:W*rr(.42,.95),cy:H*rr(.12,.88),rx:rr(60,150)*U,ry:rr(30,80)*U,sx:rr(.25,.55),sy:rr(.3,.6),ph:rr(0,TAU),fp:rr(0,TAU),fs:rr(9,14),c1:k[0],c2:k[1],sc:rr(.8,1.15),x:0,y:0,a:0,vx:rr(-12,12),dx:0})}
 // 담요 위 장난감
 S.toys=[];const tc=['#ff8f7a','#ffd45c','#7ec8e3','#a8d98a'];
 for(let i=0;i<4;i++){const p=toW(-bw*.15+i*38*U,-bh*.3+(i%2)*22*U);S.toys.push({x:p.x,y:p.y,a:rr(0,TAU),c:tc[i]})}
 const ted=toW(bw*.18,bh*.12);S.ted=ted;
 scene=S;
}
function pick(e){const b=e.bounds;e.tgt={x:rr(b.x0,b.x1),y:rr(b.y0,b.y1)}}
function step(e,dt){
 if(e.pause>0){e.pause-=dt;e.moving=0;return}
 if(e.follow){e.tgt={x:e.follow.x-Math.cos(e.follow.a)*34*U+Math.sin(e.follow.a)*26*U,y:e.follow.y-Math.sin(e.follow.a)*34*U-Math.cos(e.follow.a)*26*U}}
 else if(!e.tgt)pick(e);
 const dx=e.tgt.x-e.x,dy=e.tgt.y-e.y,d=Math.hypot(dx,dy);
 e.a+=angDiff(e.a,Math.atan2(dy,dx))*clamp(dt*3.2,0,1);
 const sp=e.sp*clamp(d/50,.3,1)*(1-Math.abs(angDiff(e.a,Math.atan2(dy,dx)))/Math.PI*.7);
 e.x+=Math.cos(e.a)*sp*dt;e.y+=Math.sin(e.a)*sp*dt;e.ph+=sp*dt*(e.k==='adult'?.16:e.k==='puppy'?.35:.3);e.moving=sp>8;
 if(!e.follow&&d<14*U){pick(e);if(R()<.4)e.pause=rr(.8,2.6)}
}
function update(dt,t){
 const S=scene;
 step(S.babyA,dt);step(S.ents[1],dt);step(S.ents[2],dt);step(S.dad,dt);
 // 강아지는 공을 쫓아요
 const p=S.pup,b=S.ball;p.tgt={x:b.x,y:b.y};
 b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.pow(.5,dt);b.vy*=Math.pow(.5,dt);
 if(b.x<b.bounds.x0||b.x>b.bounds.x1)b.vx*=-1;if(b.y<b.bounds.y0||b.y>b.bounds.y1)b.vy*=-1;
 b.x=clamp(b.x,b.bounds.x0,b.bounds.x1);b.y=clamp(b.y,b.bounds.y0,b.bounds.y1);
 if(Math.hypot(p.x-b.x,p.y-b.y)<20*U&&p.pause<=0){const a=R()*TAU;b.vx=Math.cos(a)*150*U;b.vy=Math.sin(a)*150*U;p.pause=.5}
 if(p.pause>0){p.pause-=dt;p.moving=0}else{const dx=b.x-p.x,dy=b.y-p.y;p.a+=angDiff(p.a,Math.atan2(dy,dx))*clamp(dt*7,0,1);const sp=p.sp*clamp(Math.hypot(dx,dy)/60,.2,1);p.x+=Math.cos(p.a)*sp*dt;p.y+=Math.sin(p.a)*sp*dt;p.ph+=sp*dt*.35;p.moving=sp>10}
 // 토끼는 콩콩 뛰어요
 const u=S.ents[5];
 if(u.from){u.hop+=dt/.55;const k=Math.min(1,u.hop);u.x=lerp(u.from.x,u.to.x,k);u.y=lerp(u.from.y,u.to.y,k);if(u.hop>=1){u.from=null;u.hop=0;u.wait=rr(.5,2.2)}}
 else{u.wait-=dt;if(u.wait<=0){const a=rr(0,TAU),d=rr(30,55)*U;u.from={x:u.x,y:u.y};u.to={x:clamp(u.x+Math.cos(a)*d,u.bounds.x0,u.bounds.x1),y:clamp(u.y+Math.sin(a)*d,u.bounds.y0,u.bounds.y1)};u.a=Math.atan2(u.to.y-u.y,u.to.x-u.x);u.hop=.001}}
 // 사람들은 아기를 바라봐요
 const care=S.care,ba=S.babyA;care.a=Math.atan2(ba.y-care.y,ba.x-care.x);
 // 나비
 S.butter.forEach(f=>{
  f.fp+=dt*f.fs;f.dx+=f.vx*dt;
  const nx=f.cx+f.dx+f.rx*Math.sin(t*f.sx+f.ph),ny=f.cy+f.ry*Math.sin(t*f.sy+f.ph*1.7);
  f.a=Math.atan2(ny-f.y,nx-f.x);f.x=nx;f.y=ny;
  if(f.cx+f.dx>W*1.02||f.cx+f.dx<W*.35)f.vx*=-1;
 });
}

// ── 프레임 그리기 ──
function frame(){
 const S=scene;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const z=1.03+Math.sin(t*.05)*.012,cx=Math.sin(t*.07)*14*U,cy=Math.cos(t*.06)*9*U;
 c.save();c.translate(W/2+cx,H/2+cy);c.scale(z,z);c.translate(-W/2,-H/2);
 c.drawImage(bg,-60*U,-60*U,W+120*U,H+120*U);
 // 담요
 c.save();c.translate(S.bx,S.by);c.rotate(S.ba);
 c.fillStyle='rgba(20,60,25,.22)';rrect(-S.bw/2+6,-S.bh/2+9,S.bw,S.bh,16*U);c.fill();
 c.fillStyle=S.pat;rrect(-S.bw/2,-S.bh/2,S.bw,S.bh,16*U);c.fill();c.strokeStyle='rgba(224,122,122,.55)';c.lineWidth=5*U;c.stroke();
 c.restore();
 S.toys.forEach(o=>{c.save();c.translate(o.x,o.y);c.rotate(o.a);shadow(2,3,10*U,9*U,.16);c.fillStyle=o.c;rrect(-9*U,-9*U,18*U,18*U,4*U);c.fill();c.restore()});
 c.save();c.translate(S.ted.x,S.ted.y);c.scale(U,U);shadow(3,5,13,12,.18);el(0,0,10,10,'#b97f4e');el(-8,-8,4,4,'#b97f4e');el(8,-8,4,4,'#b97f4e');el(0,-1,6,6,'#d4a273');c.restore();
 // 위에서 아래 순서로 겹쳐 그리기
 const L=S.ents.slice().sort((a,b)=>a.y-b.y);
 drawBall(S.ball);
 L.forEach(e=>{
  if(e.k==='baby'||e.k==='adult')drawCrawler(e);else if(e.k==='sitter')drawSitter(e,t);else if(e.k==='puppy')drawPuppy(e,t);else if(e.k==='bunny')drawBunny(e);else if(e.k==='kitten')drawKitten(e,t);
 });
 S.butter.forEach(f=>drawButterfly(f,t));
 c.restore();
 // 흐르는 빛과 구름 그림자
 for(let i=0;i<3;i++){const x=((t*(10+i*4)+i*W*.4)%(W*1.6))-W*.3,y=H*(.25+i*.28);const g=c.createRadialGradient(x,y,0,x,y,W*.28);g.addColorStop(0,i%2?'rgba(10,50,20,.10)':'rgba(255,255,230,.16)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
 const v=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,50,30,.28)');c.fillStyle=v;c.fillRect(0,0,W,H);
}
function rrect(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

function loop(now){
 if(!running)return;
 const dt=Math.min(.05,(now-last)/1000||.016);last=now;t+=dt;update(dt,t);frame();raf=requestAnimationFrame(loop);
}
function start(){if(running||reduce)return;running=true;last=performance.now();raf=requestAnimationFrame(loop)}
function stop(){running=false;cancelAnimationFrame(raf)}
function size(){
 const r=hero.getBoundingClientRect();W=Math.max(320,Math.round(r.width));H=Math.max(300,Math.round(r.height));
 dpr=Math.min(window.devicePixelRatio||1,1.5);cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
 U=clamp(H/520,.72,1.5);bg=makeGrass(W+120*U,H+120*U);build();
 // 처음부터 장면이 자리 잡히도록 몇 초 미리 진행
 t=0;for(let i=0;i<150;i++){t+=.04;update(.04,t)}frame();
}
// window.__heroT: 영상 만들기용으로 시간을 직접 지정할 수 있어요
window.__hero={size,stop,start,step(dt){t+=dt;update(dt,t);frame()},frame};
size();
if(reduce){frame()}else{
 start();
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 if('IntersectionObserver' in window)new IntersectionObserver(es=>es[0].isIntersecting?start():stop()).observe(hero);
}
let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,200)});
})();
