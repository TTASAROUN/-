// 메인 화면 초록 영역 배경: 하늘에서 내려다본 잔디밭의 아기들 (assets/hero.jpg)
// 사진을 바꾸려면 assets/hero.jpg 파일만 교체하세요.
(function(){
const hero=document.querySelector('.hero');if(!hero)return;
const img=new Image();img.className='hero-media hero-photo';img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';img.src='assets/hero.jpg';
hero.insertBefore(img,hero.firstChild);hero.insertAdjacentHTML('afterbegin','<div class="hero-ov"></div>');
})();
