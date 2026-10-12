// 메인 화면 초록 영역 배경: 하늘에서 내려다본 평화로운 공원 잔디밭
// 다양한 아기들이 각자 앉아 있거나 천천히 기어다니고, 강아지·나비·꽃과 어우러지는 장면입니다.
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
 for(let i=0;i<Math.round(w*h/5200);i++){ // 들꽃: 데이지·민들레·클로버
  const x=r()*w,y=r()*h,k=r();
  if(k<.5){g.fillStyle='rgba(255,255,255,.92)';for(let j=0;j<6;j++){g.beginPath();g.arc(x+Math.cos(j*TAU/6)*3.2*U,y+Math.sin(j*TAU/6)*3.2*U,2.1*U,0,TAU);g.fill()}g.fillStyle='#f4c84a';g.beginPath();g.arc(x,y,2*U,0,TAU);g.fill()}
  else if(k<.8){g.fillStyle='rgba(255,226,100,.95)';g.beginPath();g.arc(x,y,3*U,0,TAU);g.fill();g.fillStyle='rgba(255,246,170,.9)';g.beginPath();g.arc(x-.8*U,y-.8*U,1.4*U,0,TAU);g.fill()}
  else{g.fillStyle='rgba(255,170,200,.92)';for(let j=0;j<5;j++){g.beginPath();g.arc(x+Math.cos(j*TAU/5)*2.6*U,y+Math.sin(j*TAU/5)*2.6*U,1.8*U,0,TAU);g.fill()}g.fillStyle='#fff3b0';g.beginPath();g.arc(x,y,1.4*U,0,TAU);g.fill()}
 }
 return o;
}

// ── 그리기 도구 ──
function cap(x1,y1,x2,y2,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function el(x,y,rx,ry,col,rot){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fill()}
const shadow=(x,y,rx,ry,a)=>el(x,y,rx,ry,`rgba(20,60,25,${a||.16})`);
function bumps(cx,cy,r,n,br,col,off){c.fillStyle=col;for(let i=0;i<n;i++){const a=i/n*TAU+off;c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,br,0,TAU);c.fill()}}

// ── 아기 머리 (위에서 본 정수리, 얼굴은 보이지 않아요) ──
// 머리 스타일: blond(금발 곱슬), bowl(검은 직모), afro(곱슬 뭉게머리), curly(갈색 곱슬), buns(양갈래 똥머리), red(붉은 머리)
function headTop(e,hx){
 if(e.hs==='afro'){bumps(hx,0,10,12,4.4,e.hc,0);el(hx,0,11,11,e.hc);bumps(hx,0,6,6,3.8,e.hc2,.3);return}
 el(hx,0,10.2,10.6,e.skin);
 el(hx,-10.6,2.4,3.3,e.skin);el(hx,10.6,2.4,3.3,e.skin);
 if(e.hs==='buns'){el(hx-3,-11.5,4.6,4.6,e.hc);el(hx-3,11.5,4.6,4.6,e.hc)}
 if(e.hs==='blond'||e.hs==='curly')bumps(hx,0,8.2,11,3.1,e.hc,0);
 el(hx-.5,0,9.4,9.8,e.hc);
 c.fillStyle=e.hc2;c.beginPath();c.ellipse(hx-2.5,-2.8,5.2,3.2,-.5,0,TAU);c.fill();
 c.strokeStyle=e.hc3;c.lineWidth=1.1;c.beginPath();c.arc(hx-2,1.2,2.8,.2,Math.PI*1.5);c.stroke();
 if(e.hs==='red'){c.strokeStyle=e.hc2;c.lineWidth=1.6;c.beginPath();c.moveTo(hx+6,-3);c.quadraticCurveTo(hx+11,-1,hx+9.5,4);c.stroke()}
}
function diaperShape(x,rx,ry){
 el(x,0,rx,ry,'#ffffff');el(x-1,0,rx-3.5,ry-4,'#eef2f8');
 c.strokeStyle='rgba(110,125,150,.55)';c.lineWidth=1.2;c.beginPath();c.ellipse(x,0,rx,ry,0,0,TAU);c.stroke();
}

// ── 기어가는 아기 ──
function drawCrawl(e,t){
 const sc=e.sc,sw=Math.sin(e.ph),sw2=Math.sin(e.ph+Math.PI);
 c.save();c.translate(e.x,e.y);c.rotate(e.a);
 c.save();c.rotate(-e.a);c.translate(7*sc,10*sc);c.rotate(e.a);c.scale(sc,sc);el(-2,0,38,17,'rgba(20,60,25,.22)');c.restore();
 c.scale(sc,sc);c.translate(0,Math.sin(e.ph*2)*.9);
 for(const [side,w] of [[-1,sw],[1,sw2]]){
  const hy=side*8.5,kx=-22+w*5,ky=side*13.5,fx=-34+w*6,fy=side*8;
  cap(-12,hy,kx,ky,9.5,e.skin);cap(kx,ky,fx,fy,7.6,e.skin);el(fx-1.5,fy,5,3.6,e.skinL,side*.4);
 }
 for(const [side,w] of [[-1,sw2],[1,sw]]){
  const ex=14+w*3,ey=side*16,hx=25+w*5,hy2=side*11.5;
  cap(8,side*12,ex,ey,7,e.skin);cap(ex,ey,hx,hy2,6.2,e.skin);el(hx+1.5,hy2,4.3,4,e.skinL);
 }
 el(2,0,15,12.8,e.skin);el(4,0,10,8,e.skinL);
 c.strokeStyle=e.skinD;c.globalAlpha=.4;c.lineWidth=1.4;c.beginPath();c.moveTo(-3,0);c.lineTo(13,0);c.stroke();c.globalAlpha=1;
 el(7,-5,5,4,e.skinD,.3);
 diaperShape(-12,13.5,14);
 c.strokeStyle='rgba(110,125,150,.55)';c.lineWidth=1.2;c.beginPath();c.moveTo(-24,0);c.lineTo(-5,0);c.stroke();
 c.beginPath();c.arc(-9,-12,6,.5,Math.PI-.5);c.stroke();c.beginPath();c.arc(-9,12,6,Math.PI+.5,TAU-.5);c.stroke();
 c.fillStyle=e.tab;c.fillRect(-4.5,-15,6.5,4.6);c.fillRect(-4.5,10.4,6.5,4.6);
 c.strokeStyle=e.tab;c.lineWidth=2;c.beginPath();c.moveTo(-2,-10);c.lineTo(-2,10);c.stroke();
 el(14,0,5,6.5,e.skin);headTop(e,22);
 c.restore();
}
// ── 앉아 있는 아기 (위에서 본 모습: 다리를 앞으로 벌리고 앉아요) ──
function drawSit(e,t){
 const sc=e.sc,br=Math.sin(t*1.3+e.bo)*.5;
 c.save();c.translate(e.x,e.y);c.rotate(e.a);
 c.save();c.rotate(-e.a);c.translate(7*sc,10*sc);c.rotate(e.a);c.scale(sc,sc);el(6,0,30,22,'rgba(20,60,25,.2)');c.restore();
 c.scale(sc,sc);
 diaperShape(-12,14.5,15.5);c.fillStyle=e.tab;c.fillRect(-13,-17,6.5,4.8);c.fillRect(-13,12.2,6.5,4.8);
 for(const side of [-1,1]){
  const kx=14,ky=side*12,fx=29+(side<0?Math.sin(t*.9+e.bo)*1.5:0),fy=side*17;
  cap(-3,side*8,kx,ky,11.5,e.skin);cap(kx,ky,fx,fy,9,e.skin);el(fx+2,fy,5.6,4.6,e.skinL,side*.5);
 }
 el(-2,0,13,16,e.skin);el(-1,0,8.5,10,e.skinL);
 c.strokeStyle=e.skinD;c.globalAlpha=.35;c.lineWidth=1.3;c.beginPath();c.moveTo(-9,0);c.lineTo(6,0);c.stroke();c.globalAlpha=1;
 const act=e.curAct,T=e.targetNow;
 const armTo=(side,hx,hy,ex,ey)=>{cap(-2,side*14,ex,ey,8.4,e.skin);cap(ex,ey,hx,hy,7.4,e.skin);el(hx+1,hy,5,4.7,e.skinL)};
 if(act==='reach'&&T){
  const dx=T.x-e.x,dy=T.y-e.y,la=Math.atan2(dy,dx)-e.a,L=26+Math.sin(t*2.2+e.bo)*2.5,sd=Math.sin(la)<0?-1:1;
  const hx=Math.cos(la)*L,hy=Math.sin(la)*L;armTo(sd,hx,hy,hx*.5,hy*.5+sd*4);armTo(-sd,10,-sd*22,5,-sd*19);
 }else if(act==='pet'&&T){
  const dx=T.x-e.x,dy=T.y-e.y,la=Math.atan2(dy,dx)-e.a,L=24,sd=Math.sin(la)<0?-1:1;
  const sway=Math.sin(t*3.2+e.bo)*5,hx=Math.cos(la)*L-Math.sin(la)*sway,hy=Math.sin(la)*L+Math.cos(la)*sway;armTo(sd,hx,hy,hx*.5,hy*.5+sd*4);armTo(-sd,10,-sd*22,5,-sd*19);
 }else if(act==='flower'){
  const w=Math.sin(t*1.6+e.bo)*1.5;armTo(-1,20,-6+w,8,-17);armTo(1,20,6-w,8,17);
  c.strokeStyle='#5aa14a';c.lineWidth=1.6;c.beginPath();c.moveTo(18,-5+w);c.lineTo(31,0);c.stroke();
  c.fillStyle='#ffe066';c.beginPath();c.arc(32,0,4.4,0,TAU);c.fill();c.fillStyle='#fff7b0';c.beginPath();c.arc(31,-1,1.8,0,TAU);c.fill();
  c.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<6;i++){c.beginPath();c.arc(32+Math.cos(i)*7,Math.sin(i)*7,1.6,0,TAU);c.fill()}
 }else if(act==='toy'){
  const w=Math.sin(t*1.2+e.bo)*1.2;armTo(-1,21,-5+w,8,-17);armTo(1,21,5-w,8,17);
  c.save();c.translate(25,0);c.rotate(Math.sin(t*.8+e.bo)*.15);c.fillStyle=e.toyC;c.beginPath();c.rect(-6,-6,12,12);c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.2;c.strokeRect(-3.5,-3.5,7,7);c.restore();
 }else{
  const w=Math.sin(t*.9+e.bo)*2;armTo(-1,16,-24+w,5,-19);armTo(1,16,24-w,5,19);
 }
 el(-2,0,6,6.5,e.skin);
 c.save();c.translate(0,br*.3);headTop(e,3);c.restore();
 c.restore();
}
// ── 앉은 어른 ──
function drawSitter(e,t){
 c.save();c.translate(e.x,e.y);c.rotate(e.a+Math.sin(t*.6+e.sw)*.05);c.scale(e.sc,e.sc);
 el(5,10,22,19,'rgba(20,60,25,.09)');
 cap(-2,-9,13,-15,7,e.pants);cap(-2,9,13,15,7,e.pants);el(14,-15,4.2,4.2,e.skin);el(14,15,4.2,4.2,e.skin);
 el(0,0,11,20,e.top);
 if(e.apron)el(3,0,6.5,13,e.apron);
 const wv=Math.sin(t*1.2+e.sw)*3;
 cap(2,-17,17+wv,-10+(e.hold?6:0),5,e.top);cap(2,17,17-wv,10-(e.hold?6:0),5,e.top);
 el(17+wv,-10+(e.hold?6:0),3.4,3.4,e.skin);el(17-wv,10-(e.hold?6:0),3.4,3.4,e.skin);
 if(e.hold){const b=Math.sin(t*1.1)*.8;el(16,b,9,6.5,'#ffffff');el(24,b,5.2,5.2,e.babySkin);el(22.6,b,4.8,4.7,e.babyHair)}
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
 const tw=Math.sin(t*(e.moving?18:e.happy?14:6))*(e.moving||e.happy?.7:.4);
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
 // 아기: [머리 스타일, 머리색, 윤기색, 가마색, 피부색, 밝은 피부, 그늘 피부, 기저귀 테이프색]
 const KIDS=[
  ['blond','#e9c564','#f7e09a','#c9a43f','#fbd5bd','#fde6d6','#e4a98c','#7ec8e3'],
  ['afro','#21160f','#3b2a20','#21160f','#74452e','#8d5a40','#58311f','#ffb3c7'],
  ['bowl','#1d1613','#4a3a33','#0d0908','#f1cba0','#f8e0c4','#d6a574','#a8d98a'],
  ['curly','#6b4a34','#8e6a4c','#4c3322','#d39e6f','#e2b588','#b57d52','#ffd45c'],
  ['buns','#1a1311','#463631','#0d0908','#a9744c','#c08c66','#85563a','#c8a4ff'],
  ['red','#c1592a','#e08a52','#9a4220','#fde0cf','#feeee4','#e8b79c','#7ec8e3'],
  ['afro','#2b1d14','#4a3426','#2b1d14','#8d5b3d','#a8745a','#6a3f29','#ffd45c'],
  ['bowl','#2a201b','#5a4a40','#14100d','#c68e5f','#d9a67c','#a06e46','#ffb3c7']];
 const area={x0:W*.5,x1:W*.96,y0:H*.12,y1:H*.9};
 // mk(위치, 아이, 처음 상태, 평소 행동들, 앉아 있는 시간 범위, 기어가는 속도)
 const mk=(fx,fy,i,mode,acts,sitT,sp)=>{const k=KIDS[i];return{k:'baby',x:W*fx,y:H*fy,a:rr(0,TAU),a0:rr(0,TAU),sc:1.0*U,ph:rr(0,TAU),sp:sp*U,tgt:null,mode,acts,sitT,curAct:acts[0],targetNow:null,modeT:rr(4,12),bo:rr(0,6),toyC:['#ff8f7a','#ffd45c','#7ec8e3','#a8d98a'][i%4],hs:k[0],hc:k[1],hc2:k[2],hc3:k[3],skin:k[4],skinL:k[5],skinD:k[6],tab:k[7],area}};
 const S={babies:[],butter:[],ball:null,seeds:[],canopy:[]};
 S.babies=[
  mk(.60,.30,0,'sit',['reach'],[30,50],10),      // 나비를 보며 손을 뻗는 아기
  mk(.76,.18,1,'crawl',['idle','toy'],[10,20],11),
  mk(.72,.62,2,'sit',['idle'],[40,60],10),       // 강아지와 노는 아기
  mk(.90,.34,3,'sit',['flower'],[25,45],10),     // 민들레를 든 아기
  mk(.62,.78,4,'crawl',['idle','toy'],[10,22],12),
  mk(.86,.72,5,'sit',['idle','toy'],[14,26],10),
  mk(.80,.50,6,'sit',['idle'],[40,60],10),       // 두 번째로 강아지와 노는 아기
  mk(.55,.52,7,'crawl',['idle'],[12,24],11)];
 S.babies[0].bf=0;S.babies[3].bf=1;S.babies[2].pets=true;S.babies[6].pets=true;
 S.care={k:'sitter',x:W*.58,y:H*.9,a:-.9,sc:1.5*U,sw:0,skin:'#e6b78d',hair:'#241b17',top:'#ffffff',pants:'#7a8fb5',apron:'#4aa58e',bun:true};
 S.mom={k:'sitter',x:W*.94,y:H*.58,a:Math.PI+.3,sc:1.5*U,sw:2,skin:'#8a5638',hair:'#241813',afro:true,top:'#ffb3a7',pants:'#556',hold:true,babySkin:'#9a6446',babyHair:'#241813'};
 S.pup={k:'puppy',x:W*.8,y:H*.8,a:3,sc:1.25*U,ph:0,sp:55*U,moving:0,pause:0,mode:'visit',vis:2,modeT:10,happy:false};
 S.bun={k:'bunny',x:W*.52,y:H*.84,a:0,sc:1.15*U,hop:0,wait:1,from:null,to:null,bounds:area};
 S.kit={k:'kitten',x:W*.76,y:H*.92,a:2.6,sc:1.25*U};
 S.ball={x:W*.66,y:H*.44,vx:0,vy:0,bounds:area};
 const cols=[['#ffd45c','#ff9a3c'],['#ff9ec7','#ff6fa5'],['#9fd0ff','#5aa6ff'],['#fff','#ffd9a8'],['#ffb36b','#ff7a3a'],['#d9b8ff','#a97bff']];
 for(let i=0;i<6;i++){const k=cols[i%cols.length];S.butter.push({cx:W*rr(.5,.95),cy:H*rr(.15,.85),rx:rr(60,140)*U,ry:rr(30,70)*U,sx:rr(.22,.4),sy:rr(.25,.45),ph:rr(0,TAU),fp:rr(0,TAU),fs:rr(8,12),c1:k[0],c2:k[1],sc:rr(.8,1.1),x:0,y:0,a:0,vx:rr(-8,8),dx:0,att:-1})}
 S.butter[0].att=0;S.butter[1].att=3;S.butter[0].rx=S.butter[1].rx=34*U;S.butter[0].ry=S.butter[1].ry=24*U;
 S.toys=[];const tc=['#ff8f7a','#ffd45c','#7ec8e3','#a8d98a'];
 for(let i=0;i<4;i++){S.toys.push({x:W*rr(.55,.94),y:H*rr(.15,.88),a:rr(0,TAU),c:tc[i%4]})}
 for(let i=0;i<14;i++)S.seeds.push({x:W*rr(.4,1),y:H*rr(0,1),vx:rr(4,12),ph:rr(0,TAU),s:rr(.7,1.2)});
 for(let i=0;i<14;i++)S.canopy.push({x:W*(.78+rr(-.22,.3)),y:H*(.0+rr(-.2,.55)),r:rr(70,150)*U,ph:rr(0,TAU)});
 scene=S;
}
function pick(e){const b=e.area;e.tgt={x:clamp(e.x+rr(-130,130)*U,b.x0,b.x1),y:clamp(e.y+rr(-100,100)*U,b.y0,b.y1)}}
function babyAI(e,dt,t,S){
 e.modeT-=dt;
 const pup=S.pup;
 if(e.mode==='sit'){
  e.moving=0;
  let act=e.curAct,T=null;
  if(e.pets&&pup.vis!==undefined&&S.babies[pup.vis]===e&&Math.hypot(pup.x-e.x,pup.y-e.y)<95*U){act='pet';T=pup}
  else if(e.bf!==undefined){act='reach';T=S.butter[e.bf]}
  else if(act==='pet'||act==='reach'){act=e.acts[0]==='reach'?'idle':e.acts[0]}
  e.curAct=act;e.targetNow=T;
  const want=T?Math.atan2(T.y-e.y,T.x-e.x):e.a0+Math.sin(t*.25+e.bo)*.6;
  e.a+=angDiff(e.a,want)*clamp(dt*1.4,0,1);
  if(e.modeT<=0){
   if(!e.pets&&e.bf===undefined){e.mode='crawl';pick(e);e.modeT=rr(5,9);e.curAct='idle'}
   else e.modeT=rr(e.sitT[0],e.sitT[1]);
  }
 }else{
  if(!e.tgt)pick(e);
  const dx=e.tgt.x-e.x,dy=e.tgt.y-e.y,d=Math.hypot(dx,dy);
  e.a+=angDiff(e.a,Math.atan2(dy,dx))*clamp(dt*2,0,1);
  const sp=e.sp*clamp(d/50,.25,1)*(1-Math.abs(angDiff(e.a,Math.atan2(dy,dx)))/Math.PI*.7);
  e.x+=Math.cos(e.a)*sp*dt;e.y+=Math.sin(e.a)*sp*dt;e.ph+=sp*dt*.14;e.moving=sp>5;
  if(d<14*U||e.modeT<=0){e.mode='sit';e.modeT=rr(e.sitT[0],e.sitT[1]);e.a0=e.a;e.curAct=e.acts[Math.floor(R()*e.acts.length)];e.tgt=null}
 }
}
function update(dt,t){
 const S=scene;
 S.babies.forEach(b=>babyAI(b,dt,t,S));
 for(let i=0;i<S.babies.length;i++)for(let j=i+1;j<S.babies.length;j++){
  const a=S.babies[i],b=S.babies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,m=80*U;
  if(d<m){const k=(m-d)/d*.5*Math.min(1,dt*3);if(a.mode==='crawl'){a.x-=dx*k;a.y-=dy*k}if(b.mode==='crawl'){b.x+=dx*k;b.y+=dy*k}}
 }
 // 강아지: 아기 곁에 머물기 ↔ 공 놀이
 const p=S.pup,b=S.ball;p.modeT-=dt;
 b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.pow(.5,dt);b.vy*=Math.pow(.5,dt);
 if(b.x<b.bounds.x0||b.x>b.bounds.x1)b.vx*=-1;if(b.y<b.bounds.y0||b.y>b.bounds.y1)b.vy*=-1;
 b.x=clamp(b.x,b.bounds.x0,b.bounds.x1);b.y=clamp(b.y,b.bounds.y0,b.bounds.y1);
 if(p.modeT<=0){
  if(p.mode==='visit'){p.mode='ball';p.modeT=rr(6,9);p.nextVis=p.vis===2?6:2;p.vis=undefined}
  else{p.mode='visit';p.modeT=rr(14,22);p.vis=p.nextVis||2}
  p.happy=false;
 }
 let tx,ty,stay=false;
 if(p.mode==='visit'){const f=S.babies[p.vis];tx=f.x-Math.sin(f.a)*34*U+Math.cos(f.a)*18*U;ty=f.y+Math.cos(f.a)*34*U+Math.sin(f.a)*18*U;stay=Math.hypot(tx-p.x,ty-p.y)<14*U}
 else{tx=b.x;ty=b.y;if(Math.hypot(p.x-b.x,p.y-b.y)<22*U&&p.pause<=0){const a=R()*TAU;b.vx=Math.cos(a)*110*U;b.vy=Math.sin(a)*110*U;p.pause=.7}}
 p.happy=stay;
 if(p.pause>0){p.pause-=dt;p.moving=0}
 else if(stay){p.moving=0;const f=S.babies[p.vis];p.a+=angDiff(p.a,Math.atan2(f.y-p.y,f.x-p.x))*clamp(dt*3,0,1)}
 else{const dx=tx-p.x,dy=ty-p.y;p.a+=angDiff(p.a,Math.atan2(dy,dx))*clamp(dt*5,0,1);const sp=p.sp*clamp(Math.hypot(dx,dy)/70,.2,1);p.x+=Math.cos(p.a)*sp*dt;p.y+=Math.sin(p.a)*sp*dt;p.ph+=sp*dt*.35;p.moving=sp>8}
 const u=S.bun;
 if(u.from){u.hop+=dt/.6;const k=Math.min(1,u.hop);u.x=lerp(u.from.x,u.to.x,k);u.y=lerp(u.from.y,u.to.y,k);if(u.hop>=1){u.from=null;u.hop=0;u.wait=rr(1.5,4)}}
 else{u.wait-=dt;if(u.wait<=0){const a=rr(0,TAU),d=rr(26,45)*U;u.from={x:u.x,y:u.y};u.to={x:clamp(u.x+Math.cos(a)*d,u.bounds.x0,u.bounds.x1),y:clamp(u.y+Math.sin(a)*d,u.bounds.y0,u.bounds.y1)};u.a=Math.atan2(u.to.y-u.y,u.to.x-u.x);u.hop=.001}}
 const care=S.care;care.a+=angDiff(care.a,Math.atan2(S.babies[4].y-care.y,S.babies[4].x-care.x))*clamp(dt,0,1);
 S.butter.forEach(f=>{
  f.fp+=dt*f.fs;
  if(f.att>=0){const a=S.babies[f.att];f.cx+=(a.x+Math.cos(a.a)*44*U-f.cx)*clamp(dt*1.2,0,1);f.cy+=(a.y+Math.sin(a.a)*44*U-f.cy)*clamp(dt*1.2,0,1)}
  else{f.dx+=f.vx*dt;if(f.cx+f.dx>W*1.02||f.cx+f.dx<W*.4)f.vx*=-1}
  const nx=f.cx+(f.att>=0?0:f.dx)+f.rx*Math.sin(t*f.sx+f.ph),ny=f.cy+f.ry*Math.sin(t*f.sy+f.ph*1.7);
  f.a=Math.atan2(ny-f.y,nx-f.x);f.x=nx;f.y=ny;
 });
 S.seeds.forEach(s=>{s.x+=s.vx*dt;s.y+=Math.sin(t*.6+s.ph)*6*dt;if(s.x>W*1.05){s.x=W*.35;s.y=H*rr(0,1)}});
}

// ── 프레임 그리기 ──
function rrect(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function frame(){
 const S=scene;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const z=1.03+Math.sin(t*.04)*.01,cx=Math.sin(t*.05)*10*U,cy=Math.cos(t*.045)*7*U;
 c.save();c.translate(W/2+cx,H/2+cy);c.scale(z,z);c.translate(-W/2,-H/2);
 c.drawImage(bg,-60*U,-60*U,W+120*U,H+120*U);
 S.toys.forEach(o=>{c.save();c.translate(o.x,o.y);c.rotate(o.a);shadow(2,3,9*U,8*U,.16);c.fillStyle=o.c;rrect(-8*U,-8*U,16*U,16*U,4*U);c.fill();c.restore()});
 drawBall(S.ball);
 const L=S.babies.concat([S.pup,S.bun,S.kit,S.care,S.mom]).sort((a,b)=>a.y-b.y);
 L.forEach(e=>{
  if(e.k==='baby'){if(e.mode==='sit')drawSit(e,t);else drawCrawl(e,t)}
  else if(e.k==='sitter')drawSitter(e,t);else if(e.k==='puppy')drawPuppy(e,t);else if(e.k==='bunny')drawBunny(e);else if(e.k==='kitten')drawKitten(e,t);
 });
 S.butter.forEach(f=>drawButterfly(f,t));
 S.seeds.forEach(s=>{c.save();c.translate(s.x,s.y);c.scale(U*s.s,U*s.s);c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=.8;for(let i=0;i<8;i++){const a=i/8*TAU;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*6,Math.sin(a)*6);c.stroke()}c.fillStyle='rgba(255,255,255,.95)';c.beginPath();c.arc(0,0,1.3,0,TAU);c.fill();c.restore()});
 c.restore();
 S.canopy.forEach(b=>{const x=b.x+Math.sin(t*.35+b.ph)*10*U,y=b.y+Math.cos(t*.3+b.ph)*8*U;const g=c.createRadialGradient(x,y,0,x,y,b.r);g.addColorStop(0,'rgba(8,60,20,.17)');g.addColorStop(1,'rgba(8,60,20,0)');c.fillStyle=g;c.fillRect(x-b.r,y-b.r,b.r*2,b.r*2)});
 for(let i=0;i<3;i++){const x=((t*(8+i*3)+i*W*.4)%(W*1.6))-W*.3,y=H*(.25+i*.28);const g=c.createRadialGradient(x,y,0,x,y,W*.28);g.addColorStop(0,i%2?'rgba(10,50,20,.08)':'rgba(255,255,230,.16)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
 const v=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,50,30,.26)');c.fillStyle=v;c.fillRect(0,0,W,H);
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
 t=0;for(let i=0;i<200;i++){t+=.05;update(.05,t)}frame();
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
