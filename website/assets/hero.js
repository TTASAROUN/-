// 메인 화면 초록 영역 배경: 하늘에서 내려다본 잔디밭 (다양한 인종의 아기들, 관리사님·가족, 동물, 나비)
// 직접 그린 애니메이션입니다. 실제 촬영 영상을 쓰려면 assets/hero.mp4 파일을 넣으세요. (자동으로 영상이 우선 재생됩니다)
(function(){
const HERO_VIDEO='assets/hero.mp4'; // 이 위치에 영상 파일(mp4)을 넣으면 애니메이션 대신 자동으로 재생돼요. 파일이 없으면 애니메이션이 나옵니다.
const hero=document.querySelector('.hero');if(!hero)return;
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

const cv=document.createElement('canvas');cv.className='hero-media';cv.setAttribute('aria-hidden','true');
hero.insertBefore(cv,hero.firstChild);hero.insertAdjacentHTML('afterbegin','<div class="hero-ov"></div>');
const c=cv.getContext('2d');if(!c)return;
const TAU=Math.PI*2;
let W=0,H=0,dpr=1,U=1,bg=null,scene=null,t=0,last=0,raf=0,running=false;

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let x=Math.imul(seed^seed>>>15,1|seed);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296}}
const lerp=(a,b,k)=>a+(b-a)*k,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angDiff=(a,b)=>{let d=(b-a+Math.PI)%TAU;if(d<0)d+=TAU;return d-Math.PI};
const R=rng(7),rr=(a,b)=>a+(b-a)*R();

// ── 잔디 배경 ──
function makeGrass(w,h){
 const o=document.createElement('canvas');o.width=w*dpr;o.height=h*dpr;const g=o.getContext('2d');g.scale(dpr,dpr);
 const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#86cc72');gr.addColorStop(.5,'#74bf62');gr.addColorStop(1,'#68b45a');g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.save();g.rotate(-.35);for(let x=-h;x<w+h;x+=70*U){g.fillStyle='rgba(255,255,220,.055)';g.fillRect(x,-h,35*U,w+h*2)}g.restore();
 const r=rng(11);
 for(let i=0;i<Math.round(w*h/110);i++){
  const x=r()*w,y=r()*h,a=-Math.PI/2+(r()-.5)*1.1,l=(5+r()*9)*U;
  g.strokeStyle=r()<.5?'rgba(60,130,50,.55)':'rgba(170,225,120,.5)';g.lineWidth=1.1*U;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();
 }
 for(let i=0;i<Math.round(w*h/9000);i++){
  const x=r()*w,y=r()*h,k=r();
  if(k<.55){g.fillStyle='rgba(255,255,255,.9)';for(let j=0;j<5;j++){g.beginPath();g.arc(x+Math.cos(j*TAU/5)*2.6*U,y+Math.sin(j*TAU/5)*2.6*U,1.9*U,0,TAU);g.fill()}g.fillStyle='#f4c84a';g.beginPath();g.arc(x,y,1.7*U,0,TAU);g.fill()}
  else{g.fillStyle='rgba(255,231,120,.95)';g.beginPath();g.arc(x,y,2.4*U,0,TAU);g.fill()}
 }
 return o;
}
function makePattern(){
 const p=document.createElement('canvas');p.width=p.height=36;const g=p.getContext('2d');
 g.fillStyle='#fff7ea';g.fillRect(0,0,36,36);g.fillStyle='rgba(240,150,150,.38)';g.fillRect(0,0,36,18);g.fillRect(0,0,18,36);
 return c.createPattern(p,'repeat');
}

// ── 그리기 도구 ──
function cap(x1,y1,x2,y2,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function el(x,y,rx,ry,col,rot){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fill()}
const shadow=(x,y,rx,ry,a)=>el(x,y,rx,ry,`rgba(20,60,25,${a||.16})`);

// ── 아기: 몸은 기어가는 방향을 따라 돌고, 얼굴은 항상 위를 보게 그려요 ──
// 머리카락 스타일: blond(금발 곱슬), bowl(검은 단발), afro(곱슬 뭉게머리), curly(갈색 곱슬), buns(양갈래 똥머리), red(붉은 머리)
function drawHead(e,x,y,tilt,t){
 const r=13*e.sc;
 c.save();c.translate(x,y);c.rotate(tilt);
 if(e.hs==='afro'){el(0,-r*.12,r*1.3,r*1.24,e.hc);}
 if(e.hs==='buns'){el(-r*.95,-r*.62,r*.46,r*.46,e.hc);el(r*.95,-r*.62,r*.46,r*.46,e.hc)}
 el(-r*.98,r*.06,r*.2,r*.24,e.skin);el(r*.98,r*.06,r*.2,r*.24,e.skin);
 el(0,0,r,r*1.02,e.skin);
 c.save();c.beginPath();c.ellipse(0,0,r,r*1.02,0,0,TAU);c.clip();
 c.fillStyle=e.hc;
 if(e.hs==='blond'){c.beginPath();c.ellipse(0,-r*.7,r*.98,r*.55,0,0,TAU);c.fill()}
 else if(e.hs==='bowl'||e.hs==='buns'){c.beginPath();c.ellipse(0,-r*.62,r*1.04,r*.62,0,0,TAU);c.fill();c.fillRect(-r,-r*.62,r*.3,r*.9);c.fillRect(r*.7,-r*.62,r*.3,r*.9)}
 else if(e.hs==='curly'){c.beginPath();c.ellipse(0,-r*.72,r*.96,r*.5,0,0,TAU);c.fill()}
 else if(e.hs==='red'){c.beginPath();c.ellipse(0,-r*.74,r*.95,r*.48,0,0,TAU);c.fill()}
 else if(e.hs==='afro'){c.beginPath();c.ellipse(0,-r*.66,r*1.0,r*.5,0,0,TAU);c.fill()}
 c.restore();
 c.fillStyle=e.hc;
 if(e.hs==='blond'||e.hs==='curly'){for(let i=-2;i<=2;i++){c.beginPath();c.arc(i*r*.36,-r*(.98-Math.abs(i)*.06),r*.27,0,TAU);c.fill()}}
 if(e.hs==='red'){c.beginPath();c.arc(0,-r*1.05,r*.2,0,TAU);c.arc(r*.28,-r*1.0,r*.14,0,TAU);c.fill()}
 const blink=((t+e.bo)%4.2)<.13;
 c.fillStyle='#2b1d17';c.strokeStyle='#2b1d17';c.lineWidth=r*.08;c.lineCap='round';
 for(const sx of [-1,1]){
  if(blink){c.beginPath();c.arc(sx*r*.36,r*.1,r*.1,.15*Math.PI,.85*Math.PI);c.stroke()}
  else{c.beginPath();c.arc(sx*r*.36,r*.08,r*.105,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(sx*r*.36+r*.03,r*.04,r*.035,0,TAU);c.fill();c.fillStyle='#2b1d17'}
 }
 el(-r*.6,r*.4,r*.2,r*.13,'rgba(255,120,120,.38)');el(r*.6,r*.4,r*.2,r*.13,'rgba(255,120,120,.38)');
 el(0,r*.24,r*.07,r*.05,e.skinD);
 const open=Math.sin(t*1.7+e.bo)>.6;
 c.strokeStyle='#8a3a2e';c.lineWidth=r*.075;c.beginPath();
 if(open){c.fillStyle='#b5453a';c.beginPath();c.ellipse(0,r*.5,r*.2,r*.14,0,0,Math.PI);c.fill()}
 else{c.arc(0,r*.38,r*.2,.2*Math.PI,.8*Math.PI);c.stroke()}
 if(e.hs==='red'){c.fillStyle='rgba(170,90,50,.55)';for(const [fx,fy] of [[-.5,.28],[-.38,.38],[-.62,.38],[.5,.28],[.38,.38],[.62,.38]]){c.beginPath();c.arc(fx*r,fy*r,r*.04,0,TAU);c.fill()}}
 c.restore();
}
function drawBaby(e,t){
 const sc=e.sc;
 c.save();c.translate(e.x,e.y);c.rotate(e.a);c.scale(sc,sc);
 shadow(0,6,34,18,.2);
 const s1=Math.sin(e.ph),s2=Math.sin(e.ph+Math.PI);
 const leg=(side,sw)=>{const hy=side*9;cap(-12,hy,-22+sw*4,hy+side*5,8.5,e.skin);cap(-22+sw*4,hy+side*5,-31+sw*5,hy+side*3,7,e.skin);el(-33+sw*5,hy+side*3,4.4,3.6,e.skinL)};
 leg(-1,s1);leg(1,s2);
 const arm=(side,sw)=>{cap(8,side*10,19+sw*4,side*12.5,7,e.skin);el(21.5+sw*4,side*12.8,4.4,4.4,e.skin)};
 arm(-1,s2);arm(1,s1);
 el(2,0,16,12.5,e.skin);el(5,0,8,7,e.skinL);
 el(-11,0,14,12.8,'#ffffff');el(-11,0,9,8,'#f4f7fb');
 c.strokeStyle='rgba(110,125,150,.5)';c.lineWidth=1.3;c.beginPath();c.ellipse(-11,0,14,12.8,0,0,TAU);c.stroke();
 c.beginPath();c.arc(-1,-11,7,.5,Math.PI-.5);c.stroke();c.beginPath();c.arc(-1,11,7,Math.PI+.5,TAU-.5);c.stroke();   // 다리 둘레 주름
 c.fillStyle=e.tab;c.fillRect(-1,-14.5,6.5,4.5);c.fillRect(-1,10,6.5,4.5);                                              // 양쪽 테이프
 c.strokeStyle=e.tab;c.lineWidth=2.2;c.beginPath();c.moveTo(1.5,-9);c.lineTo(1.5,9);c.stroke();                        // 허리 밴드
 c.restore();
 const hx=e.x+Math.cos(e.a)*26*sc,hy=e.y+Math.sin(e.a)*26*sc-3*sc;
 drawHead(e,hx,hy,clamp(Math.sin(e.a)*.12+Math.sin(t*.9+e.bo)*.05,-.25,.25),t);
}
// ── 앉은 어른 ──
function drawSitter(e,t){
 c.save();c.translate(e.x,e.y);c.rotate(e.a+Math.sin(t*.6+e.sw)*.05);c.scale(e.sc,e.sc);
 el(5,10,22,19,'rgba(20,60,25,.09)');
 cap(-2,-9,13,-15,7,e.pants);cap(-2,9,13,15,7,e.pants);el(14,-15,4.2,4.2,e.skin);el(14,15,4.2,4.2,e.skin);
 el(0,0,11,20,e.top);
 if(e.apron)el(3,0,6.5,13,e.apron);
 const wv=Math.sin(t*2.2+e.sw)*5;
 cap(2,-17,17+wv,-10+(e.hold?6:0),5,e.top);cap(2,17,17-wv,10-(e.hold?6:0),5,e.top);
 el(17+wv,-10+(e.hold?6:0),3.4,3.4,e.skin);el(17-wv,10-(e.hold?6:0),3.4,3.4,e.skin);
 if(e.hold){const b=Math.sin(t*1.4)*.8;el(16,b,9,6.5,'#ffffff');el(24,b,5.2,5.2,e.babySkin);el(22.6,b,4.8,4.7,e.babyHair)}
 el(5,0,9.4,9.4,e.skin);
 if(e.afro){el(1.5,0,12.4,12.2,e.hair);el(6.2,0,7.2,7.6,e.skin)}else el(2.8,0,8.8,8.7,e.hair);
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
 c.save();c.translate(x+16*U,y+22*U);c.rotate(b.a);c.fillStyle='rgba(20,60,25,.13)';c.beginPath();c.ellipse(0,-4*U*fl,5*U,7.5*U*(.3+fl*.7),0,0,TAU);c.ellipse(0,4*U*fl,5*U,7.5*U*(.3+fl*.7),0,0,TAU);c.fill();c.restore();
 c.save();c.translate(x,y);c.rotate(b.a);c.scale(U*b.sc*1.3,U*b.sc*1.3);
 c.fillStyle=b.c1;c.beginPath();c.ellipse(-1,-6*fl-1,6,9,-.5,0,TAU);c.ellipse(-1,6*fl+1,6,9,.5,0,TAU);c.fill();
 c.fillStyle=b.c2;c.beginPath();c.ellipse(-6,-4*fl,3.8,5.5,-.9,0,TAU);c.ellipse(-6,4*fl,3.8,5.5,.9,0,TAU);c.fill();
 c.strokeStyle='rgba(60,40,30,.8)';c.lineWidth=1.6;c.beginPath();c.moveTo(-8,0);c.lineTo(8,0);c.stroke();
 c.lineWidth=.9;c.beginPath();c.moveTo(8,0);c.lineTo(13,-3);c.moveTo(8,0);c.lineTo(13,3);c.stroke();
 c.restore();
}
function drawBall(b){shadow(b.x+3,b.y+5,10*U,7*U,.2);c.fillStyle='#ef6b5a';c.beginPath();c.arc(b.x,b.y,10*U,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,10*U,.2,1.3);c.lineTo(b.x,b.y);c.fill();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(b.x-3*U,b.y-4*U,3*U,0,TAU);c.fill()}

// ── 장면 구성 ──
function build(){
 U=clamp(H/520,.72,1.5);
 const bx=W*.70,by=H*.56,bw=470*U,bh=300*U,ba=-.06;
 const toW=(lx,ly)=>({x:bx+Math.cos(ba)*lx-Math.sin(ba)*ly,y:by+Math.sin(ba)*lx+Math.cos(ba)*ly});
 // 다양한 아기들: [머리 스타일, 머리색, 피부색, 밝은 피부색(발바닥·배), 피부 그늘색, 기저귀 끈 색]
 const KIDS=[
  ['blond','#f1cf74','#fbd9c4','#fde8da','#e9b79b','#7ec8e3'],
  ['afro','#241813','#7a4a33','#94604a','#5e3623','#ffb3c7'],
  ['bowl','#241b17','#f3cfa5','#f8e0c4','#d9a979','#a8d98a'],
  ['curly','#6b4a34','#d39e6f','#e2b588','#b57d52','#ffd45c'],
  ['buns','#1d1613','#ae7a52','#c4906a','#8a5a38','#c8a4ff'],
  ['red','#c8622e','#fde1d0','#feeee4','#eab99f','#7ec8e3']];
 const mkBaby=(x,y,i,bounds,sp)=>{const k=KIDS[i];return{k:'baby',x,y,a:rr(0,TAU),sc:1.32*U,ph:rr(0,TAU),sp:sp*U,bounds,tgt:null,pause:rr(0,2),hs:k[0],hc:k[1],skin:k[2],skinL:k[3],skinD:k[4],tab:k[5],bo:rr(0,4)}};
 const blanketB={x0:W*.54,x1:W*.93,y0:H*.18,y1:H*.86};
 const grassB={x0:W*.5,x1:W*.96,y0:H*.14,y1:H*.9};
 const S={bx,by,bw,bh,ba,babies:[],butter:[],ball:null};
 S.babies=[mkBaby(bx-bw*.12,by+bh*.02,0,blanketB,20),mkBaby(bx+bw*.14,by-bh*.1,1,blanketB,18),mkBaby(bx+bw*.04,by+bh*.18,2,blanketB,17),
  mkBaby(W*.58,H*.72,3,grassB,24),mkBaby(W*.8,H*.3,4,grassB,22),mkBaby(W*.9,H*.78,5,grassB,21)];
 const care=toW(-bw*.46,bh*.16),mom=toW(bw*.4,-bh*.18);
 S.care={k:'sitter',x:care.x,y:care.y,a:ba,sc:3.0*U,sw:0,skin:'#e6b78d',hair:'#241b17',top:'#ffffff',pants:'#7a8fb5',apron:'#4aa58e',bun:true};
 S.mom={k:'sitter',x:mom.x,y:mom.y,a:ba+Math.PI-.1,sc:3.0*U,sw:2,skin:'#8a5638',hair:'#241813',afro:true,top:'#ffb3a7',pants:'#556',hold:true,babySkin:'#9a6446',babyHair:'#241813'};
 S.dad={k:'sitter',x:W*.58,y:H*.3,a:.5,sc:3.0*U,sw:4,skin:'#fbd9c4',hair:'#c28b4a',top:'#5b87c6',pants:'#3b4a63'};
 S.pup={k:'puppy',x:W*.86,y:H*.62,a:3,sc:1.7*U,ph:0,sp:80*U,bounds:grassB,moving:0,pause:0};
 S.bun={k:'bunny',x:W*.52,y:H*.8,a:0,sc:1.6*U,hop:0,wait:1,from:null,to:null,bounds:grassB};
 const kp=toW(bw*.4,bh*.32);S.kit={k:'kitten',x:kp.x,y:kp.y,a:ba+2.6,sc:1.7*U};
 S.ball={x:W*.8,y:H*.5,vx:0,vy:0,bounds:grassB};
 const cols=[['#ffd45c','#ff9a3c'],['#ff9ec7','#ff6fa5'],['#9fd0ff','#5aa6ff'],['#fff','#ffd9a8'],['#ffb36b','#ff7a3a'],['#d9b8ff','#a97bff']];
 for(let i=0;i<7;i++){const k=cols[i%cols.length];S.butter.push({cx:W*rr(.45,.95),cy:H*rr(.12,.88),rx:rr(60,150)*U,ry:rr(30,80)*U,sx:rr(.25,.55),sy:rr(.3,.6),ph:rr(0,TAU),fp:rr(0,TAU),fs:rr(9,14),c1:k[0],c2:k[1],sc:rr(.8,1.15),x:0,y:0,a:0,vx:rr(-12,12),dx:0})}
 S.toys=[];const tc=['#ff8f7a','#ffd45c','#7ec8e3','#a8d98a'];
 for(let i=0;i<4;i++){const p=toW(-bw*.12+i*52*U,-bh*.36+(i%2)*28*U);S.toys.push({x:p.x,y:p.y,a:rr(0,TAU),c:tc[i]})}
 S.ted=toW(bw*.2,bh*.34);
 scene=S;
}
function pick(e){const b=e.bounds;e.tgt={x:rr(b.x0,b.x1),y:rr(b.y0,b.y1)}}
function step(e,dt){
 if(e.pause>0){e.pause-=dt;e.moving=0;return}
 if(!e.tgt)pick(e);
 const dx=e.tgt.x-e.x,dy=e.tgt.y-e.y,d=Math.hypot(dx,dy);
 e.a+=angDiff(e.a,Math.atan2(dy,dx))*clamp(dt*2.6,0,1);
 const sp=e.sp*clamp(d/60,.3,1)*(1-Math.abs(angDiff(e.a,Math.atan2(dy,dx)))/Math.PI*.7);
 e.x+=Math.cos(e.a)*sp*dt;e.y+=Math.sin(e.a)*sp*dt;e.ph+=sp*dt*.13;e.moving=sp>8;
 if(d<18*U){pick(e);if(R()<.4)e.pause=rr(.8,2.6)}
}
function update(dt,t){
 const S=scene;
 S.babies.forEach(b=>step(b,dt));
 for(let i=0;i<S.babies.length;i++)for(let j=i+1;j<S.babies.length;j++){
  const a=S.babies[i],b=S.babies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,m=96*U;
  if(d<m){const k=(m-d)/d*.5*Math.min(1,dt*4);a.x-=dx*k;a.y-=dy*k;b.x+=dx*k;b.y+=dy*k}
 }
 const p=S.pup,b=S.ball;p.tgt={x:b.x,y:b.y};
 b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.pow(.5,dt);b.vy*=Math.pow(.5,dt);
 if(b.x<b.bounds.x0||b.x>b.bounds.x1)b.vx*=-1;if(b.y<b.bounds.y0||b.y>b.bounds.y1)b.vy*=-1;
 b.x=clamp(b.x,b.bounds.x0,b.bounds.x1);b.y=clamp(b.y,b.bounds.y0,b.bounds.y1);
 if(Math.hypot(p.x-b.x,p.y-b.y)<26*U&&p.pause<=0){const a=R()*TAU;b.vx=Math.cos(a)*150*U;b.vy=Math.sin(a)*150*U;p.pause=.5}
 if(p.pause>0){p.pause-=dt;p.moving=0}else{const dx=b.x-p.x,dy=b.y-p.y;p.a+=angDiff(p.a,Math.atan2(dy,dx))*clamp(dt*7,0,1);const sp=p.sp*clamp(Math.hypot(dx,dy)/60,.2,1);p.x+=Math.cos(p.a)*sp*dt;p.y+=Math.sin(p.a)*sp*dt;p.ph+=sp*dt*.35;p.moving=sp>10}
 const u=S.bun;
 if(u.from){u.hop+=dt/.55;const k=Math.min(1,u.hop);u.x=lerp(u.from.x,u.to.x,k);u.y=lerp(u.from.y,u.to.y,k);if(u.hop>=1){u.from=null;u.hop=0;u.wait=rr(.5,2.2)}}
 else{u.wait-=dt;if(u.wait<=0){const a=rr(0,TAU),d=rr(30,55)*U;u.from={x:u.x,y:u.y};u.to={x:clamp(u.x+Math.cos(a)*d,u.bounds.x0,u.bounds.x1),y:clamp(u.y+Math.sin(a)*d,u.bounds.y0,u.bounds.y1)};u.a=Math.atan2(u.to.y-u.y,u.to.x-u.x);u.hop=.001}}
 const look=(h)=>{let n=S.babies[0],bd=1e9;S.babies.forEach(bb=>{const d=Math.hypot(bb.x-h.x,bb.y-h.y);if(d<bd){bd=d;n=bb}});h.a+=angDiff(h.a,Math.atan2(n.y-h.y,n.x-h.x))*clamp(dt*2,0,1)};
 look(S.care);look(S.dad);
 S.butter.forEach(f=>{
  f.fp+=dt*f.fs;f.dx+=f.vx*dt;
  const nx=f.cx+f.dx+f.rx*Math.sin(t*f.sx+f.ph),ny=f.cy+f.ry*Math.sin(t*f.sy+f.ph*1.7);
  f.a=Math.atan2(ny-f.y,nx-f.x);f.x=nx;f.y=ny;
  if(f.cx+f.dx>W*1.02||f.cx+f.dx<W*.35)f.vx*=-1;
 });
}

// ── 프레임 그리기 ──
function rrect(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function frame(){
 const S=scene;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const z=1.03+Math.sin(t*.05)*.012,cx=Math.sin(t*.07)*14*U,cy=Math.cos(t*.06)*9*U;
 c.save();c.translate(W/2+cx,H/2+cy);c.scale(z,z);c.translate(-W/2,-H/2);
 c.drawImage(bg,-60*U,-60*U,W+120*U,H+120*U);
 S.toys.forEach(o=>{c.save();c.translate(o.x,o.y);c.rotate(o.a);shadow(2,3,12*U,11*U,.16);c.fillStyle=o.c;rrect(-11*U,-11*U,22*U,22*U,5*U);c.fill();c.restore()});
 c.save();c.translate(S.ted.x,S.ted.y);c.scale(1.4*U,1.4*U);shadow(3,5,13,12,.18);el(0,0,10,10,'#b97f4e');el(-8,-8,4,4,'#b97f4e');el(8,-8,4,4,'#b97f4e');el(0,-1,6,6,'#d4a273');c.restore();
 drawBall(S.ball);
 const L=S.babies.concat([S.pup,S.bun,S.kit,S.care,S.mom,S.dad]).sort((a,b)=>a.y-b.y);
 L.forEach(e=>{
  if(e.k==='baby')drawBaby(e,t);else if(e.k==='sitter')drawSitter(e,t);else if(e.k==='puppy')drawPuppy(e,t);else if(e.k==='bunny')drawBunny(e);else if(e.k==='kitten')drawKitten(e,t);
 });
 S.butter.forEach(f=>drawButterfly(f,t));
 c.restore();
 for(let i=0;i<3;i++){const x=((t*(10+i*4)+i*W*.4)%(W*1.6))-W*.3,y=H*(.25+i*.28);const g=c.createRadialGradient(x,y,0,x,y,W*.28);g.addColorStop(0,i%2?'rgba(10,50,20,.10)':'rgba(255,255,230,.16)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
 const v=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,50,30,.28)');c.fillStyle=v;c.fillRect(0,0,W,H);
}
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
 t=0;for(let i=0;i<150;i++){t+=.04;update(.04,t)}frame();
}
// 실제 영상 파일이 있으면 애니메이션 대신 사용 (재생 가능할 때만 전환)
if(HERO_VIDEO&&!reduce){
 const v=document.createElement('video');v.className='hero-media hero-video';v.src=HERO_VIDEO;v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto';v.setAttribute('aria-hidden','true');v.style.opacity='0';
 v.addEventListener('canplaythrough',()=>{v.play().then(()=>{v.style.opacity='1';stop();setTimeout(()=>{cv.style.display='none'},900)}).catch(()=>v.remove())},{once:true});
 v.addEventListener('error',()=>v.remove());
 cv.after(v);
}
window.__hero={size,stop,start,step(dt){t+=dt;update(dt,t);frame()},frame};
size();
if(reduce){frame()}else{
 start();
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 if('IntersectionObserver' in window)new IntersectionObserver(es=>es[0].isIntersecting?start():stop()).observe(hero);
}
let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,200)});
})();
