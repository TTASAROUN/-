// 따사마켓 > 무료나눔: 탭 전환, 나눔 목록, '받고 싶어요' 연결
(function(){
const root=document.getElementById('share-list');if(!root)return;
const CFG=window.SITE_CONFIG||{};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SAMPLE=[ // 데모용 가상 물품
 {title:'접이식 유모차',cat:'유모차·카시트',cond:'거의 새것',area:'서울 강남구 역삼동',desc:'6개월 사용, 바퀴 상태 좋아요.',status:'나눔중'},
 {title:'아기 침대(원목)',cat:'침구·가구',cond:'사용감 있음',area:'서울 서초구 서초동',desc:'매트리스 별도. 조립식이라 분해해서 전달해요.',status:'나눔중'},
 {title:'모유수유 쿠션',cat:'수유용품',cond:'거의 새것',area:'서울 송파구 잠실동',desc:'커버 세탁 완료.',status:'예약중'},
 {title:'신생아 옷 세트(0~6개월)',cat:'아기 옷·신발',cond:'거의 새것',area:'서울 강남구 대치동',desc:'배냇저고리·내의 15벌.',status:'나눔중'},
 {title:'아기 바운서',cat:'장난감·도서',cond:'사용감 있음',area:'서울 강남구 개포동',desc:'건전지 교체 필요.',status:'나눔완료'}
];
const tone={'유모차·카시트':'#e8f2ef','침구·가구':'#fdf0e1','수유용품':'#eef0fb','아기 옷·신발':'#fbeef3','장난감·도서':'#f1f6e6','생활·주방용품':'#eef5f7','기타':'#f1ede4'};
const stCls={'나눔중':'o','예약중':'w','나눔완료':'b'};
function render(items,demo){
 document.getElementById('share-demo').textContent=demo?'아래 물품은 화면 확인용 가상 예시입니다. 접수처 연결 후 실제 물품으로 바뀝니다.':'';
 if(!items.length){root.innerHTML='<div class="todo" style="grid-column:1/-1">아직 등록된 나눔 물품이 없어요. 첫 나눔을 등록해 주세요.</div>';return}
 root.innerHTML=items.map((it,i)=>`<article class="card sh${it.status==='나눔완료'?' done':''}">
  <div class="shph" style="background:${tone[it.cat]||tone['기타']}">${it.photo?`<img src="${esc(it.photo)}" alt="${esc(it.title)} 사진" loading="lazy">`:`<span>${esc(it.cat)}</span>`}</div>
  <p class="tl"><span class="pill ${stCls[it.status]||''}">${esc(it.status||'나눔중')}</span> <span class="tag">${esc(it.cond)}</span></p>
  <h3>${esc(it.title)}</h3><p class="mute">${esc(it.area)}</p><p>${esc(it.desc)}</p>
  <button type="button" class="btn sm" data-want="${i}"${it.status==='나눔완료'?' disabled':''}>${it.status==='나눔완료'?'나눔 완료':'받고 싶어요'}</button></article>`).join('');
 root.onclick=e=>{const b=e.target.closest('[data-want]');if(!b||b.disabled)return;
  const box=document.querySelector('[data-form="shareReq"]'),f=box&&box.querySelector('[name="나눔 물품"]');
  if(f)f.value=items[+b.dataset.want].title;if(box)box.scrollIntoView({behavior:'smooth',block:'center'});};
}
(async function(){
 let items=SAMPLE,demo=true;
 if(CFG.endpoint){try{const j=await (await fetch(CFG.endpoint+'?list=share')).json();if(j.ok){items=j.items;demo=false}}catch(e){}}
 render(items,demo);
})();
})();
